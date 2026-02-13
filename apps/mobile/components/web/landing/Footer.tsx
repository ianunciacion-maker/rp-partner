import { useWindowDimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Breakpoints } from '@/constants/theme';

const FOOTER_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: 'mailto:ian@autonoiq.com', label: 'Contact' },
];

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
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e7e5e4',
      paddingTop: 48,
      paddingBottom: 48,
    }}>
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'center',
          justifyContent: 'space-between',
          gap: 32,
        }}>
          <Image
            source={require('@/assets/images/tuknang-logo-whitetext.png')}
            style={{
              width: 180,
              height: 46,
              // @ts-ignore
              filter: 'brightness(0)',
            }}
            resizeMode="contain"
          />

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
                  color: '#57534e',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.color = '#0d9488';
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.color = '#57534e';
                }}
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 48,
          paddingTop: 32,
          borderTop: '1px solid #e7e5e4',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 14, color: '#a8a29e' }}>
            {'\u00A9'} 2026 Tuknang. Made in the Philippines.
          </span>
        </div>
      </div>
    </footer>
  );
}
