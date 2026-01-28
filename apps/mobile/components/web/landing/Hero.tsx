import { View, Text, StyleSheet, Pressable, useWindowDimensions, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Breakpoints } from '@/constants/theme';
import { VideoBackground } from './VideoBackground';
import { ScrollReveal } from './ScrollReveal';

/**
 * Hero section with video background and centered content.
 */
export function Hero() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <View style={styles.container}>
      <VideoBackground
        src="/videos/hero-villa.mp4"
        overlay
        overlayOpacity={55}
      />

      {/* Gradient overlay for better text contrast */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1,
      }} />

      {/* Background decoration */}
      <View style={styles.decoration1} />
      <View style={styles.decoration2} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: isDesktop ? 160 : 120,
        paddingBottom: 100,
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 900,
        }}>
          {/* Badge */}
          <ScrollReveal delay={0}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(56, 178, 172, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(56, 178, 172, 0.3)',
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 50,
                marginBottom: 32,
              }}>
                <span style={{ fontSize: 16 }}>🇵🇭</span>
                <span style={{
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                }}>
                  Built for Filipino Property Owners
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Main Headline */}
          <ScrollReveal delay={100}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}>
              <h1 style={{
                fontSize: isDesktop ? 72 : 44,
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.05,
                margin: 0,
                marginBottom: 28,
                letterSpacing: -2,
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
              }}>
                Manage Your Rentals
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #38b2ac 0%, #4fd1c5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Like a Pro
                </span>
              </h1>
            </div>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={200}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}>
              <p style={{
                fontSize: isDesktop ? 22 : 18,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                lineHeight: 1.7,
                margin: 0,
                marginBottom: 48,
                maxWidth: 600,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}>
                The all-in-one app to track bookings, manage finances, and grow your rental business.
                <strong style={{ color: '#ffffff' }}> Free to start.</strong>
              </p>
            </div>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={300}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: 16,
                marginBottom: 56,
                alignItems: 'center',
              }}>
              <Pressable
                onPress={() => router.push('/(auth)/register')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.primaryButtonText}>Get Started Free</Text>
                <Text style={styles.primaryButtonArrow}>{'\u2192'}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.secondaryButtonText}>See How It Works</Text>
              </Pressable>
              </div>
            </div>
          </ScrollReveal>

          {/* Trust Indicators */}
          <ScrollReveal delay={400}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}>
              <div style={{
                display: 'inline-flex',
                flexDirection: 'row',
                gap: isDesktop ? 48 : 24,
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '24px 40px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 24, color: '#fbbf24' }}>{'\u2605'}</span>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>4.8</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Rating</span>
                </div>
                <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', display: isDesktop ? 'block' : 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>1,000+</span>
                  <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Users</span>
                </div>
                <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', display: isDesktop ? 'block' : 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>5,000+</span>
                  <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Properties</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: 0.6,
        animation: 'bounce 2s infinite',
      }}>
        <span style={{ fontSize: 12, color: '#ffffff', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: 24,
          height: 40,
          border: '2px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 8,
        }}>
          <div style={{
            width: 4,
            height: 8,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            animation: 'scrollDown 1.5s infinite',
          }} />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-8px); }
          60% { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes scrollDown {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(12px); }
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: '100vh' as any,
    overflow: 'hidden',
  },
  decoration1: {
    position: 'absolute',
    top: '-30%',
    right: '-20%',
    width: 800,
    height: 800,
    borderRadius: 400,
    backgroundColor: 'rgba(56, 178, 172, 0.15)',
    filter: 'blur(120px)',
    zIndex: 1,
  } as ViewStyle,
  decoration2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-20%',
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: 'rgba(26, 54, 93, 0.15)',
    filter: 'blur(120px)',
    zIndex: 1,
  } as ViewStyle,
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: Colors.primary.teal,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButtonArrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '400',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  } as ViewStyle,
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});
