import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Floating button that appears when scrolled past hero section.
 * Scrolls user back to top when clicked.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleScroll = () => {
      // Show button after scrolling past ~80% of viewport height (hero section)
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (Platform.OS === 'web') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <Pressable
      onPress={scrollToTop}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#ffffff' }}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'fixed',
    bottom: 32,
    right: 32,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
    // @ts-ignore - web styles
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    zIndex: 1000,
    // @ts-ignore - web animation
    animation: 'fadeInUp 0.3s ease',
    transition: 'all 0.2s ease',
  },
  buttonPressed: {
    // @ts-ignore - web transform
    transform: 'scale(0.95)',
    opacity: 0.9,
  },
});
