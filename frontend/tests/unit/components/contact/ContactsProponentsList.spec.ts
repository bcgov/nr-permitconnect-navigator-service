import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';
import { contactService } from '@/services';
import { contactInitiativeRouteNameKey } from '@/utils/keys';

import type { AxiosResponse, AxiosRequestHeaders } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ replace: vi.fn() }))
}));

vi.spyOn(contactService, 'getContact').mockResolvedValue({
  data: { activityContact: [] },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as AxiosRequestHeaders
  }
});

vi.spyOn(contactService, 'deleteContact').mockResolvedValue({ status: 204 } as AxiosResponse);

const testContacts = [
  {
    contactId: 'contact123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890'
  }
];

const wrapperSettings = (loading = false, contacts = testContacts) => ({
  props: {
    loading,
    contacts
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: { user: {} }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    provide: {
      [contactInitiativeRouteNameKey]: 'ContactView'
    },
    stubs: ['Button', 'DataTable', 'Column', 'FilterMatchMode', 'InputIcon', 'InputText', 'router-link']
  }
});

describe('ContactsProponentsList.vue', () => {
  it('renders the component with provided props', () => {
    const wrapper = mount(ContactsProponentsList, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
