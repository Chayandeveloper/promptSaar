import React from 'react';
import { View, StyleSheet, StatusBar, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Theme } from '../constants/Theme';

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
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      <View style={[styles.inner, noPadding && { paddingHorizontal: 0 }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  inner: {
    flex: 1,
  },
});
