import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface PromptViewerProps {
  promptText: string;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({ promptText }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
          <Ionicons name="checkmark-circle" size={13} color={Theme.colors.success} />
          <Text style={styles.statusText}>PROMPT UNLOCKED</Text>
        </View>
        <Text style={styles.charCount}>
          {promptText.length} characters
        </Text>
      </View>

      <View style={styles.contentBox}>
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={styles.scroll}>
          <Text selectable style={styles.promptText}>
            {promptText}
          </Text>
        </ScrollView>
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    color: Theme.colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  charCount: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: 'System',
  },
  contentBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    maxHeight: 280,
    padding: Theme.spacing.md,
  },
  scroll: {
    maxHeight: 250,
  },
  promptText: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 21,
    fontFamily: 'System',
  },
});
