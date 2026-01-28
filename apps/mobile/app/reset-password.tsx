import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, updatePassword } from '@/services/supabase';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // If there's a session with a recovery event, we're good
        setIsValidSession(!!session);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Listen for auth state changes (PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setIsChecking(false);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const enterSubmit = useEnterSubmit(handleResetPassword, isLoading);

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('Please enter a new password');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      // Sign out after password reset so user logs in fresh
      await supabase.auth.signOut();
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary.teal} />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isValidSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Invalid or Expired Link</Text>
          <Text style={styles.errorText}>
            This password reset link is invalid or has expired. Please request a new one.
          </Text>
          <Pressable style={styles.button} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Password Updated!</Text>
          <Text style={styles.successText}>
            Your password has been successfully updated. You can now log in with your new password.
          </Text>
          <Pressable style={styles.button} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            placeholderTextColor={Colors.neutral.gray500}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.neutral.gray500}
            secureTextEntry
            {...enterSubmit}
          />

          {errorMessage ? (
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          ) : null}

          <Pressable style={styles.button} onPress={handleResetPassword} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={Colors.primary.navy} />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.navy },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  header: { marginTop: Spacing.xxl, marginBottom: Spacing.xxl },
  title: { fontSize: Typography.fontSize['3xl'], fontWeight: 'bold', color: Colors.neutral.white },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray300, marginTop: Spacing.sm },
  form: { flex: 1 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray300, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.fontSize.md, color: Colors.neutral.white, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: Spacing.lg },
  button: { backgroundColor: Colors.primary.teal, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.md },
  buttonText: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.primary.navy },
  loadingText: { color: Colors.neutral.gray300, marginTop: Spacing.md, fontSize: Typography.fontSize.md },
  errorTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.white, marginBottom: Spacing.md, textAlign: 'center' },
  errorText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray300, textAlign: 'center', marginBottom: Spacing.xl },
  errorMessageText: { color: Colors.semantic.error, fontSize: Typography.fontSize.sm, marginBottom: Spacing.md, textAlign: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.semantic.success, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  successIconText: { fontSize: 40, color: Colors.neutral.white },
  successTitle: { fontSize: Typography.fontSize['2xl'], fontWeight: 'bold', color: Colors.neutral.white, marginBottom: Spacing.md, textAlign: 'center' },
  successText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray300, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
});
