import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login Failed', error || 'Please check your credentials');
      clearError();
    }
  };

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
          />

          <Pressable style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={Colors.primary.navy} /> : <Text style={styles.loginButtonText}>Log In</Text>}
          </Pressable>
        </View>
      </View>
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
});
