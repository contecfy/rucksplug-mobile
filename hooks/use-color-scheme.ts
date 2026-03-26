import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeStore } from '@/store/theme-store';

export function useColorScheme() {
  const nativeColorScheme = useNativeColorScheme();
  const { theme } = useThemeStore();

  if (theme === 'system') {
    return nativeColorScheme;
  }
  return theme;
}
