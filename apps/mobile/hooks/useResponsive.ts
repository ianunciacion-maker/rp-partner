import { useWindowDimensions, Platform } from 'react-native';

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  isWeb: boolean;
}

export function useResponsive(): ResponsiveState {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    isWeb,
  };
}

export { BREAKPOINTS };
