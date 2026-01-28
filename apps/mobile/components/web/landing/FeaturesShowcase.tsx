import { View, useWindowDimensions } from 'react-native';
import { Colors, Breakpoints } from '@/constants/theme';
import { ScrollReveal } from './ScrollReveal';
import { GlassCard } from './GlassCard';
import { PhoneMockup } from './PhoneMockup';
import {
  PropertiesScreenMockup,
  CalendarScreenMockup,
  CashflowScreenMockup,
  GuestScreenMockup,
} from './mockups';

const features = [
  {
    id: 'properties',
    icon: '🏠',
    title: 'All Your Properties, One Dashboard',
    description:
      'See every property at a glance. Add unlimited details, photos, and notes. Know exactly what\'s happening across your entire portfolio.',
    bullets: [
      'Add properties in under 2 minutes',
      'Upload photos and set your rates',
      'Track occupancy and performance',
      'Works for condos, apartments, and vacation homes',
    ],
    mockup: PropertiesScreenMockup,
  },
  {
    id: 'calendar',
    icon: '📅',
    title: 'Never Double-Book Again',
    description:
      'A visual calendar that shows all your reservations across properties. Block dates for maintenance, personal use, or anything else.',
    bullets: [
      'See availability at a glance',
      'Block dates with one tap',
      'Guest check-in/check-out tracking',
      'Perfect for multi-property owners',
    ],
    mockup: CalendarScreenMockup,
  },
  {
    id: 'cashflow',
    icon: '💰',
    title: 'Know Exactly Where Your Money Goes',
    description:
      'Track income and expenses for each property. Categorize transactions, upload receipts, and see your profitability in real-time.',
    bullets: [
      'Income and expense tracking',
      'Category-based organization',
      'Receipt photo uploads',
      'Per-property financial reports',
    ],
    mockup: CashflowScreenMockup,
  },
  {
    id: 'reservations',
    icon: '👥',
    title: 'Guest Management Made Simple',
    description:
      'Store guest details, track payments, and manage deposits. Everything you need to provide a professional experience.',
    bullets: [
      'Guest contact information',
      'Payment and deposit tracking',
      'Booking source tracking (Airbnb, direct, etc.)',
      'Notes and special requests',
    ],
    mockup: GuestScreenMockup,
  },
];

/**
 * Features showcase section with alternating layout.
 */
export function FeaturesShowcase() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section
      id="features"
      style={{
        paddingTop: 80,
        paddingBottom: 80,
        backgroundColor: Colors.neutral.gray50,
      }}
    >
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        <ScrollReveal>
          <div style={{
            marginBottom: 64,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h2 style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: Colors.neutral.gray900,
              margin: 0,
              marginBottom: 16,
            }}>
              Everything You Need to Manage Your Properties
            </h2>
            <p style={{
              fontSize: 18,
              color: Colors.neutral.gray600,
              maxWidth: 600,
              margin: 0,
              textAlign: 'center',
            }}>
              Powerful features designed specifically for Filipino property owners and managers.
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 96 }}>
          {features.map((feature, index) => {
            const isEven = index % 2 === 1;
            const MockupComponent = feature.mockup;

            return (
              <ScrollReveal
                key={feature.id}
                direction={isEven ? 'right' : 'left'}
                delay={100}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isDesktop ? (isEven ? 'row-reverse' : 'row') : 'column',
                    gap: 48,
                    alignItems: 'center',
                  }}
                >
                  {/* Content */}
                  <div style={{
                    flex: 1,
                    textAlign: isDesktop ? 'left' : 'center',
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 24,
                      marginLeft: isDesktop ? 0 : 'auto',
                      marginRight: isDesktop ? 0 : 'auto',
                    }}>
                      <span style={{ fontSize: 24, color: Colors.primary.teal }}>{feature.icon}</span>
                    </div>
                    <h3 style={{
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: Colors.neutral.gray900,
                      marginBottom: 16,
                      margin: 0,
                      marginBottom: 16,
                    }}>{feature.title}</h3>
                    <p style={{
                      fontSize: 18,
                      color: Colors.neutral.gray600,
                      lineHeight: 1.6,
                      marginBottom: 24,
                      margin: 0,
                      marginBottom: 24,
                    }}>{feature.description}</p>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}>
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          justifyContent: isDesktop ? 'flex-start' : 'center',
                        }}>
                          <span style={{
                            fontSize: 16,
                            color: Colors.primary.teal,
                            marginTop: 2,
                          }}>{'\u2022'}</span>
                          <span style={{
                            fontSize: 16,
                            color: Colors.neutral.gray600,
                          }}>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phone Mockup */}
                  <div style={{
                    flex: isDesktop ? 1 : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <GlassCard padding="lg" style={{ padding: 24 }}>
                      <PhoneMockup>
                        <MockupComponent />
                      </PhoneMockup>
                    </GlassCard>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
