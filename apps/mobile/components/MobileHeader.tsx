import { View, Text, Pressable, StyleSheet, Platform, Image } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

interface MobileHeaderProps {
  onMenuPress: () => void;
}

export function MobileHeader({ onMenuPress }: MobileHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.menuButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>
      <Image
        source={require('@/assets/images/tuknang-logo-whitetext.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.navy,
    paddingHorizontal: Spacing.md,
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      top: 'env(safe-area-inset-top, 0px)',
      left: 0,
      right: 0,
      zIndex: 40,
    } : {}),
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  menuIcon: {
    fontSize: 24,
    color: Colors.neutral.white,
  },
  logo: {
    width: 140,
    height: 38,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});
