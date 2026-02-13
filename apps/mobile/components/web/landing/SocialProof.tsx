import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';

const testimonials = [
  {
    quote: 'Tuknang replaced my messy spreadsheets and WhatsApp reminders. Now I manage three condos without breaking a sweat.',
    name: 'Maria S.',
    location: 'Makati',
  },
  {
    quote: 'The cashflow tracking alone is worth it. I finally know exactly how much each property earns after expenses.',
    name: 'Jose R.',
    location: 'Tagaytay',
  },
  {
    quote: 'My guests love the professional booking experience, and I love not having to check five different apps.',
    name: 'Ana L.',
    location: 'La Union',
  },
];

export function SocialProof() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section style={{
      paddingTop: isDesktop ? 120 : 80,
      paddingBottom: isDesktop ? 120 : 80,
      backgroundColor: '#ffffff',
    }}>
      <div style={{
        maxWidth: 1200,
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
              Testimonials
            </span>
            <h2 style={{
              fontSize: isDesktop ? 52 : 32,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: '#1c1917',
              margin: 0,
              lineHeight: 1.1,
            }}>
              Loved by property owners
            </h2>
          </div>
        </SectionReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr 1fr' : '1fr',
          gap: 32,
          marginBottom: 64,
        }}>
          {testimonials.map((t, i) => (
            <SectionReveal key={i} delay={i * 150}>
              <div style={{
                padding: 32,
                borderRadius: 16,
                backgroundColor: '#fafaf9',
                border: '1px solid #e7e5e4',
              }}>
                <span style={{
                  fontSize: 48,
                  lineHeight: 1,
                  color: 'rgba(13, 148, 136, 0.3)',
                  display: 'block',
                  marginBottom: 16,
                  fontFamily: 'Georgia, serif',
                }}>
                  {'\u201C'}
                </span>
                <p style={{
                  fontSize: 18,
                  fontStyle: 'italic',
                  color: '#57534e',
                  lineHeight: 1.7,
                  margin: 0,
                  marginBottom: 24,
                }}>
                  {t.quote}
                </p>
                <p style={{
                  fontSize: 14,
                  color: '#a8a29e',
                  margin: 0,
                  fontWeight: 600,
                }}>
                  {t.name} — {t.location}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={400}>
          <p style={{
            textAlign: 'center',
            fontSize: 16,
            color: '#a8a29e',
            margin: 0,
          }}>
            Trusted by property owners in Tagaytay, Makati, La Union, Boracay, and more
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
