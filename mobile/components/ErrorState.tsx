import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to connect to the PromptCraft API.',
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline-outline" size={32} color={Theme.colors.danger} />
      </View>
      <Text style={styles.title}>Connection Issue</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity activeOpacity={0.85} onPress={onRetry} style={styles.retryButton}>
          <Ionicons name="refresh" size={15} color="#FFFFFF" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: Theme.spacing.lg,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.surfaceElevated,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: Theme.borderRadius.lg,
  },
  retryText: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
