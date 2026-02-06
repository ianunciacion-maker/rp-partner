import { useWindowDimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Breakpoints } from '@/constants/theme';

const FOOTER_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: 'mailto:ian@autonoiq.com', label: 'Contact' },
];

/**
 * Main site footer with working links only.
 */
export function Footer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  const handleLinkPress = (href: string) => {
    if (Platform.OS !== 'web') return;

    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href.startsWith('mailto:')) {
      window.open(href, '_blank');
    } else {
      router.push(href as any);
    }
  };

  return (
    <footer style={{
      backgroundColor: Colors.neutral.gray50,
      borderTop: `1px solid ${Colors.neutral.gray100}`,
      paddingTop: 48,
      paddingBottom: 48,
    }}>
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'flex-start' : 'center',
          gap: isDesktop ? 48 : 32,
        }}>
          {/* Brand Column */}
          <div style={{
            flex: isDesktop ? 1 : 'none',
            textAlign: isDesktop ? 'left' : 'center',
          }}>
            <div style={{ marginBottom: 16 }}>
              <Image
                source={require('@/assets/images/tuknang-logo-whitetext.png')}
                style={{
                  width: 160,
                  height: 42,
                  // @ts-ignore - web filter to make white logo dark
                  filter: 'brightness(0)',
                }}
                resizeMode="contain"
              />
            </div>
            <p style={{
              fontSize: 14,
              color: Colors.neutral.gray500,
              lineHeight: 1.6,
              maxWidth: 280,
              margin: isDesktop ? 0 : '0 auto',
            }}>
              The all-in-one property management app for Filipino landlords.
            </p>
          </div>

          {/* Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: isDesktop ? 32 : 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {FOOTER_LINKS.map((link) => (
              <span
                key={link.label}
                onClick={() => handleLinkPress(link.href)}
                style={{
                  fontSize: 14,
                  color: Colors.neutral.gray600,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.color = Colors.primary.teal;
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.color = Colors.neutral.gray600;
                }}
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          marginTop: 48,
          paddingTop: 32,
          borderTop: `1px solid ${Colors.neutral.gray200}`,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 14, color: Colors.neutral.gray500 }}>
            {'\u00A9'} 2026 Tuknang. Made with {'\u2764'} in the Philippines.
          </span>
        </div>
      </div>
    </footer>
  );
}
