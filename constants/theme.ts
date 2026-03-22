/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#000000';
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    card: '#F8F8F8',
    tint: tintColorLight,
    icon: '#333333',
    tabIconDefault: '#888888',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    card: '#1A1A1A',
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#777777',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  bentham: 'Bentham_400Regular',
  sans: Platform.select({
    ios: 'system-ui',
    default: 'normal',
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  }),
  serif: Platform.select({
    ios: 'ui-serif',
    default: 'serif',
    web: "Georgia, 'Times New Roman', serif",
  }),
  rounded: Platform.select({
    ios: 'ui-rounded',
    default: 'normal',
    web: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
  }),
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
    web: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  }),
};
