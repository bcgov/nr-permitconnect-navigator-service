// Design tokens ref https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/material/base/index.js
import Material from '@primevue/themes/material';

import { definePreset } from '@primevue/themes';

//https://maketintsandshades.com/#003366

// Must use lower case for key values unless you want pain
// bcblue.500 is BC mandated blue

// For colors UI/UX gives us (BC gov sanctioned), ask for hues on either side and assume original colour is 500
// Could be defining hues for design colours for the design guidelines
// Otherwise, ask them to use https://primevue.org/theming/styled/#colors in the table

// Bring up slate hue range, replace hard set variables.scss
export const ThemeOverride = definePreset(Material, {
  primitive: {
    bcblue: {
      50: '#8099b3',
      100: '#6685a3',
      200: '#4d7094',
      300: '#335c85',
      400: '#1a4775',
      500: '#003366',
      600: '#002e5c',
      700: '#002952',
      800: '#002447',
      900: '#001f3d',
      950: '#001a33'
    },
    // Override base red theme
    // For base values see: https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/material/base/index.js
    red: {
      50: '#ec9497',
      100: '#e87f82',
      200: '#e4696d',
      300: '#e05459',
      400: '#dc3e44',
      500: '#D8292F',
      600: '#c2252a',
      700: '#ad2126',
      800: '#971d21',
      900: '#82191c',
      950: '#6c1518'
    },
    linktext: '#1a5a96',
    linktexthover: '#0000ff',
    hover: '#4696EC',
    outlineonprimary: '#fff',
    outoffocus: '#ccc',
    green: '#2e8540',
    grey: '#e9ecef'
  },
  semantic: {
    primary: {
      50: '{bcblue.50}',
      100: '{bcblue.100}',
      200: '{bcblue.200}',
      300: '{bcblue.300}',
      400: '{bcblue.400}',
      500: '{bcblue.500}',
      600: '{bcblue.600}',
      700: '{bcblue.700}',
      800: '{bcblue.800}',
      900: '{bcblue.900}',
      950: '{bcblue.950}'
    },
    colorScheme: {
      light: {
        // For demo
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
        }
      }
    }
  }
});
