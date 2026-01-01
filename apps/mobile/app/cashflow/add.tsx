import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Property } from '@/types/database';
import { Button, Input, Select } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { BottomNav } from '@/components/BottomNav';

const isWeb = Platform.OS === 'web';

// Web-compatible notification
const showNotification = (title: string, message: string, onOk?: () => void) => {
  if (isWeb) {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

// Web-only date input component
const WebDateInput = ({ value, onChange, max, style }: {
  value: Date;
  onChange: (date: Date) => void;
  max?: string;
  style?: any;
}) => {
  if (!isWeb) return null;

  return (
    <input
      type="date"
      value={value.toISOString().split('T')[0]}
      max={max}
      onChange={(e) => {
        const date = new Date(e.target.value + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          onChange(date);
        }
      }}
      style={{
        backgroundColor: Colors.neutral.white,
        border: `1px solid ${Colors.neutral.gray200}`,
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 16,
        color: Colors.neutral.gray900,
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        marginBottom: 16,
        ...style,
      }}
    />
  );
};

const INCOME_CATEGORIES = [
  { label: 'Rental Income', value: 'rental_income' },
  { label: 'Security Deposit', value: 'security_deposit' },
  { label: 'Additional Fees', value: 'additional_fees' },
  { label: 'Refund Received', value: 'refund_received' },
  { label: 'Other Income', value: 'other_income' },
];

const EXPENSE_CATEGORIES = [
  { label: 'Utilities', value: 'utilities' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Commission', value: 'commission' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Taxes', value: 'taxes' },
  { label: 'Repairs', value: 'repairs' },
  { label: 'Other Expense', value: 'other_expense' },
];

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'cash' },
  { label: 'GCash', value: 'gcash' },
  { label: 'Maya', value: 'maya' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Check', value: 'check' },
  { label: 'Other', value: 'other' },
];

export default function AddCashflowScreen() {
  const router = useRouter();
  const { type: initialType } = useLocalSearchParams<{ type?: string }>();
  const { authUser } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    property_id: '',
    type: initialType || 'income',
    category: '',
    description: '',
    amount: '',
    transaction_date: new Date(),
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  });

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

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const pickReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showNotification('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showNotification('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.property_id) newErrors.property_id = 'Property is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadReceipt = async (entryId: string) => {
    if (!receiptImage) return null;

    try {
      const response = await fetch(receiptImage);
      const blob = await response.blob();
      const fileExt = receiptImage.split('.').pop() || 'jpg';
      const fileName = `${authUser?.id}/${entryId}/receipt.${fileExt}`;

      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, blob, { contentType: `image/${fileExt}` });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data: entry, error } = await supabase
        .from('cashflow_entries')
        .insert({
          property_id: form.property_id,
          user_id: authUser?.id,
          type: form.type,
          category: form.category,
          description: form.description.trim(),
          amount: parseFloat(form.amount),
          transaction_date: form.transaction_date.toISOString().split('T')[0],
          payment_method: form.payment_method,
          reference_number: form.reference_number.trim() || null,
          notes: form.notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload receipt if selected
      if (receiptImage && entry) {
        const receiptUrl = await uploadReceipt(entry.id);
        if (receiptUrl) {
          await supabase
            .from('cashflow_entries')
            .update({ receipt_url: receiptUrl })
            .eq('id', entry.id);
        }
      }

      showNotification('Success', `${form.type === 'income' ? 'Income' : 'Expense'} recorded successfully!`, () => {
        if (isWeb) {
          router.replace('/(tabs)/cashflow');
        } else {
          router.back();
        }
      });
    } catch (error: any) {
      showNotification('Error', error.message || 'Failed to record transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.wrapper}>
      <Stack.Screen
        options={{
          title: form.type === 'income' ? 'Add Income' : 'Add Expense',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Type Toggle */}
        <View style={styles.section}>
          <View style={styles.typeToggle}>
            <Pressable
              style={[styles.typeButton, form.type === 'income' && styles.incomeButtonActive]}
              onPress={() => { updateForm('type', 'income'); updateForm('category', ''); }}
            >
              <Text style={[styles.typeButtonText, form.type === 'income' && styles.incomeButtonTextActive]}>Income</Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, form.type === 'expense' && styles.expenseButtonActive]}
              onPress={() => { updateForm('type', 'expense'); updateForm('category', ''); }}
            >
              <Text style={[styles.typeButtonText, form.type === 'expense' && styles.expenseButtonTextActive]}>Expense</Text>
            </Pressable>
          </View>
        </View>

        {/* Property & Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Select
            label="Property *"
            value={form.property_id}
            options={properties.map((p) => ({ label: p.name, value: p.id }))}
            onChange={(v) => updateForm('property_id', v)}
            error={errors.property_id}
          />
          <Select
            label="Category *"
            placeholder="Select category"
            value={form.category}
            options={categories}
            onChange={(v) => updateForm('category', v)}
            error={errors.category}
          />
          <Input
            label="Description *"
            placeholder={form.type === 'income' ? 'e.g., Booking payment from Juan' : 'e.g., Electricity bill for December'}
            value={form.description}
            onChangeText={(v) => updateForm('description', v)}
            error={errors.description}
          />
        </View>

        {/* Amount & Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount & Date</Text>
          <Input
            label="Amount (PHP) *"
            placeholder="0.00"
            value={form.amount}
            onChangeText={(v) => updateForm('amount', v)}
            keyboardType="decimal-pad"
            error={errors.amount}
          />

          <Text style={styles.label}>Transaction Date *</Text>
          {isWeb ? (
            <WebDateInput
              value={form.transaction_date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(date) => updateForm('transaction_date', date)}
            />
          ) : (
            <>
              <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>{formatDate(form.transaction_date)}</Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={form.transaction_date}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) updateForm('transaction_date', date);
                  }}
                />
              )}
            </>
          )}

          <Select
            label="Payment Method"
            value={form.payment_method}
            options={PAYMENT_METHODS}
            onChange={(v) => updateForm('payment_method', v)}
          />
          <Input
            label="Reference Number"
            placeholder="e.g., GCash ref #, Check #"
            value={form.reference_number}
            onChangeText={(v) => updateForm('reference_number', v)}
          />
        </View>

        {/* Receipt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt (Optional)</Text>
          {receiptImage ? (
            <View style={styles.receiptContainer}>
              <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
              <Pressable style={styles.removeReceipt} onPress={() => setReceiptImage(null)}>
                <Text style={styles.removeReceiptText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.receiptButtons}>
              <Pressable style={styles.receiptButton} onPress={takePhoto}>
                <Text style={styles.receiptButtonIcon}>📷</Text>
                <Text style={styles.receiptButtonText}>Take Photo</Text>
              </Pressable>
              <Pressable style={styles.receiptButton} onPress={pickReceipt}>
                <Text style={styles.receiptButtonIcon}>🖼️</Text>
                <Text style={styles.receiptButtonText}>Choose Photo</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Input
            label="Notes"
            placeholder="Additional details..."
            value={form.notes}
            onChangeText={(v) => updateForm('notes', v)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit */}
        <View style={styles.buttonContainer}>
          <Button
            title={form.type === 'income' ? 'Record Income' : 'Record Expense'}
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            variant={form.type === 'income' ? 'primary' : 'danger'}
          />
          {isWeb ? (
            <Pressable
              style={[styles.cancelButton, { cursor: 'pointer' } as any]}
              onPress={() => {
                console.log('Cancel button pressed');
                router.replace('/(tabs)/cashflow');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ) : (
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => router.back()}
              fullWidth
              style={{ marginTop: Spacing.sm }}
            />
          )}
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
  typeToggle: { flexDirection: 'row', backgroundColor: Colors.neutral.gray100, borderRadius: BorderRadius.lg, padding: 4 },
  typeButton: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.md },
  incomeButtonActive: { backgroundColor: Colors.semantic.success },
  expenseButtonActive: { backgroundColor: Colors.semantic.error },
  typeButtonText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray500 },
  incomeButtonTextActive: { color: Colors.neutral.white },
  expenseButtonTextActive: { color: Colors.neutral.white },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '500', color: Colors.neutral.gray700, marginBottom: Spacing.xs },
  dateButton: { backgroundColor: Colors.neutral.white, borderWidth: 1, borderColor: Colors.neutral.gray200, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  dateButtonText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  receiptButtons: { flexDirection: 'row', gap: Spacing.md },
  receiptButton: { flex: 1, backgroundColor: Colors.neutral.gray100, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center' },
  receiptButtonIcon: { fontSize: 24, marginBottom: Spacing.xs },
  receiptButtonText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray600 },
  receiptContainer: { alignItems: 'center' },
  receiptImage: { width: '100%', height: 200, borderRadius: BorderRadius.lg, resizeMode: 'cover' },
  removeReceipt: { marginTop: Spacing.sm },
  removeReceiptText: { fontSize: Typography.fontSize.sm, color: Colors.semantic.error, fontWeight: '600' },
  buttonContainer: { padding: Spacing.lg },
  cancelButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  cancelButtonText: {
    color: Colors.primary.teal,
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
});
