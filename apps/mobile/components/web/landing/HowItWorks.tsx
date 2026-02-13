import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up in seconds. No credit card needed, no complicated setup.',
  },
  {
    number: '02',
    title: 'Add your property',
    description: 'Enter your property details, set your rates, and upload photos.',
  },
  {
    number: '03',
    title: 'Start managing',
    description: 'Track bookings, manage finances, and grow your rental business.',
  },
];

export function HowItWorks() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section style={{
      paddingTop: isDesktop ? 120 : 80,
      paddingBottom: isDesktop ? 120 : 80,
      backgroundColor: '#0c1a2e',
    }}>
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <SectionReveal>
          <div style={{ textAlign: 'center', marginBottom: isDesktop ? 80 : 56 }}>
            <span style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#0d9488',
              marginBottom: 16,
            }}>
              How It Works
            </span>
            <h2 style={{
              fontSize: isDesktop ? 52 : 32,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.1,
            }}>
              Up and running in minutes
            </h2>
          </div>
        </SectionReveal>

        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: isDesktop ? 0 : 48,
          alignItems: isDesktop ? 'flex-start' : 'center',
          position: 'relative',
        }}>
          {isDesktop && (
            <div style={{
              position: 'absolute',
              top: 40,
              left: '20%',
              right: '20%',
              height: 2,
              backgroundColor: 'rgba(13, 148, 136, 0.3)',
            }} />
          )}

          {steps.map((step, i) => (
            <SectionReveal key={i} delay={i * 200}>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: isDesktop ? '0 32px' : '0 16px',
                position: 'relative',
              }}>
                <span style={{
                  fontSize: 80,
                  fontWeight: 800,
                  color: '#0d9488',
                  lineHeight: 1,
                  marginBottom: 24,
                  opacity: 0.9,
                }}>
                  {step.number}
                </span>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: 12,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: 280,
                }}>
                  {step.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
