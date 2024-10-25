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
      // Override base green theme, for base values see link at top
      50: '#ffffff',
      100: '#d9e6db',
      200: '#b3cdb7',
      300: '#8eb392',
      400: '#689a6e',
      500: '#42814A',
      600: '#42814A',
      700: '#35673b',
      800: '#284d2c',
      900: '#1a341e',
      950: '#0d1a0f'
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
      50: '#FFCDD2',
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
    white: {
      50: '#EDEBE9',
      100: '#EDEBE9',
      200: '#EDEBE9',
      300: '#EDEBE9',
      400: '#EDEBE9',
      500: '#EDEBE9',
      600: '#EDEBE9',
      700: '#EDEBE9',
      800: '#EDEBE9',
      900: '#EDEBE9',
      950: '#EDEBE9'
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
    disabledOpacity: '0.6',
    content: {
      fontSize: '2rem'
    },
    formField: {
      focusRing: {
        color: '{primary.400}',
        width: '2px'
      }
    },
    errorColor: '{red.500}',
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
        content: {
          hover: {
            background: '{greyscale.200}'
          }
        },
        formField: {
          hoverBorderColor: '{primary.700}',
          focusBorderColor: '{primary.300}',
          invalidBorderColor: '{red.500}',
          floatLabelInvalidColor: '{red.500}'
        },
        highlight: {
          background: '{surface.0}'
        },
        navigation: {
          item: {
            color: '{greyscale.50}'
          }
        }
      }
    }
  },
  components: {
    button: {
      root: {
        sm: {
          fontSize: '0.875rem',
          paddingX: '0.875rem',
          paddingY: '0.5rem'
        },
        lg: {
          fontSize: '1.125rem',
          paddingX: '1.125rem',
          paddingY: '0.7rem'
        }
      },
      colorScheme: {
        light: {}
      }
    },
    menubar: {
      colorScheme: {
        light: {
          root: {
            background: '{primary.900}',
            borderColor: '{primary.900}',
            borderRadius: 'none',
            padding: 'none'
          },
          submenu: {
            background: '{primary.900}'
          }
        }
      }
    },
    radiobutton: {
      root: {},
      icon: {
        size: '10px',
        checkedColor: '{white.50}',
        checkedHoverColor: '{white.50}',
        disabledColor: '{form.field.disabled.color}'
      },
      css: () => '.p-radiobutton-checked .p-radiobutton-box { border-width: thick}'
    },
    tabs: {
      tab: {
        color: '{primary.color}'
      },
      tabPanel: {
        padding: '1.2rem 1.2rem 1.2rem 1.2rem'
      }
    },
    toast: {
      colorScheme: {
        light: {
          success: {
            background: '{green.100}',
            borderColor: '{green.500}',
            color: '{green.500}',
            detailColor: '{surface.300}',
            closeButton: {
              hoverBackground: '{green.200}',
              focusRing: {
                color: '{green.600}',
                shadow: 'none'
              }
            }
          },
          warn: {},
          error: {},
          secondary: {},
          contrast: {}
        }
      }
    }
  }
});
