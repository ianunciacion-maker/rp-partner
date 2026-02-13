import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';
import { ScatteredIcon, ChartIcon, ClockIcon } from './icons';

const painPoints = [
  {
    icon: ScatteredIcon,
    text: 'Scattered bookings across notebooks and WhatsApp threads',
  },
  {
    icon: ChartIcon,
    text: 'No clear picture of your income vs expenses',
  },
  {
    icon: ClockIcon,
    text: 'Hours wasted on tasks that should take minutes',
  },
];

export function ProblemStatement() {
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
          <span style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#0d9488',
            marginBottom: 16,
            textAlign: isDesktop ? 'left' : 'center',
          }}>
            The Challenge
          </span>
          <h2 style={{
            fontSize: isDesktop ? 52 : 32,
            fontWeight: 700,
            letterSpacing: -1.5,
            color: '#1c1917',
            margin: 0,
            marginBottom: 64,
            lineHeight: 1.1,
            maxWidth: 700,
            textAlign: isDesktop ? 'left' : 'center',
          }}>
            Managing rentals shouldn&apos;t mean managing chaos
          </h2>
        </SectionReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr 1fr' : '1fr',
          gap: isDesktop ? 48 : 32,
        }}>
          {painPoints.map((point, i) => {
            const IconComponent = point.icon;
            return (
              <SectionReveal key={i} delay={i * 150}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isDesktop ? 'flex-start' : 'center',
                  gap: 16,
                }}>
                  <IconComponent size={24} color="#a8a29e" />
                  <p style={{
                    fontSize: 18,
                    color: '#57534e',
                    lineHeight: 1.6,
                    margin: 0,
                    textAlign: isDesktop ? 'left' : 'center',
                  }}>
                    {point.text}
                  </p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
