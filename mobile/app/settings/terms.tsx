import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Theme } from '../../constants/Theme';

export default function TermsScreen() {
  const handleOpenEmail = () => {
    Linking.openURL('mailto:legal@fillosoft.com?subject=Terms%20Inquiry%20-%20Prompt%20Saar').catch(() => {});
  };

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header Summary Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="document-text" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>USER AGREEMENT</Text>
            </View>
            <Text style={styles.versionText}>v1.0</Text>
          </View>

          <Text style={styles.mainTitle}>Terms & Conditions</Text>
          <Text style={styles.effectiveDate}>Last Updated: September 29, 2026</Text>

          <Text style={styles.introSummary}>
            Please review these Terms and Conditions ("Terms") carefully before using Prompt Saar ("App"), developed and published by Fillosoft ("Company", "we", "us", or "our"). By downloading, installing, or accessing the App, you agree to be bound by these Terms.
          </Text>

          <View style={styles.highlightPillRow}>
            <View style={styles.highlightPill}>
              <Ionicons name="checkmark-done-circle" size={13} color={Theme.colors.success} />
              <Text style={styles.highlightText}>Free Commercial Prompt Use</Text>
            </View>
            <View style={styles.highlightPill}>
              <Ionicons name="alert-circle" size={13} color={Theme.colors.accent} />
              <Text style={styles.highlightText}>Coins Have No Cash Value</Text>
            </View>
            <View style={styles.highlightPill}>
              <Ionicons name="shield-checkmark" size={13} color={Theme.colors.primary} />
              <Text style={styles.highlightText}>Fair Ad-Reward Protocol</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Acceptance & Eligibility */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkbox-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>1. Acceptance & Eligibility</Text>
          </View>

          <Text style={styles.paragraph}>
            By accessing or using Prompt Saar, you affirm that you are at least 13 years of age (or the minimum legal age in your jurisdiction) and possess the legal capacity to enter into these binding Terms. If you do not agree to these Terms in full, you must discontinue using and uninstall the App immediately.
          </Text>
        </View>

        {/* Section 2: License & Intellectual Property */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>2. License to Use Prompts</Text>
          </View>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Prompt Usage Rights:</Text> Prompt Saar grants you a worldwide, royalty-free, non-exclusive license to copy, adapt, modify, and execute any prompt texts unlocked on the platform for your personal, educational, and commercial creative projects (e.g. generating images, code, videos, marketing copy, or articles).
          </Text>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>App Intellectual Property:</Text> The App interface, user experience, visual design, custom logos, database structures, compilations, algorithms, and software code are the exclusive intellectual property of Fillosoft and protected by international copyright, trademark, and trade dress laws.
          </Text>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Restrictions:</Text> You may not mass-scrape, mirror, bulk export, resell, or distribute the Prompt Saar database or prompt collection as a competing directory, application, or commercial dataset.
          </Text>
        </View>

        {/* Section 3: Virtual Coins & Reward System */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="diamond-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>3. Virtual Coins & Reward System</Text>
          </View>

          <Text style={styles.paragraph}>
            Prompt Saar features an in-app virtual coin economy designed to provide flexible, free access to premium prompts:
          </Text>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>No Monetary Value:</Text>
              <Text style={styles.bulletBody}>
                Virtual coins are non-monetary digital tokens used exclusively within the App. Coins have no cash value, cannot be redeemed for fiat currency, are non-refundable, and cannot be transferred or sold outside the App.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Earning Mechanisms:</Text>
              <Text style={styles.bulletBody}>
                Coins may be earned by watching sponsored rewarded video advertisements, completing daily reward tasks, or receiving promotional bonuses. Earning rates and daily reward limits (e.g. 5 rewarded ads per day) are established at our discretion and subject to adjustment.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Balance Expiry & Integrity:</Text>
              <Text style={styles.bulletBody}>
                Coins do not expire during regular app operation. However, we reserve the right to revoke coins or reset balances if coins were acquired through exploits, software tampering, or fraudulent ad completion.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Rewarded Advertisements & AdMob */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="play-circle-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>4. Advertisements & Fair Play</Text>
          </View>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Verification Requirement:</Text> To receive coin credits or direct prompt unlocks via rewarded ads, the advertisement must be played to completion in accordance with Google AdMob verification protocols. Dismissing or exiting an ad early voids the reward.
          </Text>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Anti-Tampering:</Text> Use of automated clickers, proxy emulators, ad-blocking software to falsify completions, or network interception tools to trigger unlocks without viewing ads constitutes a material violation of these Terms and will result in device banning.
          </Text>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Third-Party Ad Content:</Text> Advertisements are served by third-party ad networks (Google AdMob). We do not endorse, guarantee, or assume liability for products, services, or claims displayed in third-party advertisements.
          </Text>
        </View>

        {/* Section 5: Third-Party AI Platforms & Outputs */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="hardware-chip-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>5. Third-Party AI Models & Outputs</Text>
          </View>

          <Text style={styles.paragraph}>
            Prompt Saar is an independent prompt curation tool and is not officially affiliated with, endorsed by, or sponsored by OpenAI (ChatGPT), Google (Gemini), Anthropic (Claude), or Midjourney Inc.
          </Text>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Output Disclaimer:</Text>
              <Text style={styles.bulletBody}>
                Generative AI models are stochastic and constantly evolving. We provide prompt formulations as creative starting points and do not warrant that an AI model will generate identical, error-free, or specific outputs.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>User Compliance:</Text>
              <Text style={styles.bulletBody}>
                You agree not to utilize prompts obtained from Prompt Saar to generate content that violates third-party AI providers' Acceptable Use Policies, including hate speech, harassment, illegal advice, or non-consensual imagery.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6: Prohibited Activities */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="ban-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>6. Prohibited Activities</Text>
          </View>

          <Text style={styles.paragraph}>You agree not to engage in any of the following activities:</Text>

          <Text style={styles.paragraph}>
            1. Reverse-engineering, decompiling, disassembling, or extracting source code from the App.
            {'\n'}2. Circumventing security measures, rate-limits, or API authentication barriers.
            {'\n'}3. Deploying automated bots, crawlers, or scraping scripts against our backend servers.
            {'\n'}4. Transmitting malicious code, viruses, or attempting unauthorized database intrusions.
            {'\n'}5. Reselling prompt libraries or access tokens to third parties for commercial gain without written consent.
          </Text>
        </View>

        {/* Section 7: Disclaimer of Warranties */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
          </View>

          <Text style={styles.paragraph}>
            THE APP, ITS CONTENT, PROMPTS, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, FILLOSOFT DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE OPERATION OF THE APP OR BACKEND SERVICES.
          </Text>
        </View>

        {/* Section 8: Limitation of Liability */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="stats-chart-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          </View>

          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FILLOSOFT, ITS DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES ARISING FROM OR RELATING TO YOUR USE OR INABILITY TO USE THE APP.
          </Text>
        </View>

        {/* Section 9: Termination */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="close-circle-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>9. Termination & Modification</Text>
          </View>

          <Text style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify, suspend, or terminate the App or your access to the App at any time, with or without notice, in the event of Terms violations, suspected fraudulent activity, or routine technical maintenance. You may terminate your relationship with us at any time by deleting the App and clearing local data.
          </Text>
        </View>

        {/* Section 10: Governing Law & Contact */}
        <View style={styles.contactCard}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 122, 0, 0.1)' }]}>
              <Ionicons name="business-outline" size={16} color={Theme.colors.accent} />
            </View>
            <Text style={styles.sectionTitle}>10. Governing Law & Contact</Text>
          </View>

          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts.
          </Text>

          <View style={styles.contactInfoBox}>
            <Text style={styles.contactLabel}>Publisher:</Text>
            <Text style={styles.contactValue}>Fillosoft / Prompt Saar</Text>

            <Text style={styles.contactLabel}>Legal Desk:</Text>
            <Text style={styles.contactValue}>legal@fillosoft.com</Text>

            <Text style={styles.contactLabel}>Support Desk:</Text>
            <Text style={styles.contactValue}>support@fillosoft.com</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={handleOpenEmail} style={styles.emailButton}>
            <Ionicons name="mail" size={14} color="#FFFFFF" />
            <Text style={styles.emailButtonText}>Contact Legal Counsel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl + 24,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
    marginBottom: Theme.spacing.md,
    shadowColor: '#E11D48',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  effectiveDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginBottom: 12,
  },
  introSummary: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  highlightPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
    flex: 1,
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '700',
    color: Theme.colors.text,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  bulletDot: {
    fontSize: 16,
    color: Theme.colors.primary,
    lineHeight: 18,
  },
  bulletContent: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  bulletBody: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 17,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
    marginBottom: Theme.spacing.md,
    shadowColor: '#FF7A00',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  contactInfoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.lg,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
