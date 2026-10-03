import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '../constants/Theme';
import { notificationService } from '../services/notifications';
import { adService } from '../services/ads';
import { AppUpdateModal } from '../components/AppUpdateModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 3, // 3 mins
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Present App Open Ad on app launch if enabled by admin
    adService.presentAppOpenAd().catch((err) => {
      console.log('[AdMob] App open ad error:', err);
    });

    // Register push notification token with backend (safe non-blocking)
    notificationService.registerForPushNotifications().catch((err) => {
      console.log('[NotificationService] Skipped push registration:', err?.message || err);
    });

    // Listen to notification interactions (taps and deep links)
    try {
      const cleanup = notificationService.setupListeners();
      return () => {
        cleanup?.();
      };
    } catch (e) {
      console.log('[NotificationService] Listeners setup:', e);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.background,
          },
          headerTintColor: Theme.colors.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 16,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="rewards"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="prompt/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{
            title: 'Category Prompts',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="unlock-history"
          options={{
            title: 'Unlocked Prompts',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="settings/privacy"
          options={{
            title: 'Privacy Policy',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="settings/terms"
          options={{
            title: 'Terms of Service',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="settings/about"
          options={{
            title: 'About PromptCraft',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
      <AppUpdateModal />
    </QueryClientProvider>
  );
}
