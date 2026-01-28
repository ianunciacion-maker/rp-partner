import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Spacing, Typography, BorderRadius, Breakpoints } from '@/constants/theme';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';

const isWeb = Platform.OS === 'web';

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= Breakpoints.tablet;
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      if (isWeb) {
        window.alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }
    if (password !== confirmPassword) {
      if (isWeb) {
        window.alert('Passwords do not match');
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
      return;
    }
    try {
      await signUp(email.trim(), password, fullName.trim());
      if (isWeb) {
        window.alert('Account created! Please check your email to verify.');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Success', 'Account created! Please check your email to verify.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') }
        ]);
      }
    } catch (err) {
      if (isWeb) {
        window.alert(error || 'Please try again');
      } else {
        Alert.alert('Registration Failed', error || 'Please try again');
      }
      clearError();
    }
  };

  const enterSubmit = useEnterSubmit(handleRegister, isLoading);

  // Native mobile layout
  if (!isWeb) {
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
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" placeholderTextColor={Colors.neutral.gray500} secureTextEntry {...enterSubmit} />

            <Pressable style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={Colors.primary.navy} /> : <Text style={styles.registerButtonText}>Create Account</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Web layout with landing page styling
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isDesktop ? 'row' : 'column',
      backgroundColor: Colors.primary.navy,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/videos/hero-villa.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(26, 54, 93, 0.85)',
        zIndex: 1,
      }} />

      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        backgroundColor: 'rgba(56, 178, 172, 0.15)',
        filter: 'blur(100px)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        filter: 'blur(100px)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Left side - Branding (desktop only) */}
      {isDesktop && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          position: 'relative',
          zIndex: 2,
        }}>
          <Pressable onPress={() => router.push('/')} style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: Colors.primary.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>TK</span>
              </div>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff' }}>Tuknang</span>
            </div>
          </Pressable>

          <h1 style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 24,
            letterSpacing: -1,
          }}>
            Start managing your properties like a pro
          </h1>
          <p style={{
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 480,
          }}>
            Join 1,000+ Filipino property owners who've simplified their rental management. Free forever, no credit card required.
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 32,
            marginTop: 48,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>Free</span>
              <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>Forever plan</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>5,000+</span>
              <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>Properties managed</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>4.8★</span>
              <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>User rating</span>
            </div>
          </div>
        </div>
      )}

      {/* Right side - Form */}
      <div style={{
        flex: isDesktop ? 'none' : 1,
        width: isDesktop ? 520 : '100%',
        minHeight: isDesktop ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isDesktop ? 48 : 24,
        paddingTop: isDesktop ? 48 : 60,
        paddingBottom: isDesktop ? 48 : 60,
        position: 'relative',
        zIndex: 2,
        overflowY: 'auto',
      }}>
        {/* Mobile header */}
        {!isDesktop && (
          <div style={{ width: '100%', maxWidth: 400, marginBottom: 24 }}>
            <Pressable onPress={() => router.push('/')} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: Colors.primary.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>TK</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 'bold', color: '#ffffff' }}>Tuknang</span>
              </div>
            </Pressable>
          </div>
        )}

        {/* Glass card form */}
        <div style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          padding: isDesktop ? 40 : 32,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: Colors.primary.navy,
            margin: 0,
            marginBottom: 8,
          }}>
            Create your account
          </h2>
          <p style={{
            fontSize: 15,
            color: Colors.neutral.gray500,
            margin: 0,
            marginBottom: 28,
          }}>
            Get started for free — no credit card required
          </p>

          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray700,
              marginBottom: 8,
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Dela Cruz"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                borderRadius: 12,
                border: `1px solid ${Colors.neutral.gray200}`,
                backgroundColor: Colors.neutral.gray50,
                color: Colors.neutral.gray900,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.primary.teal;
                e.target.style.boxShadow = `0 0 0 3px rgba(56, 178, 172, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = Colors.neutral.gray200;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray700,
              marginBottom: 8,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                borderRadius: 12,
                border: `1px solid ${Colors.neutral.gray200}`,
                backgroundColor: Colors.neutral.gray50,
                color: Colors.neutral.gray900,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.primary.teal;
                e.target.style.boxShadow = `0 0 0 3px rgba(56, 178, 172, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = Colors.neutral.gray200;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray700,
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                borderRadius: 12,
                border: `1px solid ${Colors.neutral.gray200}`,
                backgroundColor: Colors.neutral.gray50,
                color: Colors.neutral.gray900,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.primary.teal;
                e.target.style.boxShadow = `0 0 0 3px rgba(56, 178, 172, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = Colors.neutral.gray200;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray700,
              marginBottom: 8,
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleRegister();
                }
              }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                borderRadius: 12,
                border: `1px solid ${Colors.neutral.gray200}`,
                backgroundColor: Colors.neutral.gray50,
                color: Colors.neutral.gray900,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.primary.teal;
                e.target.style.boxShadow = `0 0 0 3px rgba(56, 178, 172, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = Colors.neutral.gray200;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 16,
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: Colors.primary.teal,
              border: 'none',
              borderRadius: 12,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 4px 14px rgba(56, 178, 172, 0.4)`,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 20px rgba(56, 178, 172, 0.5)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 14px rgba(56, 178, 172, 0.4)`;
            }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={{
            fontSize: 12,
            color: Colors.neutral.gray500,
            textAlign: 'center',
            margin: 0,
            marginTop: 16,
            lineHeight: 1.5,
          }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          <div style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: `1px solid ${Colors.neutral.gray200}`,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 14, color: Colors.neutral.gray500 }}>
              Already have an account?{' '}
            </span>
            <button
              onClick={() => router.push('/(auth)/login')}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: Colors.primary.teal,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Back to home link */}
        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: 24,
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.7)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back to home
        </button>
      </div>
    </div>
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
