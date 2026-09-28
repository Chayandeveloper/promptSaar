import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { aiLinksService } from '../services/aiLinks';

interface AIActionButtonsProps {
  promptText: string;
}

export const AIActionButtons: React.FC<AIActionButtonsProps> = ({ promptText }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = async () => {
    await aiLinksService.copyPrompt(promptText);
    setCopied(true);
    showToast('✓ Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleChatGPT = async () => {
    showToast('Copied to clipboard! Launching ChatGPT...');
    await aiLinksService.openChatGPT(promptText);
  };

  const handleGemini = async () => {
    showToast('Copied to clipboard! Launching Gemini...');
    await aiLinksService.openGemini(promptText);
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color="#34D399" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Main Copy Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCopy}
        style={[styles.button, styles.copyButton]}
      >
        <Ionicons
          name={copied ? 'checkmark-circle' : 'copy-outline'}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.copyButtonText}>
          {copied ? '✓ Prompt Copied' : 'Copy Full Prompt'}
        </Text>
      </TouchableOpacity>

      {/* AI Services Row */}
      <View style={styles.servicesRow}>
        {/* ChatGPT */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleChatGPT}
          style={[styles.button, styles.serviceButton, styles.chatgptButton]}
        >
          <Ionicons name="chatbubbles-outline" size={17} color="#10A37F" />
          <Text style={styles.chatgptText}>Open in ChatGPT</Text>
        </TouchableOpacity>

        {/* Gemini */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGemini}
          style={[styles.button, styles.serviceButton, styles.geminiButton]}
        >
          <Ionicons name="sparkles-outline" size={17} color="#38BDF8" />
          <Text style={styles.geminiText}>Open in Gemini</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
    gap: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 4,
  },
  toastText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 8,
  },
  copyButton: {
    backgroundColor: Theme.colors.primary,
    elevation: 3,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceButton: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceElevated,
    borderWidth: 1,
    paddingVertical: 11,
  },
  chatgptButton: {
    borderColor: 'rgba(16, 163, 127, 0.3)',
  },
  chatgptText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  geminiButton: {
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  geminiText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
});
