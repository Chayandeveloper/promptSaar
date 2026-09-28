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
          <Ionicons name="checkmark-circle" size={13} color="#34D399" />
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
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    color: '#34D399',
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
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    maxHeight: 280,
    padding: Theme.spacing.md,
  },
  scroll: {
    maxHeight: 250,
  },
  promptText: {
    fontSize: 13,
    color: '#F1F5F9',
    lineHeight: 21,
    fontFamily: 'System',
  },
});
