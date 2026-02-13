import { Platform } from 'react-native';
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
import { ProblemStatement } from './landing/ProblemStatement';
import { ProductOverview } from './landing/ProductOverview';
import { HowItWorks } from './landing/HowItWorks';
import { SocialProof } from './landing/SocialProof';

if (Platform.OS !== 'web') {
  module.exports = { default: () => null };
}

export default function LandingPage() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        #root {
          min-height: 100vh;
        }

        h1, h2, h3, h4, h5, h6, p, span, a, li, div {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        a, button, [role="button"] {
          transition: all 0.2s ease;
        }

        button:hover, [role="button"]:hover {
          transform: translateY(-1px);
        }

        button:active, [role="button"]:active {
          transform: translateY(0);
        }

        /* SectionReveal animation classes */
        .sr {
          opacity: 0;
          transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sr.sr-up {
          transform: translateY(24px);
        }

        .sr.sr-left {
          transform: translateX(-24px);
        }

        .sr.sr-right {
          transform: translateX(24px);
        }

        .sr.sr-visible {
          opacity: 1;
          transform: translateY(0) translateX(0);
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
      backgroundColor: '#fafaf9',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Hero />
        <ProblemStatement />
        <ProductOverview />
        <FeaturesShowcase />
        <HowItWorks />
        <SocialProof />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
