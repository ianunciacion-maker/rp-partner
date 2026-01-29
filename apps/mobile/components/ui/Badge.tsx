import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { background: string; text: string }> = {
  default: {
    background: Colors.neutral.gray900 + '15',
    text: Colors.neutral.gray900,
  },
  success: {
    background: Colors.semantic.success + '20',
    text: Colors.semantic.success,
  },
  warning: {
    background: Colors.semantic.warning + '20',
    text: Colors.semantic.warning,
  },
  error: {
    background: Colors.semantic.error + '20',
    text: Colors.semantic.error,
  },
  info: {
    background: Colors.primary.teal + '20',
    text: Colors.primary.teal,
  },
};

export const Badge = memo(function Badge({ label, variant = 'default', icon }: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <View style={[styles.container, { backgroundColor: variantStyle.background }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, { color: variantStyle.text }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: Typography.fontSize.xs,
    marginRight: 4,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
});
