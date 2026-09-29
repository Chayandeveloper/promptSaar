import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { checkAppVersion, getAppVersion, AppVersionResponse } from '../services/versionCheck';

export const AppUpdateModal: React.FC = () => {
  const [versionData, setVersionData] = useState<AppVersionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissedSoftUpdate, setDismissedSoftUpdate] = useState(false);

  const fetchVersion = async () => {
    setLoading(true);
    const data = await checkAppVersion();
    setLoading(false);
    if (data) {
      setVersionData(data);
    }
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  if (!versionData) {
    return null;
  }

  const {
    maintenance_mode,
    maintenance_message,
    needs_force_update,
    needs_soft_update,
    update_url,
    update_title,
    update_message,
    latest_version,
  } = versionData;

  const currentVersion = getAppVersion();

  // 1. Maintenance Mode
  if (maintenance_mode) {
    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 122, 0, 0.12)' }]}>
              <Ionicons name="construct-outline" size={38} color={Theme.colors.secondary} />
            </View>

            <Text style={styles.title}>System Maintenance</Text>
            <Text style={styles.message}>
              {maintenance_message ||
                'Prompt Saar is temporarily undergoing maintenance to bring you exciting improvements. Please check back shortly.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.primaryButton, { backgroundColor: Theme.colors.secondary }]}
              onPress={fetchVersion}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryButtonText}>Check Status</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // 2. Force Update (Non-dismissable)
  if (needs_force_update) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          // Block Android hardware back button
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            {/* Urgent Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>UPDATE REQUIRED</Text>
            </View>

            <View style={styles.iconContainer}>
              <Ionicons name="arrow-up-circle-outline" size={42} color={Theme.colors.primary} />
            </View>

            <Text style={styles.title}>{update_title || 'Update Required'}</Text>

            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Current: v{currentVersion}</Text>
              <Ionicons name="arrow-forward" size={12} color={Theme.colors.textMuted} />
              <Text style={[styles.versionLabel, styles.versionTarget]}>Target: v{latest_version}</Text>
            </View>

            <Text style={styles.message}>
              {update_message ||
                'A new version of Prompt Saar is required to continue. Please update now to experience the latest features and fixes.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => {
                if (update_url) {
                  Linking.openURL(update_url).catch((err) =>
                    console.log('Failed to open update URL:', err)
                  );
                }
              }}
            >
              <Ionicons name="cloud-download-outline" size={19} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // 3. Soft Update (Dismissable for current session)
  if (needs_soft_update && !dismissedSoftUpdate) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDismissedSoftUpdate(true)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(225, 29, 72, 0.08)' }]}>
              <Ionicons name="sparkles-outline" size={38} color={Theme.colors.primary} />
            </View>

            <Text style={styles.title}>{update_title || 'New Update Available'}</Text>

            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Current: v{currentVersion}</Text>
              <Ionicons name="arrow-forward" size={12} color={Theme.colors.textMuted} />
              <Text style={[styles.versionLabel, styles.versionTarget]}>Latest: v{latest_version}</Text>
            </View>

            <Text style={styles.message}>
              {update_message ||
                'A newer version of Prompt Saar is available on the store with fresh prompts and performance upgrades.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => {
                if (update_url) {
                  Linking.openURL(update_url).catch((err) =>
                    console.log('Failed to open update URL:', err)
                  );
                }
              }}
            >
              <Ionicons name="cloud-download-outline" size={19} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Update Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.secondaryButton}
              onPress={() => setDismissedSoftUpdate(true)}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  badge: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 0.8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  versionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  versionTarget: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  message: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: Theme.colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
});
