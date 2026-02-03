import { default as i18n } from '@/i18n';

import type { AxiosRequestHeaders, AxiosResponse } from 'axios';

// Globals
export const { t } = i18n.global;

/*
 * Function to easily create any required axios response necessary for the given type
 */
export function mockAxiosResponse<T>(data: T, status = 200, statusText = 'OK'): AxiosResponse<T> {
  return {
    data: data,
    status,
    statusText,
    headers: {},
    config: {
      headers: {} as AxiosRequestHeaders
    }
  };
}

/*
 * Force PrimeVue stubs to render children
 */
export const PRIMEVUE_STUBS = {
  Button: {
    name: 'Button',
    inheritAttrs: false,
    template: `
          <button
            v-bind="$attrs"
          >
            <slot />
          </button>
        `
  },
  Tabs: { template: '<div><slot /></div>' },
  TabList: { template: '<div><slot /></div>' },
  Tab: { template: '<div><slot /></div>' },
  TabPanels: { template: '<div><slot /></div>' },
  TabPanel: { template: '<div><slot /></div>' }
};
