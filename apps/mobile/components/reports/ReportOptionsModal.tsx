import { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '@/services/supabase';
import { getAllPropertiesOccupancy, calculatePropertyOccupancy } from '@/services/analytics';
import { exportPDFReport } from '@/services/pdfReport';
import type { Property, CashflowEntry } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface ReportOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  properties: Property[];
  selectedProperty: string | null;
  monthOptions: { label: string; value: string; year: number; month: number }[];
}

export function ReportOptionsModal({ visible, onClose, properties, selectedProperty, monthOptions }: ReportOptionsModalProps) {
  const [fromMonth, setFromMonth] = useState(monthOptions[monthOptions.length - 1]?.value || '');
  const [toMonth, setToMonth] = useState(monthOptions[0]?.value || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const sortedFrom = fromMonth < toMonth ? fromMonth : toMonth;
      const sortedTo = fromMonth < toMonth ? toMonth : fromMonth;

      const [toYear, toMon] = sortedTo.split('-').map(Number);

      const startDate = `${sortedFrom}-01`;
      const lastDay = new Date(toYear, toMon, 0).getDate();
      const endDate = `${sortedTo}-${String(lastDay).padStart(2, '0')}`;

      let query = supabase
        .from('cashflow_entries')
        .select('*')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: true });

      if (selectedProperty) {
        query = query.eq('property_id', selectedProperty);
      }

      const { data: entries } = await query;

      let occupancy = [];
      try {
        if (selectedProperty) {
          const result = await calculatePropertyOccupancy(selectedProperty, toYear, toMon - 1);
          occupancy = result ? [result] : [];
        } else {
          occupancy = await getAllPropertiesOccupancy(toYear, toMon - 1, properties.map((p) => p.id));
        }
      } catch {
        // Occupancy is optional in the report
      }

      const propertyName = selectedProperty
        ? properties.find((p) => p.id === selectedProperty)?.name
        : undefined;

      const filename = `tuknang-report-${sortedFrom}-to-${sortedTo}.pdf`;

      await exportPDFReport(
        {
          entries: (entries || []) as CashflowEntry[],
          properties,
          occupancy,
          fromMonth: sortedFrom,
          toMonth: sortedTo,
          propertyName,
        },
        filename
      );

      onClose();
    } catch (error: any) {
      console.error('PDF generation error:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to generate PDF report. Please try again.');
      } else {
        const Alert = require('react-native').Alert;
        Alert.alert('Error', error.message || 'Failed to generate PDF report.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Generate PDF Report</Text>
          <Text style={styles.subtitle}>Select date range for your financial report</Text>

          <View style={styles.rangeRow}>
            <View style={styles.rangeColumn}>
              <Text style={styles.rangeLabel}>From</Text>
              <ScrollView style={styles.monthList} nestedScrollEnabled>
                {[...monthOptions].reverse().map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.monthItem, fromMonth === opt.value && styles.monthItemActive]}
                    onPress={() => setFromMonth(opt.value)}
                  >
                    <Text style={[styles.monthItemText, fromMonth === opt.value && styles.monthItemTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.rangeColumn}>
              <Text style={styles.rangeLabel}>To</Text>
              <ScrollView style={styles.monthList} nestedScrollEnabled>
                {[...monthOptions].reverse().map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.monthItem, toMonth === opt.value && styles.monthItemActive]}
                    onPress={() => setToMonth(opt.value)}
                  >
                    <Text style={[styles.monthItemText, toMonth === opt.value && styles.monthItemTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {selectedProperty && (
            <Text style={styles.filterNote}>
              Report for: {properties.find((p) => p.id === selectedProperty)?.name || 'Selected property'}
            </Text>
          )}

          <View style={styles.buttons}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.generateButton, isGenerating && styles.buttonDisabled]}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={Colors.neutral.white} />
              ) : (
                <Text style={styles.generateText}>Generate PDF</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.lg,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  rangeColumn: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.sm,
  },
  monthList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.md,
  },
  monthItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  monthItemActive: {
    backgroundColor: Colors.primary.teal + '15',
  },
  monthItemText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray700,
  },
  monthItemTextActive: {
    color: Colors.primary.teal,
    fontWeight: Typography.fontWeight.semibold,
  },
  filterNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.gray100,
  },
  cancelText: {
    color: Colors.neutral.gray600,
    fontWeight: Typography.fontWeight.semibold,
  },
  generateButton: {
    backgroundColor: Colors.primary.teal,
  },
  generateText: {
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
