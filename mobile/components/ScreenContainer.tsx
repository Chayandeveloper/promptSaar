import React from 'react';
import { View, StyleSheet, StatusBar, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  edges?: readonly Edge[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  noPadding = false,
  edges = ['top', 'left', 'right'],
}) => {
  return (
    <View style={[styles.outer, style]}>
      {/* App-wide Red to White Modern UI Gradient */}
      <LinearGradient
        colors={['#FFB8C6', '#FFE5EB', '#FFF2F4', '#FFFFFF']}
        locations={[0, 0.22, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={edges} style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={[styles.inner, noPadding && { paddingHorizontal: 0 }]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
