import { Tabs } from 'expo-router';
import { Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { useResponsive } from '@/hooks/useResponsive';

function TabBarIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={[styles.icon, { color: focused ? Colors.primary.teal : Colors.neutral.gray500 }]}>{icon}</Text>;
}

export default function TabsLayout() {
  const { isDesktop, isWeb } = useResponsive();
  const hideTabBar = isDesktop && isWeb;
  const hideHeader = isWeb;

  return (
    <ResponsiveShell>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary.navy },
          headerTintColor: Colors.neutral.white,
          headerShown: !hideHeader,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : { backgroundColor: Colors.neutral.white, borderTopColor: Colors.neutral.gray200, paddingTop: 8, paddingBottom: 8, height: 70 },
          tabBarActiveTintColor: Colors.primary.teal,
          tabBarInactiveTintColor: Colors.neutral.gray500,
          tabBarLabelStyle: { fontSize: Typography.fontSize.xs, fontWeight: '500' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Properties', headerTitle: 'Tuknang', tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabBarIcon icon="🏠" focused={focused} /> }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ focused }) => <TabBarIcon icon="📅" focused={focused} /> }} />
        <Tabs.Screen name="cashflow" options={{ title: 'Cashflow', tabBarIcon: ({ focused }) => <TabBarIcon icon="💰" focused={focused} /> }} />
        <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ focused }) => <TabBarIcon icon="⋮" focused={focused} /> }} />
      </Tabs>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({ icon: { fontSize: 24 } });
