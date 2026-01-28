import { Platform } from 'react-native';
import { useCallback } from 'react';

/**
 * Returns a keyboard event handler that calls onSubmit when Enter is pressed on web.
 * On native platforms, use onSubmitEditing prop on TextInput instead.
 */
export function useEnterSubmit(onSubmit: () => void, disabled?: boolean) {
  const handleKeyPress = useCallback(
    (e: any) => {
      if (Platform.OS !== 'web') return;
      if (disabled) return;
      if (e.nativeEvent?.key === 'Enter' || e.key === 'Enter') {
        e.preventDefault?.();
        onSubmit();
      }
    },
    [onSubmit, disabled]
  );

  return Platform.OS === 'web' ? { onKeyPress: handleKeyPress } : {};
}
