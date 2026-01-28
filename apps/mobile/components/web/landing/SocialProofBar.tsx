import { useWindowDimensions } from 'react-native';
import { Colors, Breakpoints } from '@/constants/theme';
import { ScrollReveal } from './ScrollReveal';

const stats = [
  { value: '10,000+', label: 'Active Users' },
  { value: '50,000+', label: 'Properties Managed' },
  { value: '\u20B1100M+', label: 'Tracked Revenue' },
  { value: '4.8\u2605', label: 'App Rating' },
];

const featuredIn = ['Inquirer.net', 'Rappler', 'Manila Bulletin', 'Tech in Asia'];

/**
 * Social proof bar showing stats and featured logos.
 */
export function SocialProofBar() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.mobile;

  return (
    <section style={{
      paddingTop: 48,
      paddingBottom: 48,
      backgroundColor: Colors.neutral.white,
      borderTop: `1px solid ${Colors.neutral.gray100}`,
      borderBottom: `1px solid ${Colors.neutral.gray100}`,
    }}>
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        <p style={{
          textAlign: 'center',
          fontSize: 14,
          color: Colors.neutral.gray500,
          marginBottom: 32,
          margin: 0,
          marginBottom: 32,
        }}>
          Trusted by property owners across the Philippines
        </p>

        {/* Stats Grid */}
        <ScrollReveal>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            gap: 32,
            maxWidth: 800,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {stats.map((stat, index) => (
              <div key={stat.label} style={{
                textAlign: 'center',
                padding: 16,
              }}>
                <div style={{
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: Colors.primary.navy,
                  marginBottom: 4,
                }}>{stat.value}</div>
                <div style={{
                  fontSize: 14,
                  color: Colors.neutral.gray500,
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Featured In */}
        <div style={{
          marginTop: 40,
          paddingTop: 32,
          borderTop: `1px solid ${Colors.neutral.gray100}`,
        }}>
          <p style={{
            textAlign: 'center',
            fontSize: 12,
            color: Colors.neutral.gray400,
            letterSpacing: 1,
            marginBottom: 16,
            margin: 0,
            marginBottom: 16,
          }}>FEATURED IN</p>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 32,
            opacity: 0.5,
          }}>
            {featuredIn.map((name) => (
              <span key={name} style={{
                fontSize: 14,
                fontWeight: 500,
                color: Colors.neutral.gray400,
              }}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Styles not needed - using inline HTML styles
