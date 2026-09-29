import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Theme } from '../../constants/Theme';

export default function AboutScreen() {
  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.brandCard}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Prompt Saar</Text>
          <Text style={styles.version}>Version 1.0.0 (Ideas • Prompts • Results)</Text>
          <Text style={styles.description}>
            Prompt Saar is a premier AI prompt discovery and unlocking platform connecting creators with state-of-the-art system prompts for ChatGPT, Gemini, Midjourney, Claude, and Sora.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform Architecture</Text>
          <Text style={styles.featureItem}>
            • <Text style={styles.bold}>Central Backend API:</Text> Unified Laravel Sanctum REST API powering both the mobile app and administrative dashboard.
          </Text>
          <Text style={styles.featureItem}>
            • <Text style={styles.bold}>Google AdMob Rewarded Engine:</Text> Safe reward validation ensuring legitimate unlock records before prompt text is transmitted.
          </Text>
          <Text style={styles.featureItem}>
            • <Text style={styles.bold}>1-Click Bridge:</Text> Seamless clipboard and deep linking to ChatGPT and Google Gemini.
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
  brandCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  version: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  featureItem: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: Theme.colors.text,
  },
});
