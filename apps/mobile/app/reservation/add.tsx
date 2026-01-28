import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Platform, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Property } from '@/types/database';
import { Button, Input, Select } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { BottomNav } from '@/components/BottomNav';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';

const isWeb = Platform.OS === 'web';

// Format date to YYYY-MM-DD in LOCAL timezone (not UTC)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Web-only date input component
const WebDateInput = ({ value, onChange, min, style, hasError }: {
  value: Date;
  onChange: (date: Date) => void;
  min?: string;
  style?: any;
  hasError?: boolean;
}) => {
  if (!isWeb) return null;

  return (
    <input
      type="date"
      value={formatDateLocal(value)}
      min={min}
      onChange={(e) => {
        const date = new Date(e.target.value + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          onChange(date);
        }
      }}
      style={{
        backgroundColor: Colors.neutral.white,
        border: `1px solid ${hasError ? Colors.semantic.error : Colors.neutral.gray200}`,
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 16,
        color: Colors.neutral.gray900,
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        ...style,
      }}
    />
  );
};

const BOOKING_SOURCES = [
  { label: 'Direct', value: 'direct' },
  { label: 'Airbnb', value: 'airbnb' },
  { label: 'Booking.com', value: 'booking' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Referral', value: 'referral' },
  { label: 'Other', value: 'other' },
];

export default function AddReservationScreen() {
  const router = useRouter();
  const { propertyId, date } = useLocalSearchParams<{ propertyId?: string; date?: string }>();
  const { authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  // Parse initial date from query params (for backdating)
  const getInitialCheckIn = () => {
    if (date) {
      const parsed = new Date(date + 'T00:00:00');
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  const getInitialCheckOut = () => {
    const checkIn = getInitialCheckIn();
    return new Date(checkIn.getTime() + 86400000); // Next day
  };

  const [form, setForm] = useState({
    property_id: propertyId || '',
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    guest_count: '2',
    check_in: getInitialCheckIn(),
    check_out: getInitialCheckOut(),
    source: 'direct',
    notes: '',
    total_amount: '',
    deposit_amount: '0',
  });

  // Check if this is a backdated reservation
  const isBackdated = date ? new Date(date + 'T00:00:00') < new Date(formatDateLocal(new Date()) + 'T00:00:00') : false;

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('*');
      setProperties(data || []);
      if (data?.length && !form.property_id) {
        setForm((prev) => ({ ...prev, property_id: data[0].id }));
      }
    };
    fetchProperties();
  }, []);

  const selectedProperty = properties.find((p) => p.id === form.property_id);

  const nights = Math.ceil((form.check_out.getTime() - form.check_in.getTime()) / 86400000);
  const totalAmount = parseFloat(form.total_amount) || 0;

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.property_id) newErrors.property_id = 'Property is required';
    if (!form.guest_name.trim()) newErrors.guest_name = 'Guest name is required';
    if (!form.guest_count || isNaN(Number(form.guest_count))) newErrors.guest_count = 'Valid guest count required';
    if (form.check_out <= form.check_in) newErrors.check_out = 'Check-out must be after check-in';
    if (!form.total_amount || isNaN(Number(form.total_amount)) || Number(form.total_amount) <= 0) {
      newErrors.total_amount = 'Valid total amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('reservations').insert({
        property_id: form.property_id,
        user_id: authUser?.id,
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim() || null,
        guest_email: form.guest_email.trim() || null,
        guest_count: parseInt(form.guest_count),
        check_in: formatDateLocal(form.check_in),
        check_out: formatDateLocal(form.check_out),
        base_amount: totalAmount,
        total_amount: totalAmount,
        deposit_amount: parseFloat(form.deposit_amount) || 0,
        source: form.source,
        notes: form.notes.trim() || null,
        status: 'pending',
      });

      if (error) throw error;

      if (isWeb) {
        // Use setTimeout to ensure alert doesn't block navigation
        window.alert('Reservation created successfully!');
        setTimeout(() => router.replace('/(tabs)/calendar'), 0);
      } else {
        Alert.alert('Success', 'Reservation created successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      const errorMessage = error.code === '23P01'
        ? 'These dates overlap with an existing reservation.'
        : (error.message || 'Failed to create reservation');

      if (isWeb) {
        window.alert(errorMessage);
      } else {
        Alert.alert(error.code === '23P01' ? 'Booking Conflict' : 'Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const enterSubmit = useEnterSubmit(handleSubmit, isLoading);

  return (
    <View style={styles.wrapper}>
      <Stack.Screen options={{ title: 'New Reservation', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property</Text>
          <Select
            label="Select Property *"
            value={form.property_id}
            options={properties.map((p) => ({ label: p.name, value: p.id }))}
            onChange={(v) => updateForm('property_id', v)}
            error={errors.property_id}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <Input
            label="Guest Name *"
            placeholder="Full name"
            value={form.guest_name}
            onChangeText={(v) => updateForm('guest_name', v)}
            error={errors.guest_name}
          />
          <Input
            label="Phone Number"
            placeholder="+63 9XX XXX XXXX"
            value={form.guest_phone}
            onChangeText={(v) => updateForm('guest_phone', v)}
            keyboardType="phone-pad"
          />
          <Input
            label="Email"
            placeholder="guest@email.com"
            value={form.guest_email}
            onChangeText={(v) => updateForm('guest_email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Number of Guests *"
            placeholder="2"
            value={form.guest_count}
            onChangeText={(v) => updateForm('guest_count', v)}
            keyboardType="number-pad"
            error={errors.guest_count}
            hint={selectedProperty ? `Max: ${selectedProperty.max_guests} guests` : ''}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          {isBackdated && (
            <View style={styles.backdatedBanner}>
              <Text style={styles.backdatedText}>📅 Adding backdated reservation for corrections</Text>
            </View>
          )}
          <Text style={styles.label}>Check-in Date *</Text>
          {isWeb ? (
            <WebDateInput
              value={form.check_in}
              onChange={(date) => {
                updateForm('check_in', date);
                if (date >= form.check_out) {
                  updateForm('check_out', new Date(date.getTime() + 86400000));
                }
              }}
            />
          ) : (
            <>
              <Pressable style={styles.dateButton} onPress={() => setShowCheckIn(true)}>
                <Text style={styles.dateButtonText}>{formatDate(form.check_in)}</Text>
              </Pressable>
              {showCheckIn && (
                <DateTimePicker
                  value={form.check_in}
                  mode="date"
                  onChange={(_, date) => {
                    setShowCheckIn(Platform.OS === 'ios');
                    if (date) {
                      updateForm('check_in', date);
                      if (date >= form.check_out) {
                        updateForm('check_out', new Date(date.getTime() + 86400000));
                      }
                    }
                  }}
                />
              )}
            </>
          )}

          <Text style={[styles.label, { marginTop: Spacing.md }]}>Check-out Date *</Text>
          {isWeb ? (
            <>
              <WebDateInput
                value={form.check_out}
                min={formatDateLocal(new Date(form.check_in.getTime() + 86400000))}
                onChange={(date) => updateForm('check_out', date)}
                hasError={!!errors.check_out}
              />
              {errors.check_out && <Text style={styles.errorText}>{errors.check_out}</Text>}
            </>
          ) : (
            <>
              <Pressable style={[styles.dateButton, errors.check_out && styles.dateButtonError]} onPress={() => setShowCheckOut(true)}>
                <Text style={styles.dateButtonText}>{formatDate(form.check_out)}</Text>
              </Pressable>
              {errors.check_out && <Text style={styles.errorText}>{errors.check_out}</Text>}
              {showCheckOut && (
                <DateTimePicker
                  value={form.check_out}
                  mode="date"
                  onChange={(_, date) => {
                    setShowCheckOut(Platform.OS === 'ios');
                    if (date) updateForm('check_out', date);
                  }}
                />
              )}
            </>
          )}

          {nights > 0 && (
            <Text style={styles.nightsInfo}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <Select
            label="Booking Source"
            value={form.source}
            options={BOOKING_SOURCES}
            onChange={(v) => updateForm('source', v)}
          />
          <Input
            label="Total Amount (PHP) *"
            placeholder="Enter reservation cost"
            value={form.total_amount}
            onChangeText={(v) => updateForm('total_amount', v)}
            keyboardType="decimal-pad"
            error={errors.total_amount}
            hint={nights > 0 ? `${nights} ${nights === 1 ? 'night' : 'nights'}` : ''}
          />
          <Input
            label="Deposit Amount (PHP)"
            placeholder="0"
            value={form.deposit_amount}
            onChangeText={(v) => updateForm('deposit_amount', v)}
            keyboardType="decimal-pad"
          />
          <Input
            label="Notes"
            placeholder="Special requests, instructions..."
            value={form.notes}
            onChangeText={(v) => updateForm('notes', v)}
            multiline
            numberOfLines={3}
            {...enterSubmit}
          />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>PHP {totalAmount.toLocaleString()}</Text>
          </View>
          {parseFloat(form.deposit_amount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Deposit</Text>
              <Text style={styles.summaryValue}>PHP {parseFloat(form.deposit_amount).toLocaleString()}</Text>
            </View>
          )}
          {parseFloat(form.deposit_amount) > 0 && totalAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Balance Due</Text>
              <Text style={styles.balanceValue}>PHP {(totalAmount - parseFloat(form.deposit_amount)).toLocaleString()}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Create Reservation" onPress={handleSubmit} loading={isLoading} fullWidth />
          <Button title="Cancel" variant="ghost" onPress={() => router.back()} fullWidth style={{ marginTop: Spacing.sm }} />
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900, marginBottom: Spacing.md },
  backdatedBanner: { backgroundColor: Colors.semantic.warning + '20', padding: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  backdatedText: { fontSize: Typography.fontSize.sm, color: Colors.semantic.warning, fontWeight: '500', textAlign: 'center' },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '500', color: Colors.neutral.gray700, marginBottom: Spacing.xs },
  dateButton: { backgroundColor: Colors.neutral.white, borderWidth: 1, borderColor: Colors.neutral.gray200, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  dateInput: { backgroundColor: Colors.neutral.white, borderWidth: 1, borderColor: Colors.neutral.gray200, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  dateButtonError: { borderColor: Colors.semantic.error },
  dateButtonText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  errorText: { fontSize: Typography.fontSize.sm, color: Colors.semantic.error, marginTop: Spacing.xs },
  nightsInfo: { fontSize: Typography.fontSize.md, color: Colors.primary.teal, fontWeight: '600', marginTop: Spacing.md, textAlign: 'center' },
  summarySection: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginBottom: Spacing.md },
  summaryTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600 },
  summaryValue: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.neutral.gray200, paddingTop: Spacing.md, marginTop: Spacing.sm },
  totalLabel: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  totalValue: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', color: Colors.primary.teal },
  balanceValue: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.semantic.warning },
  buttonContainer: { padding: Spacing.lg },
});
