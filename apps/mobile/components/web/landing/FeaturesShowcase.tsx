import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';
import { PhoneMockup } from './PhoneMockup';
import { BrowserMockup } from './BrowserMockup';
import {
  CalendarScreenMockup,
  CashflowScreenMockup,
  GuestScreenMockup,
  DesktopCalendarScreenMockup,
  DesktopCashflowScreenMockup,
  DesktopGuestScreenMockup,
} from './mockups';

export function FeaturesShowcase() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section id="features">
      {/* Feature 1 — Calendar */}
      <div style={{
        paddingTop: isDesktop ? 120 : 80,
        paddingBottom: isDesktop ? 120 : 80,
        backgroundColor: '#ffffff',
      }}>
        <div style={{
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 24,
          paddingRight: 24,
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'center',
          gap: isDesktop ? 80 : 48,
        }}>
          <div style={{ flex: 1 }}>
            <SectionReveal>
              <span style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#0d9488',
                marginBottom: 16,
              }}>
                Calendar
              </span>
              <h2 style={{
                fontSize: isDesktop ? 52 : 32,
                fontWeight: 700,
                letterSpacing: -1.5,
                color: '#1c1917',
                margin: 0,
                marginBottom: 24,
                lineHeight: 1.1,
              }}>
                Never double-book again
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}>
                {[
                  'See all reservations at a glance across properties',
                  'Block dates for maintenance or personal use',
                  'Share your calendar with a public link',
                ].map((bullet) => (
                  <li key={bullet} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#0d9488',
                      marginTop: 8,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 18,
                      color: '#57534e',
                      lineHeight: 1.6,
                    }}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>
          <div style={{
            flex: isDesktop ? 1 : undefined,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <SectionReveal direction="right" delay={200}>
              {isDesktop ? (
                <BrowserMockup width="100%">
                  <DesktopCalendarScreenMockup />
                </BrowserMockup>
              ) : (
                <PhoneMockup>
                  <CalendarScreenMockup />
                </PhoneMockup>
              )}
            </SectionReveal>
          </div>
        </div>
      </div>

      {/* Feature 2 — Finances */}
      <div style={{
        paddingTop: isDesktop ? 120 : 80,
        paddingBottom: isDesktop ? 120 : 80,
        backgroundColor: '#fafaf9',
      }}>
        <div style={{
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 24,
          paddingRight: 24,
          display: 'flex',
          flexDirection: isDesktop ? 'row-reverse' : 'column',
          alignItems: 'center',
          gap: isDesktop ? 80 : 48,
        }}>
          <div style={{ flex: 1 }}>
            <SectionReveal>
              <span style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#0d9488',
                marginBottom: 16,
              }}>
                Finances
              </span>
              <h2 style={{
                fontSize: isDesktop ? 52 : 32,
                fontWeight: 700,
                letterSpacing: -1.5,
                color: '#1c1917',
                margin: 0,
                marginBottom: 24,
                lineHeight: 1.1,
              }}>
                Know where every peso goes
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}>
                {[
                  'Track income and expenses per property',
                  'Upload receipts for every transaction',
                  'See your profitability at a glance',
                ].map((bullet) => (
                  <li key={bullet} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#0d9488',
                      marginTop: 8,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 18,
                      color: '#57534e',
                      lineHeight: 1.6,
                    }}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>
          <div style={{
            flex: isDesktop ? 1 : undefined,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <SectionReveal direction="left" delay={200}>
              {isDesktop ? (
                <BrowserMockup width="100%">
                  <DesktopCashflowScreenMockup />
                </BrowserMockup>
              ) : (
                <PhoneMockup>
                  <CashflowScreenMockup />
                </PhoneMockup>
              )}
            </SectionReveal>
          </div>
        </div>
      </div>

      {/* Feature 3 — Guest Management */}
      <div style={{
        paddingTop: isDesktop ? 120 : 80,
        paddingBottom: isDesktop ? 120 : 80,
        backgroundColor: '#ffffff',
      }}>
        <div style={{
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 24,
          paddingRight: 24,
        }}>
          <SectionReveal>
            <div style={{ textAlign: 'center', marginBottom: isDesktop ? 64 : 48 }}>
              <span style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#0d9488',
                marginBottom: 16,
              }}>
                Guests
              </span>
              <h2 style={{
                fontSize: isDesktop ? 52 : 32,
                fontWeight: 700,
                letterSpacing: -1.5,
                color: '#1c1917',
                margin: 0,
                lineHeight: 1.1,
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Professional guest management
              </h2>
            </div>
          </SectionReveal>
          <SectionReveal delay={200}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {isDesktop ? (
                <BrowserMockup width={900}>
                  <DesktopGuestScreenMockup />
                </BrowserMockup>
              ) : (
                <PhoneMockup>
                  <GuestScreenMockup />
                </PhoneMockup>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
