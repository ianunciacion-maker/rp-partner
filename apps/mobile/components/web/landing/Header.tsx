import { useState, useEffect } from 'react';
import { Pressable, Platform, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Breakpoints } from '@/constants/theme';
import { MenuIcon, CloseIcon } from './icons';

export function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (Platform.OS === 'web') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid #e7e5e4' : '1px solid transparent',
    } as any}>
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: isDesktop ? 16 : 20,
        paddingBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Image
          source={require('@/assets/images/tuknang-logo-whitetext.png')}
          style={{
            width: isDesktop ? 200 : 160,
            height: isDesktop ? 52 : 42,
            // @ts-ignore
            filter: scrolled ? 'brightness(0)' : 'none',
            transition: 'filter 0.3s ease',
          }}
          resizeMode="contain"
        />

        {isDesktop && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {['features', 'pricing', 'faq'].map((id) => (
              <span
                key={id}
                onClick={() => scrollToSection(id)}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: scrolled ? '#57534e' : 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {id === 'faq' ? 'FAQ' : id.charAt(0).toUpperCase() + id.slice(1)}
              </span>
            ))}
          </nav>
        )}

        {isDesktop && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              onClick={() => router.push('/(auth)/login')}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: scrolled ? '#1c1917' : 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              Log In
            </span>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              style={{
                backgroundColor: '#0d9488',
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 100,
              }}
            >
              <span style={{
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 600,
              }}>
                Get Started
              </span>
            </Pressable>
          </div>
        )}

        {!isDesktop && (
          <Pressable
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: 8 }}
          >
            {mobileMenuOpen
              ? <CloseIcon size={24} color={scrolled ? '#1c1917' : '#ffffff'} />
              : <MenuIcon size={24} color={scrolled ? '#1c1917' : '#ffffff'} />
            }
          </Pressable>
        )}
      </div>

      {!isDesktop && mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 8,
          paddingBottom: 24,
          borderTop: '1px solid #e7e5e4',
        }}>
          {['features', 'pricing', 'faq'].map((id) => (
            <div
              key={id}
              onClick={() => scrollToSection(id)}
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                fontSize: 16,
                fontWeight: 500,
                color: '#57534e',
                cursor: 'pointer',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {id === 'faq' ? 'FAQ' : id.charAt(0).toUpperCase() + id.slice(1)}
            </div>
          ))}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              onClick={() => { router.push('/(auth)/login'); setMobileMenuOpen(false); }}
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 500,
                color: '#1c1917',
                border: '1px solid #e7e5e4',
                borderRadius: 12,
                cursor: 'pointer',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Log In
            </div>
            <div
              onClick={() => { router.push('/(auth)/register'); setMobileMenuOpen(false); }}
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#0d9488',
                borderRadius: 12,
                cursor: 'pointer',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Get Started
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
