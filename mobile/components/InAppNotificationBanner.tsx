import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { Theme } from '../constants/Theme';

interface NotificationData {
  id: number;
  title: string;
  body: string;
  image_url?: string;
  action_type: string;
  target_id?: string;
  data?: any;
}

export const InAppNotificationBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const shownIdsRef = useRef<Set<number>>(new Set());
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Check for newly dispatched or scheduled notifications that just fired
    const checkForNotifications = async () => {
      try {
        const res: any = await api.get('/notifications/latest');

        if (!isMounted) return;

        const list: NotificationData[] = res?.notifications || [];
        if (list.length > 0) {
          const newest = list[0];
          if (newest && !shownIdsRef.current.has(newest.id)) {
            shownIdsRef.current.add(newest.id);

            // If sent in the last 15 minutes, display banner
            const sentTimestamp = (newest as any).sent_at || (newest as any).created_at;
            const sentTime = sentTimestamp ? new Date(sentTimestamp).getTime() : Date.now();
            const diffMs = Date.now() - sentTime;

            if (diffMs < 15 * 60 * 1000) {
              console.log('[NotificationBanner] 🔔 Displaying in-app notification:', newest.title);
              showBanner(newest);
            }
          }
        }
      } catch (e) {
        // Silently skip if network offline
      }
    };

    // Immediate check on mount
    checkForNotifications();

    // Fast poll every 3.5 seconds so timer triggers are caught instantly
    const interval = setInterval(checkForNotifications, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showBanner = (notif: NotificationData) => {
    setCurrentNotification(notif);

    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.spring(slideAnim, {
      toValue: insets.top > 0 ? insets.top + 8 : 16,
      useNativeDriver: true,
      bounciness: 6,
    }).start();

    // Auto dismiss after 8 seconds
    timerRef.current = setTimeout(() => {
      dismissBanner();
    }, 8000);
  };

  const dismissBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentNotification(null);
    });
  };

  const handlePress = () => {
    if (!currentNotification) return;

    const notif = currentNotification;
    dismissBanner();

    try {
      if (notif.action_type === 'prompt' && notif.target_id) {
        router.push(`/prompt/${notif.target_id}` as any);
      } else if (notif.action_type === 'rewards') {
        router.push('/rewards' as any);
      } else if (notif.action_type === 'home') {
        router.push('/(tabs)/' as any);
      }
    } catch (e) {
      console.warn('[NotificationBanner] Navigation error:', e);
    }
  };

  if (!currentNotification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.innerCard}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={18} color="#FFFFFF" />
        </View>

        <View style={styles.textWrap}>
          <View style={styles.headerRow}>
            <Text style={styles.appName}>PromptCraft</Text>
            <Text style={styles.timeTag}>Now</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {currentNotification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {currentNotification.body}
          </Text>
        </View>

        {currentNotification.image_url ? (
          <Image
            source={{ uri: currentNotification.image_url }}
            style={styles.thumbImage}
          />
        ) : null}

        <TouchableOpacity
          onPress={dismissBanner}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
    marginRight: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  appName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818CF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeTag: {
    fontSize: 9,
    color: '#94A3B8',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  thumbImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 6,
  },
  closeBtn: {
    padding: 4,
    alignSelf: 'flex-start',
  },
});
