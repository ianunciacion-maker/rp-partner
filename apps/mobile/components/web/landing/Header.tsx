import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Breakpoints } from '@/constants/theme';

/**
 * Fixed header with scroll-triggered glassmorphism effect.
 */
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

  const headerStyle = scrolled
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        ...(Platform.OS === 'web' ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } : {}),
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.gray100,
      }
    : {
        backgroundColor: 'transparent',
      };

  return (
    <View style={[styles.header, headerStyle as any]}>
      <View style={[styles.headerContent, { paddingTop: isDesktop ? 16 : 28 }]}>
        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>TK</Text>
          </View>
          <Text style={[styles.logoName, scrolled && styles.logoNameScrolled]}>Tuknang</Text>
        </View>

        {/* Desktop Navigation */}
        {isDesktop && (
          <View style={styles.desktopNav}>
            <Pressable onPress={() => scrollToSection('features')}>
              <Text style={[styles.navLink, scrolled && styles.navLinkScrolled]}>Features</Text>
            </Pressable>
            <Pressable onPress={() => scrollToSection('pricing')}>
              <Text style={[styles.navLink, scrolled && styles.navLinkScrolled]}>Pricing</Text>
            </Pressable>
            <Pressable onPress={() => scrollToSection('faq')}>
              <Text style={[styles.navLink, scrolled && styles.navLinkScrolled]}>FAQ</Text>
            </Pressable>
          </View>
        )}

        {/* Desktop CTA */}
        {isDesktop && (
          <View style={styles.headerButtons}>
            <Pressable onPress={() => router.push('/(auth)/login')} style={styles.loginButton}>
              <Text style={[styles.loginButtonText, scrolled && styles.loginButtonTextScrolled]}>
                Log In
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(auth)/register')} style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Get Started</Text>
            </Pressable>
          </View>
        )}

        {/* Mobile Menu Button */}
        {!isDesktop && (
          <Pressable
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.menuButton}
          >
            <Text style={[styles.menuIcon, scrolled && styles.menuIconScrolled]}>
              {mobileMenuOpen ? '\u2715' : '\u2630'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Mobile Menu */}
      {!isDesktop && mobileMenuOpen && (
        <View style={[styles.mobileMenu, scrolled && styles.mobileMenuScrolled]}>
          <Pressable onPress={() => scrollToSection('features')} style={styles.mobileNavItem}>
            <Text style={styles.mobileNavText}>Features</Text>
          </Pressable>
          <Pressable onPress={() => scrollToSection('pricing')} style={styles.mobileNavItem}>
            <Text style={styles.mobileNavText}>Pricing</Text>
          </Pressable>
          <Pressable onPress={() => scrollToSection('faq')} style={styles.mobileNavItem}>
            <Text style={styles.mobileNavText}>FAQ</Text>
          </Pressable>
          <View style={styles.mobileMenuButtons}>
            <Pressable onPress={() => router.push('/(auth)/login')} style={styles.mobileLoginButton}>
              <Text style={styles.mobileLoginText}>Log In</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(auth)/register')} style={styles.mobileSignupButton}>
              <Text style={styles.mobileSignupText}>Get Started</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    // @ts-ignore - web transition
    transition: 'all 0.3s ease',
  },
  headerContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoNameScrolled: {
    color: Colors.primary.navy,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  navLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    fontSize: 15,
  },
  navLinkScrolled: {
    color: Colors.neutral.gray600,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  loginButtonTextScrolled: {
    color: Colors.primary.navy,
  },
  signupButton: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  signupButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  menuIconScrolled: {
    color: Colors.primary.navy,
  },
  mobileMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
  },
  mobileMenuScrolled: {
    backgroundColor: '#ffffff',
  },
  mobileNavItem: {
    paddingVertical: 12,
  },
  mobileNavText: {
    fontSize: 16,
    color: Colors.neutral.gray600,
    fontWeight: '500',
  },
  mobileMenuButtons: {
    marginTop: 16,
    gap: 12,
  },
  mobileLoginButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    borderRadius: 8,
  },
  mobileLoginText: {
    color: Colors.primary.navy,
    fontWeight: '500',
  },
  mobileSignupButton: {
    backgroundColor: Colors.primary.teal,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mobileSignupText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
