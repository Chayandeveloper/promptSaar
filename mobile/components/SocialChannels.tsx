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
        style={[
          styles.button,
          styles.whatsappBtn,
          iconsOnly && styles.buttonIconsOnly,
        ]}
      >
        <View style={[styles.iconRect, styles.whatsappIconRect, iconsOnly && styles.iconRectIconsOnly]}>
          <FontAwesome name="whatsapp" size={iconsOnly ? 20 : 16} color="#FFFFFF" />
        </View>
        {!iconsOnly && <Text style={styles.btnLabel}>WhatsApp</Text>}
      </TouchableOpacity>

      {/* Instagram Button */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => handleOpen('instagram')}
        style={[
          styles.button,
          styles.instagramBtn,
          iconsOnly && styles.buttonIconsOnly,
        ]}
      >
        <View style={[styles.iconRect, styles.instagramIconRect, iconsOnly && styles.iconRectIconsOnly]}>
          <FontAwesome name="instagram" size={iconsOnly ? 19 : 16} color="#FFFFFF" />
        </View>
        {!iconsOnly && <Text style={styles.btnLabel}>Instagram</Text>}
      </TouchableOpacity>

      {/* Telegram Button */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => handleOpen('telegram')}
        style={[
          styles.button,
          styles.telegramBtn,
          iconsOnly && styles.buttonIconsOnly,
        ]}
      >
        <View style={[styles.iconRect, styles.telegramIconRect, iconsOnly && styles.iconRectIconsOnly]}>
          <FontAwesome name="telegram" size={iconsOnly ? 18 : 15} color="#FFFFFF" />
        </View>
        {!iconsOnly && <Text style={styles.btnLabel}>Telegram</Text>}
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
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.2,
  },
  iconRect: {
    width: 30,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappBtn: {
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  whatsappIconRect: {
    backgroundColor: '#25D366',
  },
  instagramBtn: {
    borderColor: 'rgba(225, 48, 108, 0.3)',
  },
  instagramIconRect: {
    backgroundColor: '#E1306C',
  },
  telegramBtn: {
    borderColor: 'rgba(0, 136, 204, 0.3)',
  },
  telegramIconRect: {
    backgroundColor: '#0088CC',
  },
  buttonIconsOnly: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    gap: 0,
    borderRadius: 8,
  },
  iconRectIconsOnly: {
    width: 44,
    height: 32,
    borderRadius: 6,
  },
});
