import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'precision' | 'boldPrecision';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: tintColor }] : undefined,
        type === 'precision' ? styles.precision : undefined,
        type === 'boldPrecision' ? styles.boldPrecision : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  precision: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  boldPrecision: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_700Bold',
  },
});
