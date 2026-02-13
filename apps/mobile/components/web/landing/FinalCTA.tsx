import { Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';

export function FinalCTA() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section style={{
      position: 'relative',
      paddingTop: isDesktop ? 120 : 80,
      paddingBottom: isDesktop ? 120 : 80,
      backgroundColor: '#0c1a2e',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(13,148,136,0.15) 0%, transparent 60%)',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: 800,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        textAlign: 'center',
      }}>
        <SectionReveal>
          <h2 style={{
            fontSize: isDesktop ? 40 : 32,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            marginBottom: 32,
            lineHeight: 1.2,
            letterSpacing: -1,
          }}>
            Ready to simplify your rental business?
          </h2>

          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={{
              backgroundColor: '#ffffff',
              paddingHorizontal: 40,
              paddingVertical: 18,
              borderRadius: 100,
              alignSelf: 'center',
              height: 56,
              justifyContent: 'center',
            }}
          >
            <Text style={{
              color: '#0c1a2e',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Get Started Free
            </Text>
          </Pressable>

          <p style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 24,
            marginBottom: 0,
          }}>
            Free forever. No credit card required.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
