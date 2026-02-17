import { Platform } from 'react-native';

export const Colors = {
  primary: {
    navy: '#0c1a2e',
    teal: '#0d9488',
  },
  neutral: {
    white: '#ffffff',
    gray50: '#fafaf9',
    gray100: '#f5f5f4',
    gray200: '#e7e5e4',
    gray300: '#d6d3d1',
    gray400: '#a8a29e',
    gray500: '#78716c',
    gray600: '#57534e',
    gray700: '#44403c',
    gray800: '#292524',
    gray900: '#1c1917',
    black: '#000000',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  dark: {
    background: '#0c1a2e',
    surface: '#1e293b',
    border: '#334155',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export const ResponsiveSpacing = {
  pagePadding: {
    mobile: Spacing.md,
    tablet: Spacing.lg,
    desktop: Spacing.xl,
  },
  sectionGap: {
    mobile: Spacing.lg,
    tablet: Spacing.xl,
    desktop: Spacing.xxl,
  },
  cardPadding: {
    mobile: Spacing.md,
    tablet: Spacing.lg,
    desktop: Spacing.lg,
  },
} as const;

export const getResponsiveValue = <T,>(
  values: { mobile: T; tablet?: T; desktop?: T },
  width: number
): T => {
  if (width >= Breakpoints.tablet && values.desktop !== undefined) {
    return values.desktop;
  }
  if (width >= Breakpoints.mobile && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.mobile;
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  fontFamily: {
    regular: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_400Regular',
    }),
    medium: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_500Medium',
    }),
    semibold: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_600SemiBold',
    }),
    bold: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_700Bold',
    }),
    extrabold: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_800ExtraBold',
    }),
  },
  letterSpacing: {
    tight: -1.5,
    normal: 0,
    wide: 1.5,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const CardStyle = {
  backgroundColor: Colors.neutral.white,
  borderWidth: 1,
  borderColor: Colors.neutral.gray200,
  borderRadius: BorderRadius.lg,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
};
