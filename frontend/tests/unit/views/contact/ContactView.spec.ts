import type { AxiosResponse } from 'axios';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import { contactService } from '@/services';
import ContactProfileView from '@/views/contact/ContactView.vue';

import type { Contact } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const testContact: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: 'email',
  contactApplicantRelationship: 'applicant'
};

const useContactService = vi.spyOn(contactService, 'searchContacts');
useContactService.mockResolvedValue({ data: [testContact] } as AxiosResponse);

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
            auth: {
              user: {}
            }
          }
        }),
      PrimeVue,
      ToastService
    ],
    stubs: ['font-awesome-icon']
  }
});

describe('ContactProfileView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(ContactProfileView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
