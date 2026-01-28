import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { resetPassword } from '@/services/supabase';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      if (isWeb) {
        window.alert('Please enter both email and password');
      } else {
        Alert.alert('Error', 'Please enter both email and password');
      }
      return;
    }
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage = err?.message || error || 'Please check your credentials';
      if (isWeb) {
        window.alert(errorMessage);
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
      clearError();
    }
  };

  const loginEnterSubmit = useEnterSubmit(handleLogin, isLoading);

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      if (isWeb) {
        window.alert('Please enter your email address');
      } else {
        Alert.alert('Error', 'Please enter your email address');
      }
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(resetEmail.trim());
      if (isWeb) {
        window.alert('If an account exists with this email, you will receive a password reset link.');
        setShowForgotPassword(false);
      } else {
        Alert.alert(
          'Check Your Email',
          'If an account exists with this email, you will receive a password reset link.',
          [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
        );
      }
      setResetEmail('');
    } catch (err: any) {
      if (isWeb) {
        window.alert(err?.message || 'Failed to send reset email');
      } else {
        Alert.alert('Error', err?.message || 'Failed to send reset email');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const forgotPasswordEnterSubmit = useEnterSubmit(handleForgotPassword, isResetting);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.neutral.gray500}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={Colors.neutral.gray500}
            secureTextEntry
            {...loginEnterSubmit}
          />

          <Pressable style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={Colors.primary.navy} /> : <Text style={styles.loginButtonText}>Log In</Text>}
          </Pressable>

          <Pressable onPress={() => { setResetEmail(email); setShowForgotPassword(true); }} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        </View>
      </View>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotPassword} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.neutral.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              {...forgotPasswordEnterSubmit}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowForgotPassword(false)}
                disabled={isResetting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalSubmitButton}
                onPress={handleForgotPassword}
                disabled={isResetting}
              >
                {isResetting ? (
                  <ActivityIndicator color={Colors.neutral.white} size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Send Reset Link</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.navy },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xxl },
  backButton: { color: Colors.primary.teal, fontSize: Typography.fontSize.md, marginBottom: Spacing.lg },
  title: { fontSize: Typography.fontSize['3xl'], fontWeight: 'bold', color: Colors.neutral.white },
  form: { flex: 1 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray300, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.fontSize.md, color: Colors.neutral.white, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: Spacing.lg },
  loginButton: { backgroundColor: Colors.primary.teal, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.md },
  loginButtonText: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.primary.navy },
  forgotPasswordButton: { alignItems: 'center', marginTop: Spacing.lg },
  forgotPasswordText: { color: Colors.primary.teal, fontSize: Typography.fontSize.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalContent: { backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900, marginBottom: Spacing.sm },
  modalDescription: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600, marginBottom: Spacing.lg },
  modalInput: { backgroundColor: Colors.neutral.gray50, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.fontSize.md, color: Colors.neutral.gray900, borderWidth: 1, borderColor: Colors.neutral.gray200, marginBottom: Spacing.lg },
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  modalCancelButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.neutral.gray300 },
  modalCancelText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray600 },
  modalSubmitButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', backgroundColor: Colors.primary.teal },
  modalSubmitText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.white },
});
