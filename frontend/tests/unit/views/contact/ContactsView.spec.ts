import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ContactsView from '@/views/contact/ContactsView.vue';
import { contactService } from '@/services';

import type { AxiosRequestHeaders } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({
    replace: vi.fn()
  })
}));

// Stub the service call for searching contacts
vi.spyOn(contactService, 'searchContacts').mockResolvedValue({
  data: [],
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as AxiosRequestHeaders
  }
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = () => ({
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: { user: {} }
          }
        }),
      PrimeVue,
      ToastService
    ],
    stubs: ['ContactsProponentsList', 'Tabs', 'Tab', 'TabList', 'TabPanel', 'TabPanels']
  }
});

describe('ContactsView.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ContactsView, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
