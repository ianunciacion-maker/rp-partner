import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';

const TABS = [
  { name: 'Home', icon: '🏠', path: '/(tabs)' },
  { name: 'Calendar', icon: '📅', path: '/(tabs)/calendar' },
  { name: 'Cashflow', icon: '💰', path: '/(tabs)/cashflow' },
  { name: 'More', icon: '⋮', path: '/(tabs)/more' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
          >
            <Text style={[styles.icon, active && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  icon: {
    fontSize: 24,
    color: Colors.neutral.gray500,
  },
  iconActive: {
    color: Colors.primary.teal,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    color: Colors.neutral.gray500,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.primary.teal,
  },
});
