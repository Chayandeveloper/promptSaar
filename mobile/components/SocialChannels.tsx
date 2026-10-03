import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { Theme } from '../constants/Theme';

interface SocialChannelsProps {
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  iconsOnly?: boolean;
}

export const SocialChannels: React.FC<SocialChannelsProps> = ({
  style,
  noPadding = false,
  iconsOnly = false,
}) => {
  const { data: links } = useSocialLinks();

  const handleOpen = async (channel: 'whatsapp' | 'instagram' | 'telegram') => {
    let target = '';

    if (channel === 'whatsapp') {
      const raw = links?.whatsapp?.trim() || '';
      if (!raw || raw === 'https://wa.me/') {
        target = 'https://whatsapp.com';
      } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
        target = raw;
      } else {
        const cleanNumber = raw.replace(/[^0-9]/g, '');
        target = cleanNumber ? `https://wa.me/${cleanNumber}` : 'https://whatsapp.com';
      }
    } else if (channel === 'instagram') {
      const raw = links?.instagram?.trim() || '';
      if (!raw || raw === 'https://instagram.com/') {
        target = 'https://instagram.com';
      } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
        target = raw;
      } else {
        const handle = raw.replace(/^@/, '');
        target = `https://instagram.com/${handle}`;
      }
    } else if (channel === 'telegram') {
      const raw = links?.telegram?.trim() || '';
      if (!raw || raw === 'https://t.me/') {
        target = 'https://t.me';
      } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
        target = raw;
      } else {
        const handle = raw.replace(/^@/, '');
        target = `https://t.me/${handle}`;
      }
    }

    try {
      const supported = await Linking.canOpenURL(target);
      if (supported) {
        await Linking.openURL(target);
      } else {
        await Linking.openURL(target);
      }
    } catch (e) {
      Linking.openURL(target).catch(() => {
        Alert.alert('Unable to open link', `Could not open ${channel}. Please try again later.`);
      });
    }
  };

  return (
    <View style={[styles.container, noPadding && { paddingHorizontal: 0, marginBottom: 0 }, style]}>
      {/* WhatsApp Button */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => handleOpen('whatsapp')}
        style={[styles.rectButton, styles.whatsappBtn]}
      >
        <FontAwesome name="whatsapp" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Instagram Button */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => handleOpen('instagram')}
        style={[styles.rectButton, styles.instagramBtn]}
      >
        <FontAwesome name="instagram" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Telegram Button */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => handleOpen('telegram')}
        style={[styles.rectButton, styles.telegramBtn]}
      >
        <FontAwesome name="telegram" size={21} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md + 2,
    gap: 10,
  },
  rectButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
  },
  instagramBtn: {
    backgroundColor: '#E1306C',
  },
  telegramBtn: {
    backgroundColor: '#0088CC',
  },
});
