import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';

export type UnlockState = 'idle' | 'loading_ad' | 'watching_ad' | 'unlocking' | 'success' | 'error' | 'early_close';

interface UnlockButtonProps {
  state: UnlockState;
  onPress: () => void;
  errorMessage?: string | null;
}

export const UnlockButton: React.FC<UnlockButtonProps> = ({
  state,
  onPress,
  errorMessage,
}) => {
  if (state === 'success') {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
        <Text style={styles.successText}>Prompt Unlocked Successfully!</Text>
      </View>
    );
  }

  const isLoading = state === 'loading_ad' || state === 'watching_ad' || state === 'unlocking';

  return (
    <View style={styles.wrapper}>
      {/* Early Close Notice */}
      {state === 'early_close' && (
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={16} color={Theme.colors.coin} />
          <Text style={styles.warningText}>
            The prompt wasn't unlocked because the advertisement was not completed.
          </Text>
        </View>
      )}

      {/* Error Notice */}
      {state === 'error' && (
        <View style={styles.errorBox}>
          <Ionicons name="close-circle" size={16} color={Theme.colors.danger} />
          <Text style={styles.errorText}>
            {errorMessage || "We couldn't load the advertisement. Please try again."}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        disabled={isLoading}
        style={styles.touchable}
      >
        <LinearGradient
          colors={['#E11D48', '#FF7A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {state === 'loading_ad'
                  ? 'Preparing your reward...'
                  : state === 'watching_ad'
                  ? 'Playing AdMob reward...'
                  : 'Verifying with server...'}
              </Text>
            </View>
          ) : (
            <View style={styles.contentRow}>
              <Ionicons name="lock-open" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {state === 'error' || state === 'early_close' ? 'Try Again' : 'Unlock Prompt with Ad'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.disclaimerText}>
        ✨ Watch a single short rewarded video to unlock this prompt permanently.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
  },
  touchable: {
    width: '100%',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  disclaimerText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: Theme.spacing.md,
    width: '100%',
  },
  successText: {
    color: Theme.colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    marginVertical: Theme.spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
    borderRadius: Theme.borderRadius.md,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  warningText: {
    flex: 1,
    color: '#FF7A00',
    fontSize: 11,
    lineHeight: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
    borderRadius: Theme.borderRadius.md,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    flex: 1,
    color: '#BE123C',
    fontSize: 11,
    lineHeight: 15,
  },
});
