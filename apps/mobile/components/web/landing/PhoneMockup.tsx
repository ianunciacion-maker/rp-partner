import { View, StyleSheet, Platform } from 'react-native';
import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
  animate?: boolean;
}

export function PhoneMockup({ children, animate = false }: PhoneMockupProps) {
  const animationStyle = Platform.OS === 'web' && animate ? {
    animation: 'float 3s ease-in-out infinite',
  } : {};

  return (
    <View style={[styles.phoneFrame, animationStyle as any]}>
      <View style={styles.screen}>
        {children}
      </View>
      <View style={styles.homeIndicator}>
        <View style={styles.homeIndicatorBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phoneFrame: {
    position: 'relative',
    width: 280,
    aspectRatio: 9 / 19.5,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#e7e5e4',
    backgroundColor: '#e7e5e4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
  screen: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#fafaf9',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  homeIndicatorBar: {
    width: 112,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 2,
  },
});
