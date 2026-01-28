import { View, StyleSheet, Platform } from 'react-native';
import { useState, type PropsWithChildren } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileHeader } from './MobileHeader';
import { MobileDrawer } from './MobileDrawer';
import { Colors } from '@/constants/theme';

interface ResponsiveShellProps extends PropsWithChildren {
  showNavigation?: boolean;
}

export function ResponsiveShell({ children, showNavigation = true }: ResponsiveShellProps) {
  const { isDesktop, isWeb } = useResponsive();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!isWeb || !showNavigation) {
    return <>{children}</>;
  }

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <DesktopSidebar />
        <View style={styles.desktopContent}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.mobileContainer}>
      <MobileHeader onMenuPress={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <View style={styles.mobileContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray50,
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh',
      width: '100%',
    } as any : {}),
  },
  desktopContent: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
    ...(Platform.OS === 'web' ? {
      overflow: 'auto',
      minWidth: 0,
    } as any : {}),
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    ...(Platform.OS === 'web' ? {
      minHeight: '100vh',
      width: '100%',
    } as any : {}),
  },
  mobileContent: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      marginTop: 'calc(64px + env(safe-area-inset-top, 0px))',
    } as any : {
      marginTop: 64,
    }),
  },
});
