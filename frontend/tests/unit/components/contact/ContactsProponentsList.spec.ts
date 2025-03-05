import PrimeVue from 'primevue/config';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ replace: vi.fn() }))
}));

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
      PrimeVue
    ],
    stubs: ['Spinner', 'DataTable', 'Column', 'InputIcon', 'InputText', 'router-link']
  }
});

describe('ContactsProponentsList.vue', () => {
  it('renders the component with provided props', () => {
    const wrapper = mount(ContactsProponentsList, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
