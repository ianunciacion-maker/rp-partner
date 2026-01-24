import { View, Text, TextInput, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { useState } from 'react';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon, rightIcon && styles.inputWithRightIcon, style]}
          placeholderTextColor={Colors.neutral.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.neutral.gray700,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.lg,
    minHeight: 48,
  },
  focused: {
    borderColor: Colors.primary.teal,
    borderWidth: 2,
  },
  error: {
    borderColor: Colors.semantic.error,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  rightIcon: {
    paddingRight: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  hintText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
});
