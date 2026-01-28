import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { VideoBackground } from './VideoBackground';
import { ScrollReveal } from './ScrollReveal';

/**
 * Final call-to-action section with dark background.
 */
export function FinalCTA() {
  const router = useRouter();

  return (
    <section style={{
      position: 'relative',
      paddingTop: 100,
      paddingBottom: 100,
      overflow: 'hidden',
    }}>
      <VideoBackground overlay overlayOpacity={50} />

      {/* Decorations */}
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '-25%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        backgroundColor: 'rgba(56, 178, 172, 0.2)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-25%',
        left: '-25%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: 800,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
      }}>
        <ScrollReveal>
          <h2 style={{
            fontSize: 36,
            fontWeight: 'bold',
            color: Colors.neutral.white,
            marginTop: 0,
            marginBottom: 32,
            lineHeight: 1.22,
          }}>
            Ready to Manage Your Properties Like a Pro?
          </h2>
          <p style={{
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 0,
            marginBottom: 48,
            lineHeight: 1.6,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Join 1,000+ Filipino property owners who've simplified their rental management. Start free today.
          </p>

          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>Get Started Free {'\u2192'}</Text>
          </Pressable>

          <p style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: 32,
            marginBottom: 0,
          }}>
            No credit card required {'\u2022'} Free forever {'\u2022'} Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

const styles = StyleSheet.create({
  ctaButton: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    alignSelf: 'center',
  },
  ctaButtonText: {
    color: Colors.primary.navy,
    fontSize: 18,
    fontWeight: '600',
  },
});
