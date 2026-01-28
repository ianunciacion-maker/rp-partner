import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

type TabName = 'properties' | 'calendar' | 'cashflow' | 'guests';

interface MockupBottomNavProps {
  activeTab: TabName;
}

const tabs: { id: TabName; label: string; icon: string }[] = [
  { id: 'properties', label: 'Properties', icon: '\u2302' }, // House
  { id: 'calendar', label: 'Calendar', icon: '\u25A1' }, // Calendar
  { id: 'cashflow', label: 'Cashflow', icon: '$' },
  { id: 'guests', label: 'Guests', icon: '\u263A' }, // Person
];

/**
 * iOS-style bottom navigation bar for phone mockups.
 */
export function MockupBottomNav({ activeTab }: MockupBottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <View key={tab.id} style={styles.tab}>
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
  },
  tab: {
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 16,
    color: Colors.neutral.gray400,
  },
  iconActive: {
    color: Colors.primary.teal,
  },
  label: {
    fontSize: 6,
    color: Colors.neutral.gray400,
  },
  labelActive: {
    color: Colors.primary.teal,
    fontWeight: '500',
  },
});
