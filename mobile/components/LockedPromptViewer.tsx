import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface LockedPromptViewerProps {
  promptCost: number;
  userCoins: number;
  hasEnoughCoins: boolean;
  onUnlockPress: () => void;
  promptTitle?: string;
  categoryName?: string;
}

export const LockedPromptViewer: React.FC<LockedPromptViewerProps> = ({
  promptCost,
  userCoins,
  hasEnoughCoins,
  onUnlockPress,
  promptTitle,
  categoryName,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Row — Mirrored with PromptViewer for seamless UI feel */}
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
          <Ionicons name="lock-closed" size={13} color="#E11D48" />
          <Text style={styles.statusText}>PROMPT LOCKED</Text>
        </View>
        <View style={styles.clearHintPill}>
          <Ionicons name="sparkles" size={12} color="#F59E0B" />
          <Text style={styles.clearHintText}>Text clears after unlock</Text>
        </View>
      </View>

      {/* Main Content Box with Blurred Text in Background */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onUnlockPress}
        style={styles.contentBox}
      >
        {/* Background Simulated AI Prompt Text (Blurred) */}
        <View style={styles.blurredTextContainer} pointerEvents="none">
          <Text style={styles.blurredPromptParagraph}>
            Create an ultra-detailed, 8K masterpiece featuring {promptTitle || 'cinematic visual'}. 
            Crafted with dramatic volumetric lighting, soft ambient occlusion, and hyperrealistic 
            subsurface scattering. Shot using an 85mm f/1.4 prime lens with shallow depth of field, 
            creamy bokeh highlights, and rich cinematic color grading. Highly detailed textures, 
            natural highlights, ray-traced reflections, and Unreal Engine 5 render style.
          </Text>

          <Text style={[styles.blurredPromptParagraph, { marginTop: 10 }]}>
            Detailed atmospheric particles in the foreground, perfect anatomy, studio quality lighting, 
            composition following the rule of thirds, intricate shading, sharp focus, 
            editorial photography style.
          </Text>

          <Text style={[styles.blurredPromptParams, { marginTop: 12 }]}>
            --ar 16:9 --v 6.1 --stylize 400 --quality 2 --chaos 5 --no blur, distortion, watermark
          </Text>

          <Text style={[styles.blurredPromptParagraph, { marginTop: 10 }]}>
            Optimized for Midjourney v6, Stable Diffusion XL, DALL-E 3, and Leonardo AI.
          </Text>
        </View>

        {/* Expo BlurView Layer */}
        {Platform.OS !== 'web' ? (
          <BlurView
            intensity={Platform.OS === 'ios' ? 45 : 60}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {/* Frosted Scrim Overlay (Guarantees modern frosted look across all platforms) */}
        <LinearGradient
          colors={[
            'rgba(248, 249, 250, 0.70)',
            'rgba(248, 249, 250, 0.88)',
            'rgba(248, 249, 250, 0.94)',
          ]}
          style={StyleSheet.absoluteFill}
        />

        {/* Floating Unlock Card Overlay in the center */}
        <View style={styles.overlayContent}>
          {/* Lock Icon */}
          <View style={styles.lockBadgeWrap}>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={24} color="#E11D48" />
            </View>
            <View style={styles.sparkleDot}>
              <Ionicons name="sparkles" size={11} color="#FFFFFF" />
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.overlayTitle}>Prompt Text Hidden</Text>
          <Text style={styles.overlaySubtitle}>
            Unlock to reveal the full prompt text, parameters &amp; AI export tools.
          </Text>

          {/* Coin & Cost Badge */}
          <View style={styles.costBadgeRow}>
            <View style={styles.costChip}>
              <Text style={styles.costChipText}>🪙 {promptCost} Coins</Text>
            </View>
            <Text style={styles.costOrText}>or</Text>
            <View style={styles.freeChip}>
              <Ionicons name="play-circle" size={13} color="#E11D48" />
              <Text style={styles.freeChipText}>Free Ad</Text>
            </View>
          </View>

          {/* Primary Unlock CTA Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onUnlockPress}
            style={styles.unlockCTAButton}
          >
            <Ionicons name="flash" size={16} color="#FFFFFF" />
            <Text style={styles.unlockCTAText}>Unlock Prompt Now</Text>
            <Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>

          {/* User Balance Hint */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Your Balance: </Text>
            <Text style={[styles.balanceValue, { color: hasEnoughCoins ? Theme.colors.success : '#FF7A00' }]}>
              🪙 {userCoins} Coins
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Locked AI Actions Preview Bar (Shows users that Copy & AI links become available after unlock) */}
      <View style={styles.lockedActionsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onUnlockPress}
          style={[styles.lockedActionButton, styles.lockedCopyButton]}
        >
          <Ionicons name="lock-closed-outline" size={15} color={Theme.colors.textMuted} />
          <Text style={styles.lockedActionText}>Copy Full Prompt (Locked)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onUnlockPress}
          style={styles.lockedIconBtn}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={15} color={Theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onUnlockPress}
          style={styles.lockedIconBtn}
        >
          <Ionicons name="sparkles-outline" size={15} color={Theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
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
    gap: 5,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    color: '#E11D48',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  clearHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  clearHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  contentBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 280,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  blurredTextContainer: {
    padding: Theme.spacing.md,
    opacity: 0.38,
    // Add text blur effect for web / android fallback
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(3.5px)',
          userSelect: 'none',
        }
      : {}),
  },
  blurredPromptParagraph: {
    fontSize: 13,
    lineHeight: 21,
    color: '#334155',
    fontFamily: 'System',
    letterSpacing: -0.1,
  },
  blurredPromptParams: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  overlayContent: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    zIndex: 10,
  },
  lockBadgeWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  lockIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  sparkleDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  overlayTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  overlaySubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 290,
    marginBottom: 12,
  },
  costBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  costChip: {
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
  },
  costChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7A00',
  },
  costOrText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  freeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
  },
  freeChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  unlockCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: Theme.borderRadius.lg,
    width: '100%',
    maxWidth: 270,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  unlockCTAText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  balanceLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  balanceValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  lockedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  lockedActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    backgroundColor: '#F1F5F9',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lockedCopyButton: {
    opacity: 0.75,
  },
  lockedActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
  lockedIconBtn: {
    width: 42,
    height: 42,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
  },
});
