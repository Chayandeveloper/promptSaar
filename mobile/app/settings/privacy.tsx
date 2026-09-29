import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Theme } from '../../constants/Theme';

export default function PrivacyPolicyScreen() {
  const handleOpenEmail = () => {
    Linking.openURL('mailto:support@fillosoft.com?subject=Privacy%20Inquiry%20-%20Prompt%20Saar').catch(() => {});
  };

  const handleOpenGooglePolicy = () => {
    Linking.openURL('https://policies.google.com/privacy').catch(() => {});
  };

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header Summary Banner */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>PRIVACY & DATA PROTECTION</Text>
            </View>
            <Text style={styles.versionText}>v1.0</Text>
          </View>

          <Text style={styles.mainTitle}>Privacy Policy</Text>
          <Text style={styles.effectiveDate}>Effective Date: September 29, 2026</Text>

          <Text style={styles.introSummary}>
            Prompt Saar ("we", "our", or "us"), provided by Fillosoft, values your trust. This Privacy Policy outlines our transparent practices regarding data collection, usage, third-party integrations, and your individual privacy rights when using our mobile application.
          </Text>

          <View style={styles.highlightPillRow}>
            <View style={styles.highlightPill}>
              <Ionicons name="checkmark-circle" size={13} color={Theme.colors.success} />
              <Text style={styles.highlightText}>No Selling of Personal Data</Text>
            </View>
            <View style={styles.highlightPill}>
              <Ionicons name="lock-closed" size={13} color={Theme.colors.primary} />
              <Text style={styles.highlightText}>TLS/HTTPS Encrypted API</Text>
            </View>
            <View style={styles.highlightPill}>
              <Ionicons name="phone-portrait-outline" size={13} color={Theme.colors.accent} />
              <Text style={styles.highlightText}>Local Device Persistence</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Information We Collect */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="folder-open-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>

          <Text style={styles.paragraph}>
            We collect minimal information necessary to deliver prompt discovery, rewarded unlocks, and persistent synchronization across app sessions:
          </Text>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Device & Installation Identifiers</Text>
              <Text style={styles.bulletBody}>
                An anonymous cryptographically generated unique device ID stored locally in SecureStore to keep track of your unlocked prompts, coin balances, and saved bookmarks without requiring mandatory social logins.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>App Interaction & Activity Data</Text>
              <Text style={styles.bulletBody}>
                Records of prompts you search, bookmark, or unlock, and coin ledger transactions (e.g. ad reward completions, prompt unlocks) to prevent loss of your library.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Push Notification Tokens</Text>
              <Text style={styles.bulletBody}>
                When notifications are enabled, we collect your Firebase Cloud Messaging (FCM) registration token to deliver push notifications about newly released prompts, reward opportunities, and platform updates.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Technical & Diagnostic Information</Text>
              <Text style={styles.bulletBody}>
                Standard network diagnostics including IP address, operating system version (Android/iOS), app version, and crash logs to maintain uptime and performance.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: How We Use Your Data */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="cog-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          </View>

          <Text style={styles.paragraph}>
            Your information is strictly utilized for the following legitimate operational purposes:
          </Text>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Core App Functionality:</Text>
              <Text style={styles.bulletBody}>
                Facilitating prompt viewing, copy-to-clipboard actions, AI deep linking, and maintaining your unlocked library.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Virtual Economy & Anti-Fraud:</Text>
              <Text style={styles.bulletBody}>
                Crediting coins upon verified video ad completion, applying daily quota limits, and preventing automated exploit scripts or unlock tampering.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Communications:</Text>
              <Text style={styles.bulletBody}>
                Sending occasional notifications regarding new AI prompts or system notifications (you can opt out anytime in device settings).
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: Advertising & Third-Party SDKs */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="megaphone-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>3. Third-Party Services & AdMob</Text>
          </View>

          <Text style={styles.paragraph}>
            Prompt Saar displays rewarded advertisements to make premium AI prompts accessible without mandatory upfront fees. We partner with reputable providers:
          </Text>

          <View style={styles.subCard}>
            <Text style={styles.subCardTitle}>Google AdMob (Google LLC)</Text>
            <Text style={styles.subCardBody}>
              Google AdMob uses advertising identifiers (such as Google Advertising ID or IDFA) and cookies/SDK telemetry to serve relevant ads and verify reward playback. For more details on Google's privacy practices:
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleOpenGooglePolicy} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Review Google's Privacy & Terms</Text>
              <Ionicons name="open-outline" size={13} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.subCard}>
            <Text style={styles.subCardTitle}>Firebase Cloud Messaging (Google LLC)</Text>
            <Text style={styles.subCardBody}>
              Used exclusively for push notification dispatch and delivery confirmation. No personal message contents are shared.
            </Text>
          </View>
        </View>

        {/* Section 4: AI Providers & Deep Linking */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>4. External AI Platforms</Text>
          </View>

          <Text style={styles.paragraph}>
            Prompt Saar offers one-tap bridges to launch OpenAI ChatGPT and Google Gemini. When you tap "Open in ChatGPT" or "Open in Gemini":
          </Text>

          <Text style={styles.paragraph}>
            • The prompt text is copied to your device clipboard or passed via standard deep link protocols.
            {'\n'}• Your interaction within third-party AI platforms is governed independently by OpenAI's or Google's respective Terms and Privacy Policies.
            {'\n'}• Prompt Saar does not receive, read, or store any conversational outputs you generate inside external AI apps.
          </Text>
        </View>

        {/* Section 5: Data Retention & Security */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>5. Data Retention & Security</Text>
          </View>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Security Measures:</Text> All communications between Prompt Saar and our backend servers are encrypted using modern Transport Layer Security (TLS/HTTPS). Authentication tokens are stored using device hardware-backed secure storage.
          </Text>

          <Text style={styles.paragraph}>
            • <Text style={styles.boldText}>Retention Period:</Text> We retain device activity logs and unlocked prompt records for as long as necessary to provide service continuity. Inactive device records are archived or anonymized in accordance with applicable retention schedules.
          </Text>
        </View>

        {/* Section 6: User Rights & Local Data Controls */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-circle-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>6. Your Rights & Choices</Text>
          </View>

          <Text style={styles.paragraph}>
            Depending on your jurisdiction (including GDPR, CCPA/CPRA, and India's Digital Personal Data Protection Act), you have rights regarding your data:
          </Text>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Clear Local App Data:</Text>
              <Text style={styles.bulletBody}>
                You can instantly delete all cached prompts, device identifiers, and bookmarks directly inside the app under Profile → "Clear Local App Data".
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Push Notification Controls:</Text>
              <Text style={styles.bulletBody}>
                You may disable notification permissions at any time via your device's operating system Application Settings.
              </Text>
            </View>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Ad Tracking Opt-Out:</Text>
              <Text style={styles.bulletBody}>
                You can reset or opt out of personalized ads by adjusting Google Advertising ID settings on Android or tracking permissions on iOS.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 7: Children's Privacy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="people-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          </View>

          <Text style={styles.paragraph}>
            Prompt Saar is not intended for use by children under the age of 13 (or under 16 in the European Economic Area). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we take immediate steps to delete such records from our servers.
          </Text>
        </View>

        {/* Section 8: Changes to this Policy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="refresh-outline" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>8. Changes to this Policy</Text>
          </View>

          <Text style={styles.paragraph}>
            We may periodically update our Privacy Policy to reflect app enhancements or legal obligations. When changes are made, the revised policy will be posted with an updated "Effective Date". Continued use of Prompt Saar following any updates constitutes acceptance of the modified policy.
          </Text>
        </View>

        {/* Section 9: Contact Information */}
        <View style={styles.contactCard}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 122, 0, 0.1)' }]}>
              <Ionicons name="mail-outline" size={16} color={Theme.colors.accent} />
            </View>
            <Text style={styles.sectionTitle}>9. Contact & Grievance Officer</Text>
          </View>

          <Text style={styles.paragraph}>
            If you have any questions, concerns, or data deletion requests regarding this Privacy Policy, please reach out to our privacy and compliance desk:
          </Text>

          <View style={styles.contactInfoBox}>
            <Text style={styles.contactLabel}>Entity:</Text>
            <Text style={styles.contactValue}>Fillosoft / Prompt Saar</Text>

            <Text style={styles.contactLabel}>Developer Desk:</Text>
            <Text style={styles.contactValue}>support@fillosoft.com</Text>

            <Text style={styles.contactLabel}>Subject Line:</Text>
            <Text style={styles.contactValue}>Privacy / Data Inquiries</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={handleOpenEmail} style={styles.emailButton}>
            <Ionicons name="send" size={14} color="#FFFFFF" />
            <Text style={styles.emailButtonText}>Email Privacy Team</Text>
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
  subCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 8,
    marginBottom: 8,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  subCardBody: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
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
