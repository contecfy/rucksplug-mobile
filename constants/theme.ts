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
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    info: '#2196F3',
    borderColor: 'rgba(0,0,0,0.05)',
    white: '#FFFFFF',
    black: '#000000',
    mutedText: '#999999',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    card: '#1A1A1A',
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#777777',
    tabIconSelected: tintColorDark,
    success: '#66BB6A',
    warning: '#FFD54F',
    danger: '#EF5350',
    info: '#42A5F5',
    borderColor: 'rgba(255,255,255,0.1)',
    white: '#FFFFFF',
    black: '#000000',
    mutedText: '#666666',
  },
};

export const Fonts = {
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
