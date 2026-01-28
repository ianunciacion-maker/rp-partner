import { Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Breakpoints } from '@/constants/theme';
import { ScrollReveal } from './ScrollReveal';

const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    currency: '\u20B1',
    period: 'month',
    description: 'Perfect for getting started',
    features: [
      '1 Property',
      'Unlimited reservations',
      '2 months calendar history',
      '2 months financial reports',
      'Cashflow tracking',
      'Receipt uploads',
      'iOS, Android, & Web access',
    ],
    cta: 'Start Free',
  },
  premium: {
    name: 'Premium',
    price: 499,
    currency: '\u20B1',
    period: 'month',
    description: 'For growing property portfolios',
    features: [
      'Up to 3 Properties',
      'Unlimited reservations',
      'Unlimited calendar history',
      'Unlimited financial reports',
      'Everything in Free',
      'Priority support',
      'Advanced analytics (coming soon)',
    ],
    cta: 'Upgrade to Premium',
  },
};

/**
 * Pricing section with Free and Premium plans.
 */
export function PricingSection() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section id="pricing" style={{
      paddingTop: 100,
      paddingBottom: 100,
      backgroundColor: Colors.neutral.white,
    }}>
      <div style={{
        maxWidth: 1000,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <ScrollReveal>
          <div style={{ marginBottom: 64, textAlign: 'center' }}>
            <h2 style={{
              fontSize: 42,
              fontWeight: 'bold',
              color: Colors.neutral.gray900,
              margin: 0,
              marginBottom: 16,
              letterSpacing: -1,
            }}>Simple, Transparent Pricing</h2>
            <p style={{
              fontSize: 18,
              color: Colors.neutral.gray500,
              margin: 0,
            }}>Start free, upgrade when you're ready.</p>
          </div>
        </ScrollReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
          gap: 32,
          maxWidth: 850,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {/* Free Plan */}
          <ScrollReveal delay={100}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 40,
              border: `2px solid ${Colors.primary.teal}`,
              boxShadow: '0 4px 24px rgba(56, 178, 172, 0.15)',
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Most Popular Badge */}
              <div style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: Colors.primary.teal,
                color: '#fff',
                padding: '6px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>Most Popular</div>

              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: Colors.neutral.gray900, marginBottom: 16 }}>
                  {PRICING.free.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: Colors.neutral.gray900 }}>
                    {PRICING.free.currency}{PRICING.free.price}
                  </span>
                  <span style={{ fontSize: 16, color: Colors.neutral.gray500 }}>
                    /{PRICING.free.period}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: Colors.primary.teal, fontWeight: 600, marginTop: 4 }}>forever</div>
                <div style={{ fontSize: 15, color: Colors.neutral.gray500, marginTop: 12 }}>
                  {PRICING.free.description}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {PRICING.free.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 18,
                      color: Colors.primary.teal,
                      fontWeight: 'bold',
                    }}>{'\u2713'}</span>
                    <span style={{ fontSize: 15, color: Colors.neutral.gray600 }}>{feature}</span>
                  </div>
                ))}
              </div>

              <Pressable
                onPress={() => router.push('/(auth)/register')}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>{PRICING.free.cta}</Text>
              </Pressable>
            </div>
          </ScrollReveal>

          {/* Premium Plan */}
          <ScrollReveal delay={200}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: 24,
              padding: 40,
              border: '1px solid #e2e8f0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: Colors.neutral.gray900, marginBottom: 16 }}>
                  {PRICING.premium.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: Colors.neutral.gray900 }}>
                    {PRICING.premium.currency}{PRICING.premium.price}
                  </span>
                  <span style={{ fontSize: 16, color: Colors.neutral.gray500 }}>
                    /{PRICING.premium.period}
                  </span>
                </div>
                <div style={{ fontSize: 15, color: Colors.neutral.gray500, marginTop: 12 }}>
                  {PRICING.premium.description}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {PRICING.premium.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 18,
                      color: Colors.primary.teal,
                      fontWeight: 'bold',
                    }}>{'\u2713'}</span>
                    <span style={{ fontSize: 15, color: Colors.neutral.gray600 }}>{feature}</span>
                  </div>
                ))}
              </div>

              <Pressable
                onPress={() => router.push('/(auth)/register')}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>{PRICING.premium.cta}</Text>
              </Pressable>
            </div>
          </ScrollReveal>
        </div>

        <p style={{
          textAlign: 'center',
          color: Colors.neutral.gray500,
          fontSize: 14,
          margin: 0,
          marginTop: 40,
        }}>
          Pay via GCash, Maya, or Bank Transfer. No credit card needed.
        </p>
      </div>
    </section>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary.teal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.neutral.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  secondaryButtonText: {
    color: Colors.primary.navy,
    fontSize: 16,
    fontWeight: '600',
  },
});
