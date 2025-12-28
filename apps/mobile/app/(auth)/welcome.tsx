import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>RP</Text>
          </View>
          <Text style={styles.appName}>RP-Partner</Text>
        </View>

        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Your Properties,</Text>
          <Text style={styles.taglineHighlight}>Perfectly Managed</Text>
        </View>

        <View style={styles.ctaContainer}>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.linkText}>Log In</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.navy },
  content: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  logoPlaceholder: { width: 100, height: 100, borderRadius: BorderRadius.xxl, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  logoText: { fontSize: 40, fontWeight: 'bold', color: Colors.primary.navy },
  appName: { fontSize: Typography.fontSize['2xl'], fontWeight: '600', color: Colors.neutral.white },
  taglineContainer: { alignItems: 'center', marginBottom: Spacing.xxl },
  tagline: { fontSize: Typography.fontSize['3xl'], fontWeight: '300', color: Colors.neutral.white, textAlign: 'center' },
  taglineHighlight: { fontSize: Typography.fontSize['3xl'], fontWeight: 'bold', color: Colors.primary.teal, textAlign: 'center' },
  ctaContainer: { paddingTop: Spacing.lg },
  primaryButton: { backgroundColor: Colors.primary.teal, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginBottom: Spacing.md },
  primaryButtonText: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.primary.navy },
  secondaryButton: { paddingVertical: Spacing.md, alignItems: 'center' },
  secondaryButtonText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray400 },
  linkText: { color: Colors.primary.teal, fontWeight: '600' },
});
