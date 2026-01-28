import { View, Text, StyleSheet, Pressable, useWindowDimensions, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Breakpoints } from '@/constants/theme';
import { VideoBackground } from './VideoBackground';
import { PhoneMockup } from './PhoneMockup';
import { ScrollReveal } from './ScrollReveal';
import { PropertiesScreenMockup } from './mockups';

/**
 * Hero section with video background and phone mockup.
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
        overlayOpacity={40}
      />

      {/* Background decoration */}
      <View style={styles.decoration1} />
      <View style={styles.decoration2} />

      <View style={styles.content}>
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'center',
          gap: isDesktop ? 48 : 0,
          width: '100%',
        }}>
          {/* Left: Copy */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isDesktop ? 'flex-start' : 'center',
            width: '100%',
          }}>
            <ScrollReveal delay={0}>
              <div style={{
                display: 'flex',
                justifyContent: isDesktop ? 'flex-start' : 'center',
                width: '100%',
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 20,
                  marginBottom: 24,
                }}>
                  <span style={{ color: '#ffffff', fontSize: 14 }}>Built for Filipino Property Owners</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 style={{
                fontSize: isDesktop ? 56 : 40,
                fontWeight: 800,
                color: '#ffffff',
                textAlign: isDesktop ? 'left' : 'center',
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 24,
                letterSpacing: -1,
              }}>
                Manage Your Rental Properties Like a Pro
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p style={{
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.85)',
                textAlign: isDesktop ? 'left' : 'center',
                lineHeight: 1.7,
                margin: 0,
                marginBottom: 36,
                maxWidth: 500,
              }}>
                The all-in-one app to track bookings, manage finances, and grow your rental business.
                Free to start, no credit card required.
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delay={300}>
              <div style={{
                display: 'flex',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: 16,
                marginBottom: 40,
                alignItems: 'center',
              }}>
                <Pressable
                  onPress={() => router.push('/(auth)/register')}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Get Started Free {'\u2192'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>See How It Works</Text>
                </Pressable>
              </div>
            </ScrollReveal>

            {/* Trust Indicators */}
            <ScrollReveal delay={400}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 24,
                flexWrap: 'wrap',
                justifyContent: isDesktop ? 'flex-start' : 'center',
              }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: '#fbbf24' }}>{'\u2605'}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>4.8</span>
                  <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>Rating</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: '#fbbf24' }}>{'\u2193'}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>1,000+</span>
                  <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>Users</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: '#fbbf24' }}>{'\u2302'}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>5,000+</span>
                  <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>Properties</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Phone Mockup */}
          {isDesktop && (
            <ScrollReveal delay={300} direction="right">
              <View style={styles.mockupSection}>
                <PhoneMockup animate>
                  <PropertiesScreenMockup />
                </PhoneMockup>
              </View>
            </ScrollReveal>
          )}
        </div>
      </View>
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
    top: '-50%',
    right: '-25%',
    width: 800,
    height: 800,
    borderRadius: 400,
    backgroundColor: 'rgba(56, 178, 172, 0.2)',
    filter: 'blur(100px)',
  } as ViewStyle,
  decoration2: {
    position: 'absolute',
    bottom: '-25%',
    left: '-25%',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(26, 54, 93, 0.2)',
    filter: 'blur(100px)',
  } as ViewStyle,
  content: {
    position: 'relative',
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingTop: 128,
    paddingBottom: 80,
  },
  primaryButton: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '500',
  },
  mockupSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
