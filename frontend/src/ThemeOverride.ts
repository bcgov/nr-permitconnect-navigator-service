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
    // bcblue: {
    //   50: '#F1F8FE',
    //   100: '#D8EAFD',
    //   200: '#A8D0FB',
    //   300: '#1E5189',
    //   400: '#3470B1',
    //   500: '#013366',
    //   600: '#3470B1',
    //   700: '#1E5189',
    //   800: '#A8D0FB',
    //   900: '#D8EAFD',
    //   950: '#F1F8FE'
    // },
    bcactiveblue: '#2E5DD7',
    bcblue: {
      50: '#F1F8FE',
      100: '#F1F8FE',
      200: '#D8EAFD',
      300: '#C1DDFC',
      400: '#A8D0FB',
      500: '#91C4FA',
      600: '#7AB8F9',
      700: '#5595D9',
      800: '#3470B1',
      900: '#1E5189',
      950: '#013366'
    },
    // Override base red theme
    // For base values see: https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/material/base/index.js
    red: {
      50: '#F1F8FE',
      100: '#F1F8FE',
      200: '#F1F8FE',
      300: '#F1F8FE',
      400: '#F1F8FE',
      500: '#CE3E39',
      600: '#A2312D',
      700: '#A2312D',
      800: '#A2312D',
      900: '#A2312D',
      950: '#A2312D'
    },
    greyscale: {
      50: '#FAF9F8',
      100: '#F3F2F1',
      200: '#ECEAE8',
      300: '#E0DEDC',
      400: '#D1CFCD',
      500: '#C6C5C3',
      600: '#9F9D9C',
      700: '#605E5C',
      800: '#3D3C3B',
      900: '#353433',
      950: '#252423'
    },
    linktext: '#1a5a96',
    linktexthover: '#0000ff',
    hover: '#4696EC',
    outlineonprimary: '#fff',
    outoffocus: '#ccc',
    green: '#2e8540',
    grey: '#e9ecef',
    highlightbackground: '#d9e1e8',
    tablestripebackground: '#f2f2f2'
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
        surface: {
          0: '#ffffff',
          50: '{greyscale.50}',
          100: '{greyscale.100}',
          200: '{greyscale.200}',
          300: '{greyscale.300}',
          400: '{greyscale.400}',
          500: '{greyscale.500}',
          600: '{greyscale.600}',
          700: '{greyscale.700}',
          800: '{greyscale.800}',
          900: '{greyscale.900}',
          950: '{greyscale.950}'
        },
        primary: {
          color: '{primary.950}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.900}',
          activeColor: '{primary.800}'
        }
      }
    }
  }
  // components: {
  //   button: {
  //     colorScheme: {
  //       light: {
  //         root: {
  //           primary: {
  //             active: {
  //               border: {
  //                 color: '{red.500}'
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //}
});
