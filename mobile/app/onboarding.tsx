import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { Storage } from '../services/storage';
import { Config } from '../constants/Config';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Curated AI Prompts',
    subtitle: 'Unlock world-class prompts crafted for Midjourney, ChatGPT, Gemini, Claude, and Sora.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    icon: 'sparkles-outline',
  },
  {
    title: 'Ad-Supported Unlocking',
    subtitle: 'Watch a short rewarded advertisement to permanently unlock any prompt in the platform.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    icon: 'play-circle-outline',
  },
  {
    title: 'Instant ChatGPT & Gemini Bridge',
    subtitle: '1-click copy and seamless deep links directly into your favorite AI conversational agents.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    icon: 'rocket-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await Storage.setItem(Config.STORAGE_KEYS.HAS_ONBOARDED, 'true');
      router.replace('/(tabs)');
    }
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <Image source={{ uri: slide.image }} style={styles.bgImage} />
      <LinearGradient
        colors={['transparent', 'rgba(17, 24, 39, 0.75)', 'rgba(17, 24, 39, 0.96)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={slide.icon as any} size={28} color={Theme.colors.primary} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Indicators */}
        <View style={styles.indicatorRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicator,
                i === currentSlide ? styles.indicatorActive : styles.indicatorInactive,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity activeOpacity={0.88} onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Start Discovering' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 21,
    marginBottom: Theme.spacing.xl,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.xl,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#FF7A00',
  },
  indicatorInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.lg,
    gap: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
