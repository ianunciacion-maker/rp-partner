import { StyleSheet, Platform, View } from 'react-native';
import { useEffect } from 'react';
import {
  Header,
  Hero,
  FeaturesShowcase,
  PricingSection,
  FAQ,
  FinalCTA,
  Footer,
  ScrollToTop,
} from './landing';

// Only render on web
if (Platform.OS !== 'web') {
  module.exports = { default: () => null };
}

/**
 * Full landing page for tuknang.com web experience.
 * Composed of multiple sections matching the rpwebsite design.
 */
export default function LandingPage() {
  // Inject global CSS for web animations
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        #root {
          min-height: 100vh;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Smooth transitions */
        a, button, [role="button"] {
          transition: all 0.2s ease;
        }

        /* Better button hover states */
        button:hover, [role="button"]:hover {
          transform: translateY(-1px);
        }

        button:active, [role="button"]:active {
          transform: translateY(0);
        }
      `;
      if (!document.getElementById('landing-styles')) {
        style.id = 'landing-styles';
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Hero />
        <FeaturesShowcase />
        <PricingSection />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
      <ScrollToTop />
    </div>
  );
}
