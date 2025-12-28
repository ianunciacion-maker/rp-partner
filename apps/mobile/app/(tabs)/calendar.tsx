import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📅</Text>
      <Text style={styles.title}>Calendar</Text>
      <Text style={styles.subtitle}>View all your reservations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral.gray50, padding: Spacing.lg },
  icon: { fontSize: 48, marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
});
