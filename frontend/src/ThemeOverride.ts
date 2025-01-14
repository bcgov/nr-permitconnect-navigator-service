// Design tokens ref https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/material/base/index.js
import Material from '@primevue/themes/material';

import { definePreset } from '@primevue/themes';

//https://maketintsandshades.com/#003366

// Must use lower case for key values unless you want pain
// bcblue.500 is BC mandated blue

// Some values override base color values.
// Base values here: https://github.com/primefaces/primevue/blob/master/packages/themes/src/presets/material/base/index.js
export const ThemeOverride = definePreset(Material, {
  primitive: {
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
      // Override base green hues, for base values see link at top
      50: '#ffffff',
      75: '#FAF9F8',
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
      // Override base red hues, for base values see link at top
      50: '#F4E1E2',
      100: '#F4E1E2',
      200: '#F4E1E2',
      300: '#F4E1E2',
      400: '#CE3E39',
      500: '#CE3E39',
      600: '#CE3E39',
      700: '#CE3E39',
      800: '#A2312D',
      900: '#A2312D',
      950: '#A2312D'
    },
    disabledColor: '#EDEBE9',
    white: '#FFFFFF'
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
          0: '{white}',
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
          contrastColor: '{white}',
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
          floatLabelInvalidColor: '{red.500}',
          disabledBackground: '{disabledColor}',
          disabledColor: '{surface.800}',
          paddingX: '0.5rem',
          paddingY: '0.5rem',
          placeholderColor: '{surface.700}'
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
    accordion: {
      header: {
        padding: '1rem'
      }
    },
    button: {
      colorScheme: {
        light: {
          root: {
            secondary: {
              background: '{surface.0}',
              color: '{primary.color}'
            }
          }
        }
      }
    },
    card: {
      body: {
        padding: '1rem'
      }
    },
    datatable: {
      paginator: {
        bottom: {
          border: {
            width: '0'
          }
        }
      }
    },
    menu: {
      item: {
        color: '{primary.color}',
        icon: {
          color: '{primary.color}'
        }
      }
    },
    menubar: {
      root: {
        gap: '0'
      },
      baseItem: {
        borderRadius: 'none'
      },
      item: {
        focusBackground: '{primary.activeColor}',
        focusColor: '{surface.0}',
        activeBackground: '{primary.activeColor}',
        activeColor: '{surface.0}',
        borderRadius: 'none',
        padding: '0.45rem 0.45rem'
      },
      submenu: {
        padding: 'none'
      },
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
    message: {
      colorScheme: {
        light: {
          root: {
            error: {
              color: '#474543'
            },
            success: {
              background: '{green.100}'
            }
          }
        }
      }
    },
    radiobutton: {
      icon: {
        size: '10px',
        checkedColor: '{disabledColor}',
        checkedHoverColor: '{disabledColor}',
        disabledColor: '{form.field.disabled.color}'
      },
      css: () => '.p-radiobutton-checked .p-radiobutton-box { border-width: thick }'
    },
    progressspinner: {
      colorScheme: {
        light: {
          root: {
            'color.1': '{primary.color}',
            'color.2': '{primary.color}',
            'color.3': '{primary.color}',
            'color.4': '{primary.color}'
          }
        }
      }
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
          }
        }
      }
    }
  }
});
