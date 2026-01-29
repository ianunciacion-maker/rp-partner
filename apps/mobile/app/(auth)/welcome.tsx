import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

// Web landing page component (only imported on web)
const LandingPage = Platform.OS === 'web'
  ? require('@/components/web/LandingPage').default
  : null;

export default function WelcomeScreen() {
  const router = useRouter();

  // Show full landing page on web
  if (Platform.OS === 'web' && LandingPage) {
    return <LandingPage />;
  }

  // Show simple mobile welcome on native
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/tuknang-logo-whitetext.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
  logoImage: { width: 200, height: 60 },
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
