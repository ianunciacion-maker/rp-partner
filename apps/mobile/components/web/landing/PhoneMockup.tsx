import { View, StyleSheet, Platform } from 'react-native';
import { ReactNode } from 'react';
import { Colors } from '@/constants/theme';

interface PhoneMockupProps {
  children: ReactNode;
  animate?: boolean;
}

/**
 * iPhone-style phone mockup component.
 * Includes Dynamic Island notch and home indicator.
 */
export function PhoneMockup({ children, animate = false }: PhoneMockupProps) {
  const animationStyle = Platform.OS === 'web' && animate ? {
    animation: 'float 3s ease-in-out infinite',
  } : {};

  return (
    <View style={[styles.phoneFrame, animationStyle as any]}>
      {/* Screen area */}
      <View style={styles.screen}>
        {children}
      </View>

      {/* Home indicator */}
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
    borderRadius: 48,
    borderWidth: 10,
    borderColor: Colors.primary.navy,
    backgroundColor: Colors.primary.navy,
    shadowColor: Colors.primary.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  screen: {
    flex: 1,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.gray50,
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
