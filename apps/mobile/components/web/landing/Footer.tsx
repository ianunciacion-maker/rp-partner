import { Pressable, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Breakpoints } from '@/constants/theme';

const FOOTER_LINKS = {
  product: [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { label: 'Download App' },
  ],
  company: [
    { label: 'About Us' },
    { label: 'Contact' },
  ],
  resources: [
    { label: 'Help Center' },
    { label: 'Blog' },
  ],
  legal: [
    { label: 'Privacy Policy' },
    { label: 'Terms of Service' },
  ],
};

/**
 * Main site footer with links and social icons.
 */
export function Footer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  const scrollToSection = (href: string) => {
    if (Platform.OS === 'web' && href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
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
          gap: isDesktop ? 48 : 32,
        }}>
          {/* Brand Column */}
          <div style={{
            flex: isDesktop ? 2 : 'none',
            marginBottom: isDesktop ? 0 : 24,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: Colors.primary.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: Colors.neutral.white, fontWeight: 'bold', fontSize: 12 }}>TK</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary.navy }}>Tuknang</span>
            </div>
            <p style={{
              fontSize: 14,
              color: Colors.neutral.gray500,
              lineHeight: 1.6,
              maxWidth: 280,
              margin: 0,
            }}>
              The all-in-one property management app for Filipino landlords.
            </p>
          </div>

          {/* Product Links */}
          <div style={{ flex: 1, minWidth: 120 }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray900,
              marginBottom: 16,
              margin: 0,
              marginBottom: 16,
            }}>Product</h4>
            {FOOTER_LINKS.product.map((link) => (
              <p
                key={link.label}
                onClick={() => link.href && scrollToSection(link.href)}
                style={{
                  fontSize: 14,
                  color: Colors.neutral.gray600,
                  marginBottom: 12,
                  cursor: link.href ? 'pointer' : 'default',
                  margin: 0,
                  marginBottom: 12,
                }}
              >{link.label}</p>
            ))}
          </div>

          {/* Company Links */}
          <div style={{ flex: 1, minWidth: 120 }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray900,
              marginBottom: 16,
              margin: 0,
              marginBottom: 16,
            }}>Company</h4>
            {FOOTER_LINKS.company.map((link) => (
              <p key={link.label} style={{
                fontSize: 14,
                color: Colors.neutral.gray600,
                marginBottom: 12,
                margin: 0,
                marginBottom: 12,
              }}>{link.label}</p>
            ))}
          </div>

          {/* Resources Links */}
          <div style={{ flex: 1, minWidth: 120 }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray900,
              marginBottom: 16,
              margin: 0,
              marginBottom: 16,
            }}>Resources</h4>
            {FOOTER_LINKS.resources.map((link) => (
              <p key={link.label} style={{
                fontSize: 14,
                color: Colors.neutral.gray600,
                marginBottom: 12,
                margin: 0,
                marginBottom: 12,
              }}>{link.label}</p>
            ))}
          </div>

          {/* Legal Links */}
          <div style={{ flex: 1, minWidth: 120 }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: Colors.neutral.gray900,
              marginBottom: 16,
              margin: 0,
              marginBottom: 16,
            }}>Legal</h4>
            {FOOTER_LINKS.legal.map((link) => (
              <p key={link.label} style={{
                fontSize: 14,
                color: Colors.neutral.gray600,
                marginBottom: 12,
                margin: 0,
                marginBottom: 12,
              }}>{link.label}</p>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          marginTop: 48,
          paddingTop: 32,
          borderTop: `1px solid ${Colors.neutral.gray200}`,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <span style={{ fontSize: 14, color: Colors.neutral.gray500 }}>
            {'\u00A9'} 2026 Tuknang. Made with {'\u2764'} in the Philippines.
          </span>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 24,
          }}>
            {/* Facebook */}
            <span style={{ fontSize: 16, color: Colors.neutral.gray400, cursor: 'pointer' }}>f</span>
            {/* Instagram */}
            <span style={{ fontSize: 16, color: Colors.neutral.gray400, cursor: 'pointer' }}>{'\u{1F4F7}'}</span>
            {/* TikTok */}
            <span style={{ fontSize: 16, color: Colors.neutral.gray400, cursor: 'pointer' }}>{'\u{266B}'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
