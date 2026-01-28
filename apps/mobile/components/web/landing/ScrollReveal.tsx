import { useRef, useEffect, useState, ReactNode } from 'react';
import { Animated, View, StyleSheet, Platform, ViewStyle } from 'react-native';

type Direction = 'up' | 'down' | 'left' | 'right';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Scroll-triggered reveal animation wrapper.
 * Uses IntersectionObserver on web for scroll detection.
 */
export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  style,
}: ScrollRevealProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;
  const viewRef = useRef<View>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const getTranslateDirection = () => {
    switch (direction) {
      case 'up':
        return { translateY: translateAnim };
      case 'down':
        return { translateY: Animated.multiply(translateAnim, -1) };
      case 'left':
        return { translateX: translateAnim };
      case 'right':
        return { translateX: Animated.multiply(translateAnim, -1) };
      default:
        return { translateY: translateAnim };
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || hasAnimated) {
      // On native, animate immediately
      if (!hasAnimated) {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateAnim, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]).start();
          setHasAnimated(true);
        }, 100);
      }
      return;
    }

    // Web: Use IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(translateAnim, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
              }),
            ]).start();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Get the DOM node
    const node = viewRef.current as unknown as Element;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [fadeAnim, translateAnim, delay, duration, hasAnimated]);

  return (
    <Animated.View
      ref={viewRef}
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [getTranslateDirection()],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexShrink: 0,
  },
});
