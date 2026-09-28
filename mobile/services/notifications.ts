import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { isRunningInExpoGo } from 'expo';
import { api } from './api';
import { getDeviceId } from './storage';

/**
 * Safely load expo-notifications only outside of Expo Go on Android.
 * (Expo SDK 53+ removed remote FCM push support from the Expo Go Android binary,
 * so importing it statically inside Expo Go throws an intentional exception).
 */
function getNotifications() {
  if (Platform.OS === 'android' && isRunningInExpoGo()) {
    return null;
  }
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

// Configure how notifications appear when app is in foreground (for standalone/dev builds)
const Notifications = getNotifications();
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority?.HIGH ?? 4,
      }),
    });
  } catch (e) {
    console.warn('[NotificationService] setNotificationHandler skipped:', e);
  }
}

export interface NotificationPayload {
  title?: string;
  body?: string;
  data?: {
    type?: 'prompt' | 'rewards' | 'home';
    prompt_id?: number | string;
    url?: string;
    [key: string]: any;
  };
}

export const notificationService = {
  /**
   * Request permission and register token with backend.
   */
  async registerForPushNotifications(): Promise<string | null> {
    const NotificationsModule = getNotifications();
    if (!NotificationsModule) {
      if (Platform.OS === 'android' && isRunningInExpoGo()) {
        console.log(
          '[NotificationService] Running in Expo Go (Android): Remote push notifications require a development build (npx expo run:android) or standalone APK. Push notifications will be active in built app.'
        );
      }
      return null;
    }

    if (!Device.isDevice) {
      console.log('[NotificationService] Running on simulator/emulator - push tokens may be simulated.');
    }

    try {
      // 1. Check existing permission
      const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 2. Ask if not yet granted
      if (existingStatus !== 'granted') {
        const { status } = await NotificationsModule.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationService] Notification permission not granted');
        return null;
      }

      // 3. Set Android notification channel
      if (Platform.OS === 'android') {
        await NotificationsModule.setNotificationChannelAsync('default', {
          name: 'General Notifications',
          importance: NotificationsModule.AndroidImportance?.MAX ?? 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
          sound: 'default',
        });
      }

      // 4. Retrieve push token
      let token: string | null = null;
      let tokenType: 'fcm' | 'expo' = 'fcm';

      try {
        // Try getting native FCM token first (for Android APK / standalone builds with google-services.json)
        const deviceTokenRes = await NotificationsModule.getDevicePushTokenAsync();
        if (deviceTokenRes?.data) {
          token = deviceTokenRes.data;
          tokenType = 'fcm';
        }
      } catch (fcmErr) {
        // Fallback for environments without native Google Services
        try {
          const expoTokenRes = await NotificationsModule.getExpoPushTokenAsync();
          if (expoTokenRes?.data) {
            token = expoTokenRes.data;
            tokenType = 'expo';
          }
        } catch (expoErr) {
          console.warn('[NotificationService] Could not retrieve push token:', expoErr);
        }
      }

      if (!token) {
        return null;
      }

      // 5. Send token to Laravel backend
      const deviceId = await getDeviceId();
      await api.post('/notifications/register-token', {
        device_id: deviceId,
        push_token: token,
        token_type: tokenType,
        platform: Platform.OS,
      });

      console.log(`[NotificationService] Registered ${tokenType.toUpperCase()} token with server:`, token);
      return token;
    } catch (err) {
      console.warn('[NotificationService] Failed to register push token:', err);
      return null;
    }
  },

  /**
   * Set up listeners for received notifications and tap actions.
   */
  setupListeners(onNotificationReceived?: (notification: any) => void) {
    const NotificationsModule = getNotifications();
    if (!NotificationsModule) {
      return () => {};
    }

    try {
      // When notification is received while foregrounded
      const receivedSub = NotificationsModule.addNotificationReceivedListener((notification: any) => {
        console.log('[NotificationService] Foreground notification received:', notification);
        onNotificationReceived?.(notification);
      });

      // When user taps on notification
      const responseSub = NotificationsModule.addNotificationResponseReceivedListener((response: any) => {
        console.log('[NotificationService] User interacted with notification:', response);
        const data = response?.notification?.request?.content?.data as NotificationPayload['data'];

        if (!data) return;

        if (data.type === 'prompt' && data.prompt_id) {
          router.push(`/prompt/${data.prompt_id}` as any);
        } else if (data.type === 'rewards') {
          router.push('/rewards' as any);
        } else if (data.type === 'home') {
          router.push('/(tabs)/' as any);
        }
      });

      return () => {
        receivedSub?.remove?.();
        responseSub?.remove?.();
      };
    } catch (err) {
      console.warn('[NotificationService] Could not bind notification listeners:', err);
      return () => {};
    }
  },
};
