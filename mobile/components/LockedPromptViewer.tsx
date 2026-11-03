import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface LockedPromptViewerProps {
  promptCost?: number;
  userCoins: number;
  hasEnoughCoins: boolean;
  onUnlockPress: () => void;
  promptTitle?: string;
  categoryName?: string;
  isUnlocking?: boolean;
}

export const LockedPromptViewer: React.FC<LockedPromptViewerProps> = ({
  promptCost,
  userCoins,
  hasEnoughCoins,
  onUnlockPress,
  promptTitle,
  isUnlocking = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Compact Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
          <Ionicons name="lock-closed" size={11} color="#E11D48" />
          <Text style={styles.statusText}>LOCKED PROMPT</Text>
        </View>

        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>
            🪙 {userCoins} {userCoins === 1 ? 'Coin' : 'Coins'}
          </Text>
        </View>
      </View>

      {/* Compact Premium Frosted Unlock Card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onUnlockPress}
        disabled={isUnlocking}
        style={styles.contentBox}
      >
        {/* Background Simulated AI Prompt Text (Blurred) */}
        <View style={styles.blurredTextContainer} pointerEvents="none">
          <Text style={styles.blurredPromptParagraph} numberOfLines={3}>
            Create an ultra-detailed, 8K masterpiece featuring {promptTitle || 'cinematic visual'}.
            Crafted with dramatic volumetric lighting, soft ambient occlusion, and hyperrealistic
            subsurface scattering. Shot on 85mm f/1.4 prime lens with creamy bokeh...
          </Text>
          <Text style={styles.blurredPromptParams} numberOfLines={1}>
            --ar 9:16 --v 6.1 --stylize 400 --quality 2 --no blur, watermark
          </Text>
        </View>

        {/* Native Blur Layer */}
        {Platform.OS !== 'web' ? (
          <BlurView
            intensity={Platform.OS === 'ios' ? 40 : 55}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {/* Frosted Glass Scrim */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.72)',
            'rgba(248, 250, 252, 0.90)',
            'rgba(248, 250, 252, 0.96)',
          ]}
          style={StyleSheet.absoluteFill}
        />

        {/* Compact Centered Unlock Content */}
        <View style={styles.overlayContent}>
          <View style={styles.topInfoRow}>
            <LinearGradient
              colors={['#FFE4E6', '#FECDD3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lockIconCircle}
            >
              <Ionicons name="lock-closed" size={16} color="#E11D48" />
            </LinearGradient>

            <View style={styles.titleTextWrap}>
              <Text style={styles.overlayTitle}>Prompt Text Hidden</Text>
              <Text style={styles.overlaySubtitle} numberOfLines={1}>
                Unlock full prompt, parameters &amp; 1-tap AI copy
              </Text>
            </View>
          </View>

          {/* Sleek Standard Unlock CTA Button */}
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={isUnlocking}
            onPress={onUnlockPress}
            style={[styles.unlockCTAWrapper, isUnlocking && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={['#E11D48', '#FF7A00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.unlockCTAButton}
            >
              {isUnlocking ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="flash" size={15} color="#FFFFFF" />
              )}
              <Text style={styles.unlockCTAText}>
                {isUnlocking
                  ? 'Unlocking...'
                  : hasEnoughCoins && promptCost
                  ? `Unlock Prompt (${promptCost} Coins)`
                  : 'Unlock Prompt Now'}
              </Text>
              {!isUnlocking && (
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Subtle Included Features Strip */}
          <View style={styles.featuresStrip}>
            <View style={styles.featureChip}>
              <Ionicons name="copy-outline" size={11} color="#64748B" />
              <Text style={styles.featureChipText}>1-Tap Copy</Text>
            </View>
            <View style={styles.featureDot} />
            <View style={styles.featureChip}>
              <Ionicons name="chatbubbles-outline" size={11} color="#10B981" />
              <Text style={styles.featureChipText}>ChatGPT</Text>
            </View>
            <View style={styles.featureDot} />
            <View style={styles.featureChip}>
              <Ionicons name="sparkles-outline" size={11} color="#FF7A00" />
              <Text style={styles.featureChipText}>Gemini</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  statusText: {
    color: '#E11D48',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  balancePill: {
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: Theme.borderRadius.full,
  },
  balanceText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  contentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.16)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  blurredTextContainer: {
    ...StyleSheet.absoluteFill,
    padding: 14,
    opacity: 0.28,
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(3.5px)',
          userSelect: 'none',
        }
      : {}),
  },
  blurredPromptParagraph: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    fontFamily: 'System',
  },
  blurredPromptParams: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  overlayContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 10,
    gap: 11,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  titleTextWrap: {
    flex: 1,
  },
  overlayTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  overlaySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  unlockCTAWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  unlockCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  unlockCTAText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  featuresStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 2,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  featureDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
});
