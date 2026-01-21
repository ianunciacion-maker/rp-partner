import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

interface FloatingButtonProps {
  label: string;
  icon?: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
}

export function FloatingButton({
  label,
  icon,
  onPress,
  style,
  variant = 'secondary',
}: FloatingButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      style={[
        styles.container,
        isPrimary ? styles.primaryContainer : styles.secondaryContainer,
        style,
      ]}
      onPress={onPress}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          styles.label,
          isPrimary ? styles.primaryLabel : styles.secondaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
  primaryContainer: {
    backgroundColor: Colors.primary.teal,
  },
  secondaryContainer: {
    backgroundColor: Colors.neutral.white,
  },
  icon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryLabel: {
    color: Colors.neutral.white,
  },
  secondaryLabel: {
    color: Colors.neutral.gray700,
  },
});
