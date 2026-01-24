import { View, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors } from '@/constants/theme';
import { DesktopSidebar } from './DesktopSidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const translateX = useRef(new Animated.Value(-256)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isOpen ? 0 : -256,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  if (!isOpen && Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, !isOpen && styles.hidden]}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.overlayPressable} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <DesktopSidebar onNavigate={onClose} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
    } : {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
    }),
  },
  hidden: {
    ...(Platform.OS === 'web' ? { pointerEvents: 'none' as any } : {}),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 256,
    backgroundColor: Colors.neutral.white,
    ...(Platform.OS === 'web' ? {
      boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
    } as any : {}),
  },
});
