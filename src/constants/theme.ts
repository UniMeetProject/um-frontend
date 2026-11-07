/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17211B',
    background: '#FBFDFC',
    backgroundElement: '#EEF4F2',
    backgroundSelected: '#DCEBE8',
    textSecondary: '#60716A',
    primary: '#0F766E',
    primaryText: '#FFFFFF',
    coverage0: '#F0FDF4',
    coverage1: '#DCFCE7',
    coverage2: '#86EFAC',
    coverage3: '#22C55E',
    coverage4: '#15803D',
    warning: '#B45309',
    warningBackground: '#FEF3C7',
    danger: '#B91C1C',
    dangerBackground: '#FEE2E2',
  },
  dark: {
    text: '#F4FAF7',
    background: '#101815',
    backgroundElement: '#1B2521',
    backgroundSelected: '#283832',
    textSecondary: '#A9BBB4',
    primary: '#2DD4BF',
    primaryText: '#062B27',
    coverage0: '#142019',
    coverage1: '#173B27',
    coverage2: '#166534',
    coverage3: '#22C55E',
    coverage4: '#86EFAC',
    warning: '#FBBF24',
    warningBackground: '#3A2A08',
    danger: '#F87171',
    dangerBackground: '#431A1A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
