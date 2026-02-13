import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';
import { BrowserMockup } from './BrowserMockup';
import { PhoneMockup } from './PhoneMockup';
import { DesktopPropertiesScreenMockup, PropertiesScreenMockup } from './mockups';

export function ProductOverview() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section style={{
      paddingTop: isDesktop ? 120 : 80,
      paddingBottom: isDesktop ? 120 : 80,
      background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
    }}>
      <div style={{
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <SectionReveal>
          {isDesktop ? (
            <BrowserMockup width={900}>
              <DesktopPropertiesScreenMockup />
            </BrowserMockup>
          ) : (
            <PhoneMockup>
              <PropertiesScreenMockup />
            </PhoneMockup>
          )}
        </SectionReveal>

        <SectionReveal delay={200}>
          <p style={{
            fontSize: 20,
            color: '#a8a29e',
            textAlign: 'center',
            marginTop: 48,
            marginBottom: 0,
            fontWeight: 400,
          }}>
            Everything you need. Nothing you don&apos;t.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
