import { View, StyleSheet, Platform } from 'react-native';
import type { PropsWithChildren } from 'react';
import { Colors } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

/**
 * WebContainer provides a centered, max-width container for web viewing.
 * On mobile, it renders children without any wrapper.
 */
export function WebContainer({ children }: PropsWithChildren) {
  if (!isWeb) {
    return <>{children}</>;
  }

  return (
    <View style={styles.webOuterContainer}>
      <View style={styles.webInnerContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.gray200,
    alignItems: 'center',
  },
  webInnerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Mobile-like width for web
    backgroundColor: Colors.neutral.white,
    // Add subtle shadow on desktop
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    } as any : {}),
  },
});
