import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Properties', path: '/(tabs)' },
  { icon: '📅', label: 'Calendar', path: '/(tabs)/calendar' },
  { icon: '💰', label: 'Cashflow', path: '/(tabs)/cashflow' },
  { icon: '⋮', label: 'More', path: '/(tabs)/more' },
] as const;

interface DesktopSidebarProps {
  onNavigate?: () => void;
}

export function DesktopSidebar({ onNavigate }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();

  const handleNavPress = (path: string) => {
    router.push(path as any);
    onNavigate?.();
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const isActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>RP-Partner</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Pressable
              key={item.path}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => handleNavPress(item.path)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        {user && (
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.full_name || 'User'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
        )}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 256,
    height: '100%',
    backgroundColor: Colors.neutral.white,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral.gray200,
    ...(Platform.OS === 'web' ? {
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0,
    } as any : {}),
  },
  header: {
    height: 64,
    backgroundColor: Colors.primary.navy,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
  },
  nav: {
    flex: 1,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  navItemActive: {
    backgroundColor: Colors.neutral.gray100,
  },
  navIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  navLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray600,
  },
  navLabelActive: {
    color: Colors.primary.teal,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray900,
  },
  userEmail: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
  },
  signOutButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  signOutText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray600,
  },
});
