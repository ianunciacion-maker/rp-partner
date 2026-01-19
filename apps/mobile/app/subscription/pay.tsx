import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import type { PaymentMethod } from '@/types/database';

const isWeb = Platform.OS === 'web';

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId: string; months: string; amount: string }>();
  const { user } = useAuthStore();
  const { paymentMethods, fetchPaymentMethods, submitPayment, isLoading } = useSubscriptionStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const amount = parseInt(params.amount || '499', 10);
  const months = parseInt(params.months || '1', 10);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    // Auto-select first payment method
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0]);
    }
  }, [paymentMethods]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access photos is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setScreenshot(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !selectedMethod || !screenshot) {
      setError('Please select a payment method and upload a screenshot');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload screenshot to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`;

      let uploadData;
      if (isWeb) {
        // For web, fetch the blob
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const { data, error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, blob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;
        uploadData = data;
      } else {
        // For native, use base64
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
        });

        if (result.canceled || !result.assets[0].base64) {
          // Use fetch approach for native as fallback
          const response = await fetch(screenshot);
          const blob = await response.blob();
          const { data, error: uploadError } = await supabase.storage
            .from('payment-screenshots')
            .upload(fileName, blob, { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;
          uploadData = data;
        } else {
          const { data, error: uploadError } = await supabase.storage
            .from('payment-screenshots')
            .upload(fileName, decode(result.assets[0].base64), {
              contentType: 'image/jpeg',
            });

          if (uploadError) throw uploadError;
          uploadData = data;
        }
      }

      // Submit payment
      await submitPayment({
        userId: user.id,
        paymentMethodId: selectedMethod.id,
        amount,
        screenshotUrl: uploadData?.path || fileName,
        referenceNumber: referenceNumber || undefined,
        monthsPurchased: months,
      });

      // Show success modal instead of immediate navigation
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalDismiss = () => {
    setShowSuccessModal(false);
    router.replace('/subscription/pending');
  };

  if (isLoading && paymentMethods.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Payment</Text>
      </View>

      {/* Amount Display */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amountValue}>PHP {amount.toLocaleString()}</Text>
        <Text style={styles.amountDescription}>
          Premium Plan • {months} {months === 1 ? 'month' : 'months'}
        </Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <View style={styles.methodList}>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod?.id === method.id && styles.methodItemSelected,
              ]}
              onPress={() => setSelectedMethod(method)}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>
                  {method.name === 'gcash' ? '💚' : method.name === 'maya' ? '💜' : '🏦'}
                </Text>
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodName}>{method.display_name}</Text>
                <Text style={styles.methodAccount}>{method.account_name}</Text>
              </View>
              <View
                style={[
                  styles.methodRadio,
                  selectedMethod?.id === method.id && styles.methodRadioSelected,
                ]}
              >
                {selectedMethod?.id === method.id && (
                  <View style={styles.methodRadioDot} />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Payment Instructions */}
      {selectedMethod && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Instructions</Text>
          <View style={styles.instructionsCard}>
            {selectedMethod.qr_code_url && (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: selectedMethod.qr_code_url }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            )}
            <View style={styles.accountInfo}>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Account Name</Text>
                <Text style={styles.accountValue}>{selectedMethod.account_name}</Text>
              </View>
              {selectedMethod.account_number && (
                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Account Number</Text>
                  <Text style={styles.accountValue}>{selectedMethod.account_number}</Text>
                </View>
              )}
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Amount</Text>
                <Text style={[styles.accountValue, styles.amountHighlight]}>
                  PHP {amount.toLocaleString()}
                </Text>
              </View>
            </View>
            {selectedMethod.instructions && (
              <Text style={styles.instructionsText}>{selectedMethod.instructions}</Text>
            )}
          </View>
        </View>
      )}

      {/* Screenshot Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Payment Screenshot</Text>
        <Pressable style={styles.uploadArea} onPress={pickImage}>
          {screenshot ? (
            <Image source={{ uri: screenshot }} style={styles.screenshotPreview} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Tap to upload screenshot</Text>
              <Text style={styles.uploadHint}>
                Take a screenshot of your payment confirmation
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Reference Number (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reference Number (Optional)</Text>
        <Input
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          placeholder="Enter reference number if available"
        />
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.actions}>
        <Text style={styles.paymentNote}>
          Note: Account changes may take up to 24 hours to reflect due to payment verification delays.
        </Text>
        <Button
          title={isUploading ? 'Submitting...' : 'Submit Payment'}
          onPress={handleSubmit}
          variant="primary"
          fullWidth
          disabled={!selectedMethod || !screenshot || isUploading}
          loading={isUploading}
        />
        <Text style={styles.disclaimer}>
          Your payment will be verified within 24 hours
        </Text>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} onClose={handleModalDismiss} showCloseButton={false}>
        <View style={styles.successModalContent}>
          <Text style={styles.successIcon}>⏰</Text>
          <Text style={styles.successTitle}>Payment Submitted</Text>
          <Text style={styles.successMessage}>
            Your payment has been submitted for verification. Account changes may take up to 24 hours to reflect due to payment processing delays.
          </Text>
          <Button title="Got it" onPress={handleModalDismiss} variant="primary" fullWidth />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.teal,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.neutral.gray900,
  },
  amountCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.primary.teal,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.white + 'CC',
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.neutral.white,
  },
  amountDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.white + 'CC',
    marginTop: Spacing.xs,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  methodList: {
    gap: Spacing.sm,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral.gray200,
    ...Shadows.sm,
  },
  methodItemSelected: {
    borderColor: Colors.primary.teal,
    backgroundColor: Colors.primary.teal + '10',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  methodIconText: {
    fontSize: 20,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  methodAccount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
  methodRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioSelected: {
    borderColor: Colors.primary.teal,
  },
  methodRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.teal,
  },
  instructionsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.lg,
  },
  accountInfo: {
    gap: Spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
  accountValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  amountHighlight: {
    color: Colors.primary.teal,
  },
  instructionsText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
    lineHeight: 20,
  },
  uploadArea: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.neutral.gray300,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  uploadPlaceholder: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray700,
  },
  uploadHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
  screenshotPreview: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.semantic.error + '10',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.semantic.error,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.semantic.error,
    textAlign: 'center',
  },
  actions: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  disclaimer: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    textAlign: 'center',
  },
  paymentNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  successModalContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
});
