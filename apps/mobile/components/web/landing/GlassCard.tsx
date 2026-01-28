import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'colored';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

/**
 * Glassmorphism card component with blur effect on web.
 */
export function GlassCard({
  children,
  variant = 'default',
  hoverable = false,
  padding = 'none',
  style,
}: GlassCardProps) {
  const paddingValue = {
    none: 0,
    sm: 16,
    md: 24,
    lg: 32,
  }[padding];

  const bgColor = {
    default: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(255, 255, 255, 0.85)',
    colored: 'rgba(56, 178, 172, 0.1)',
  }[variant];

  const borderColor = variant === 'colored'
    ? 'rgba(56, 178, 172, 0.2)'
    : 'rgba(255, 255, 255, 0.3)';

  const webStyle = Platform.OS === 'web' ? {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    ...(hoverable ? { ':hover': { transform: 'translateY(-4px)' } } : {}),
  } : {};

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          padding: paddingValue,
        },
        webStyle as ViewStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
});
