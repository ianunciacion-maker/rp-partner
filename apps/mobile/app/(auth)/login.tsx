import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator, Modal, Platform, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { resetPassword } from '@/services/supabase';
import { Colors, Spacing, Typography, BorderRadius, Breakpoints } from '@/constants/theme';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= Breakpoints.tablet;
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

  // Native mobile layout
  if (!isWeb) {
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
            <Image
              source={require('@/assets/images/tuknang-logo-whitetext.png')}
              style={{ width: 200, height: 52 }}
              resizeMode="contain"
            />
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
            Welcome back to your property dashboard
          </h1>
          <p style={{
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 480,
          }}>
            Manage your rentals, track bookings, and grow your property business — all in one place.
          </p>
        </div>
      )}

      {/* Right side - Form */}
      <div style={{
        flex: isDesktop ? 'none' : 1,
        width: isDesktop ? 520 : '100%',
        minHeight: isDesktop ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isDesktop ? 48 : 24,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Mobile header */}
        {!isDesktop && (
          <div style={{ width: '100%', maxWidth: 400, marginBottom: 32 }}>
            <Pressable onPress={() => router.push('/')} style={{ marginBottom: 24 }}>
              <Image
                source={require('@/assets/images/tuknang-logo-whitetext.png')}
                style={{ width: 160, height: 42 }}
                resizeMode="contain"
              />
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
            Sign in
          </h2>
          <p style={{
            fontSize: 15,
            color: Colors.neutral.gray500,
            margin: 0,
            marginBottom: 32,
          }}>
            Enter your credentials to access your account
          </p>

          <div style={{ marginBottom: 20 }}>
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

          <div style={{ marginBottom: 24 }}>
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
              placeholder="Enter your password"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleLogin();
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
            onClick={handleLogin}
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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            onClick={() => { setResetEmail(email); setShowForgotPassword(true); }}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: 16,
              fontSize: 14,
              fontWeight: 500,
              color: Colors.primary.teal,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Forgot Password?
          </button>

          <div style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: `1px solid ${Colors.neutral.gray200}`,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 14, color: Colors.neutral.gray500 }}>
              Don't have an account?{' '}
            </span>
            <button
              onClick={() => router.push('/(auth)/register')}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: Colors.primary.teal,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sign up free
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

      {/* Forgot Password Modal (Web) */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: 24,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 32,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <h3 style={{
              fontSize: 22,
              fontWeight: 600,
              color: Colors.neutral.gray900,
              margin: 0,
              marginBottom: 8,
            }}>
              Reset Password
            </h3>
            <p style={{
              fontSize: 15,
              color: Colors.neutral.gray600,
              margin: 0,
              marginBottom: 24,
            }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isResetting) {
                  handleForgotPassword();
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
                marginBottom: 24,
              }}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowForgotPassword(false)}
                disabled={isResetting}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: Colors.neutral.gray600,
                  backgroundColor: 'transparent',
                  border: `1px solid ${Colors.neutral.gray300}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isResetting}
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: Colors.primary.teal,
                  border: 'none',
                  borderRadius: 12,
                  cursor: isResetting ? 'not-allowed' : 'pointer',
                  opacity: isResetting ? 0.7 : 1,
                }}
              >
                {isResetting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
