import { useRef, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

type Direction = 'up' | 'left' | 'right';

interface SectionRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  style?: React.CSSProperties;
}

export function SectionReveal({
  children,
  direction = 'up',
  delay = 0,
  style: extraStyle,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('sr-visible');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass =
    direction === 'left'
      ? 'sr-left'
      : direction === 'right'
        ? 'sr-right'
        : 'sr-up';

  return (
    <div
      ref={ref}
      className={`sr ${directionClass}`}
      style={{ transitionDelay: `${delay}ms`, ...extraStyle }}
    >
      {children}
    </div>
  );
}
