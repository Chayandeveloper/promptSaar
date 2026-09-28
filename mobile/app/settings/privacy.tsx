import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Theme } from '../../constants/Theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.date}>Effective Date: September 2026</Text>

          <Text style={styles.paragraph}>
            PromptCraft ("we", "our", or "us") respects your privacy and is dedicated to protecting your personal data. This policy explains how information is handled when using the PromptCraft mobile app and services.
          </Text>

          <Text style={styles.sectionTitle}>1. Data We Collect</Text>
          <Text style={styles.paragraph}>
            • Account details: Name, email address, and encrypted credentials stored securely.
            {'\n'}• Prompt engagement: Unlocked prompts and bookmarked items to sync your personal library.
            {'\n'}• Device & ad telemetry: Google AdMob collects anonymous identifiers to serve rewarded advertisements and verify reward delivery.
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Data</Text>
          <Text style={styles.paragraph}>
            We use your data solely to provide, personalize, and synchronize your prompt library across devices. We do not sell your personal data to any third parties.
          </Text>

          <Text style={styles.sectionTitle}>3. Google AdMob</Text>
          <Text style={styles.paragraph}>
            Rewarded video ads are served via Google AdMob. AdMob may process device identifiers and approximate geographic location in accordance with Google's Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primaryLight,
    marginTop: Theme.spacing.md,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 19,
  },
});
