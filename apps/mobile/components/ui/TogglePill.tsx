import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface TogglePillOption {
  label: string;
  value: string;
}

interface TogglePillProps {
  options: TogglePillOption[];
  value: string;
  onChange: (value: string) => void;
}

export function TogglePill({ options, value, onChange }: TogglePillProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  optionActive: {
    backgroundColor: Colors.primary.teal,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.neutral.gray600,
  },
  optionTextActive: {
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.semibold,
  },
});
