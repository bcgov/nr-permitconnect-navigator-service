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

// Some values override base color values.
// Base values here: https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/material/base/index.js
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
    green: {
      // Override base red theme, for base values see link at top
      50: '#42814A',
      100: '#42814A',
      200: '#42814A',
      300: '#42814A',
      400: '#42814A',
      500: '#42814A',
      600: '#42814A',
      700: '#42814A',
      800: '#42814A',
      900: '#42814A',
      950: '#42814A'
    },
    gold: {
      50: '#FAF9F8',
      100: '#FEF8E8',
      200: '#FEF0D8',
      300: '#FDE9C4',
      400: '#FCE2B0',
      500: '#FBDA9D',
      600: '#FBD389',
      700: '#FACC75',
      800: '#F9C462',
      900: '#F8BA47',
      950: '#FCBA19'
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
    red: {
      // Override base red theme, for base values see link at top
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
    linktext: '#1a5a96',
    linktexthover: '#0000ff',
    hover: '#4696EC',
    outlineonprimary: '#fff',
    outoffocus: '#ccc',
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
        },
        // content: {
        // background: '{bcblue.900}'
        // color: '{greyscale.50}'
        // },
        navigation: {
          item: {
            color: '{greyscale.50}'
          }
        }
      }
    }
  },
  components: {
    menubar: {
      colorScheme: {
        light: {
          root: {
            background: '{primary.900}',
            borderColor: '{primary.900}',
            borderRadius: 'none',
            padding: 'none'
          },
          item: {
            // padding: '.5rem .3rem .4rem'
          },
          submenu: {
            background: '{primary.900}'
          }
        }
      }
    }
  }
});
