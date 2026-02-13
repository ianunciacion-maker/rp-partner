import { useState, useEffect, useRef } from 'react';
import { Text, Pressable, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Breakpoints } from '@/constants/theme';
import { PhoneMockup } from './PhoneMockup';
import { BrowserMockup } from './BrowserMockup';
import { PropertiesScreenMockup, DesktopPropertiesScreenMockup } from './mockups';

export function Hero() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;
  const [scrollY, setScrollY] = useState(0);
  const videoContainerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const container = videoContainerRef.current;
    if (!container) return;

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.src = '/videos/herobg.mov';
    Object.assign(video.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
    container.appendChild(video);
    video.play().catch(() => {});

    return () => {
      container.removeChild(video);
    };
  }, []);

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0c1a2e',
    }}>
      {/* Video background container — video injected via DOM API */}
      <div
        ref={videoContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1,
      }} />
      {/* Teal radial accent */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 80% 20%, rgba(13,148,136,0.15) 0%, transparent 60%)',
        transform: `translateY(${scrollY * 0.3}px)`,
        zIndex: 1,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: isDesktop ? 160 : 130,
        paddingBottom: isDesktop ? 80 : 60,
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: 'center',
        gap: isDesktop ? 64 : 48,
      }}>
        <div style={{
          flex: 1,
          maxWidth: isDesktop ? '50%' : '100%',
          textAlign: isDesktop ? 'left' : 'center',
        }}>
          <div className="hero-anim" style={{
            opacity: 0,
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards',
          }}>
            <span style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#0d9488',
              marginBottom: 24,
            }}>
              Built for Filipino Property Owners
            </span>
          </div>

          <div className="hero-anim" style={{
            opacity: 0,
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 400ms forwards',
          }}>
            <h1 style={{
              fontSize: isDesktop ? 80 : 44,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: isDesktop ? -3 : -1.5,
              margin: 0,
              marginBottom: 24,
            }}>
              Manage your rentals with clarity
            </h1>
          </div>

          <div className="hero-anim" style={{
            opacity: 0,
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 600ms forwards',
          }}>
            <p style={{
              fontSize: isDesktop ? 20 : 18,
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 40,
              maxWidth: isDesktop ? 480 : '100%',
              marginLeft: isDesktop ? 0 : 'auto',
              marginRight: isDesktop ? 0 : 'auto',
            }}>
              Track bookings, manage finances, and grow your rental business — all in one app.
            </p>
          </div>

          <div className="hero-anim" style={{
            opacity: 0,
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 800ms forwards',
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'center',
            gap: 16,
          }}>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              style={{
                backgroundColor: '#0d9488',
                paddingHorizontal: 36,
                paddingVertical: 18,
                borderRadius: 100,
              }}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: 18,
                fontWeight: '600',
              }}>
                Get Started Free
              </Text>
            </Pressable>
            <span
              onClick={() => {
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              See how it works →
            </span>
          </div>

          <div className="hero-anim" style={{
            opacity: 0,
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 1000ms forwards',
            marginTop: 24,
          }}>
            <span style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              Free forever. No credit card required.
            </span>
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: isDesktop ? '55%' : '100%',
        }}>
          <div className="hero-anim" style={{
            opacity: 0,
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 600ms forwards',
            width: '100%',
          }}>
            {isDesktop ? (
              <BrowserMockup width="100%">
                <DesktopPropertiesScreenMockup />
              </BrowserMockup>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <div style={{
                  boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                  borderRadius: 40,
                }}>
                  <PhoneMockup>
                    <PropertiesScreenMockup />
                  </PhoneMockup>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
