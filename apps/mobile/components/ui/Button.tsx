import { memo } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pill';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        Platform.OS === 'web' && ({
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          ...(variant === 'ghost' && { backgroundColor: 'rgba(0,0,0,0.02)' }),
        } as ViewStyle),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? Colors.primary.teal : Colors.neutral.white} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], icon && styles.textWithIcon]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary.teal,
  },
  secondary: {
    backgroundColor: Colors.primary.navy,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary.teal,
  },
  danger: {
    backgroundColor: Colors.semantic.error,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pill: {
    backgroundColor: Colors.primary.teal,
    borderRadius: BorderRadius.full,
  },
  // Sizes - minimum 44px touch target height
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 52,
  },
  // Text styles
  text: {
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
  },
  text_primary: {
    color: Colors.neutral.white,
  },
  text_secondary: {
    color: Colors.neutral.white,
  },
  text_outline: {
    color: Colors.primary.teal,
  },
  text_danger: {
    color: Colors.neutral.white,
  },
  text_ghost: {
    color: Colors.primary.teal,
  },
  text_pill: {
    color: Colors.neutral.white,
  },
  text_sm: {
    fontSize: Typography.fontSize.md,
  },
  text_md: {
    fontSize: Typography.fontSize.md,
  },
  text_lg: {
    fontSize: Typography.fontSize.lg,
  },
  textWithIcon: {
    marginLeft: Spacing.sm,
  },
});
