import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { Modal } from './Modal';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isOpen} onClose={() => setIsOpen(false)} title={label || 'Select'} size="sm">
        <ScrollView style={styles.optionsList}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.option, option.value === value && styles.optionSelected]}
              onPress={() => handleSelect(option.value)}
            >
              <Text style={[styles.optionText, option.value === value && styles.optionTextSelected]}>
                {option.label}
              </Text>
              {option.value === value && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  triggerError: {
    borderColor: Colors.semantic.error,
  },
  triggerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
  },
  placeholder: {
    color: Colors.neutral.gray400,
  },
  arrow: {
    fontSize: 10,
    color: Colors.neutral.gray500,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  optionSelected: {
    backgroundColor: Colors.primary.teal + '10',
  },
  optionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
  },
  optionTextSelected: {
    color: Colors.primary.teal,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary.teal,
  },
});
