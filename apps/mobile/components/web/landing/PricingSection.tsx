import { Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';
import { CheckIcon } from './icons';

const PRICING = {
  free: {
    name: 'Free',
    price: 0,
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
    popular: true,
  },
  premium: {
    name: 'Premium',
    price: 499,
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
    popular: false,
  },
};

export function PricingSection() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section id="pricing" style={{
      paddingTop: isDesktop ? 120 : 80,
      paddingBottom: isDesktop ? 120 : 80,
      backgroundColor: '#fafaf9',
    }}>
      <div style={{
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <SectionReveal>
          <div style={{ textAlign: 'center', marginBottom: isDesktop ? 64 : 48 }}>
            <span style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#0d9488',
              marginBottom: 16,
            }}>
              Pricing
            </span>
            <h2 style={{
              fontSize: isDesktop ? 52 : 32,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: '#1c1917',
              margin: 0,
              marginBottom: 12,
              lineHeight: 1.1,
            }}>
              Simple, transparent pricing
            </h2>
            <p style={{
              fontSize: 18,
              color: '#a8a29e',
              margin: 0,
            }}>
              {"Start free, upgrade when you're ready."}
            </p>
          </div>
        </SectionReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
          gap: 32,
        }}>
          {Object.values(PRICING).map((plan, i) => (
            <SectionReveal key={plan.name} delay={i * 150} style={{ height: '100%' }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                padding: 40,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    padding: '6px 20px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1c1917',
                    marginBottom: 16,
                  }}>
                    {plan.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                    <span style={{
                      fontSize: 56,
                      fontWeight: 800,
                      color: '#1c1917',
                      letterSpacing: -2,
                    }}>
                      {'\u20B1'}{plan.price}
                    </span>
                    <span style={{ fontSize: 16, color: '#a8a29e' }}>
                      /{plan.period}
                    </span>
                  </div>
                  {plan.price === 0 && (
                    <div style={{
                      fontSize: 14,
                      color: '#0d9488',
                      fontWeight: 600,
                      marginTop: 4,
                    }}>
                      forever
                    </div>
                  )}
                  <div style={{
                    fontSize: 15,
                    color: '#a8a29e',
                    marginTop: 12,
                  }}>
                    {plan.description}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  marginBottom: 32,
                  flex: 1,
                }}>
                  {plan.features.map((feature) => (
                    <div key={feature} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <CheckIcon size={18} color="#0d9488" />
                      <span style={{ fontSize: 15, color: '#57534e' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Pressable
                  onPress={() => router.push('/(auth)/register')}
                  style={{
                    backgroundColor: plan.popular ? '#0d9488' : '#ffffff',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: plan.popular ? 0 : 1,
                    borderColor: '#e7e5e4',
                    height: 48,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{
                    color: plan.popular ? '#ffffff' : '#1c1917',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    {plan.cta}
                  </Text>
                </Pressable>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={300}>
          <p style={{
            textAlign: 'center',
            color: '#a8a29e',
            fontSize: 14,
            margin: 0,
            marginTop: 100,
          }}>
            Pay via GCash, Maya, or Bank Transfer. No credit card needed.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
