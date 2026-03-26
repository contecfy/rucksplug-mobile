import { create } from 'zustand';
import { ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  theme: ColorSchemeName | 'system';
  setTheme: (theme: ColorSchemeName | 'system') => Promise<void>;
  initialize: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',

  setTheme: async (theme: ColorSchemeName | 'system') => {
    await SecureStore.setItemAsync('app_theme', theme || 'system');
    set({ theme });
  },

  initialize: async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('app_theme');
      if (savedTheme) {
        set({ theme: savedTheme as ColorSchemeName | 'system' });
      }
    } catch (error) {
      console.error('Failed to initialize theme store', error);
    }
  },
}));
