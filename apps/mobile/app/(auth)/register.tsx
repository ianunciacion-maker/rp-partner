import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert('Success', 'Account created! Please check your email to verify.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err) {
      Alert.alert('Registration Failed', error || 'Please try again');
      clearError();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Juan Dela Cruz" placeholderTextColor={Colors.neutral.gray500} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={Colors.neutral.gray500} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor={Colors.neutral.gray500} secureTextEntry />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" placeholderTextColor={Colors.neutral.gray500} secureTextEntry />

          <Pressable style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={Colors.primary.navy} /> : <Text style={styles.registerButtonText}>Create Account</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.navy },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  backButton: { color: Colors.primary.teal, fontSize: Typography.fontSize.md, marginBottom: Spacing.lg },
  title: { fontSize: Typography.fontSize['3xl'], fontWeight: 'bold', color: Colors.neutral.white },
  form: { flex: 1 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray300, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.fontSize.md, color: Colors.neutral.white, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: Spacing.lg },
  registerButton: { backgroundColor: Colors.primary.teal, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.md },
  registerButtonText: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.primary.navy },
});
