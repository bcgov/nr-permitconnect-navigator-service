import Lara from '@primevue/themes/lara';
import { definePreset } from '@primevue/themes';

export const LaraOverrided = definePreset(Lara, {
  primitive: {
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344'
    },
    white: '#fff',
    grey: '#e9ecef',
    surfaceBackground: '#f8f9fa'
  },
  semantic: {
    primary: {
      50: '#036',
      100: '#036',
      200: '#036',
      300: '#036',
      400: '#036',
      500: '#036',
      600: '#036',
      700: '#036',
      800: '#036',
      900: '#036',
      950: '#036'
    },
    colorScheme: {
      light: {
        highlight: {
          background: '{surfaceBackground}'
        }
      }
    }
  }
});
