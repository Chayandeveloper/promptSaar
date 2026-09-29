import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Theme } from '../../constants/Theme';
import { Config } from '../../constants/Config';

export default function SettingsScreen() {
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoCopy, setAutoCopy] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Haptic Feedback</Text>
              <Text style={styles.rowSub}>Vibrate upon copying or unlocking prompts</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Auto-Copy on Unlock</Text>
              <Text style={styles.rowSub}>Automatically copy prompt text once unlocked</Text>
            </View>
            <Switch
              value={autoCopy}
              onValueChange={setAutoCopy}
              trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Personalized Ads</Text>
              <Text style={styles.rowSub}>Use Google AdMob personalized targeting</Text>
            </View>
            <Switch
              value={personalizedAds}
              onValueChange={setPersonalizedAds}
              trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DEVELOPMENT & TELEMETRY</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Central Backend API</Text>
            <Text style={styles.infoValue}>{Config.API_URL}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AdMob Rewarded Unit</Text>
            <Text style={styles.infoValue}>Google Test ID</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>v1.0.0 (Production)</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Theme.spacing.md,
  },
  section: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowText: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  rowSub: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text,
    fontFamily: 'System',
  },
});
