import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ContactPageView from '@/views/internal/contact/ContactPageView.vue';
import { contactService, housingProjectService, enquiryService, userService } from '@/services';

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

const testContact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: 'email',
  contactApplicantRelationship: 'applicant',
  activityContact: []
};

vi.spyOn(contactService, 'getContact').mockResolvedValue({
  data: testContact,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as AxiosRequestHeaders
  }
});
vi.spyOn(housingProjectService, 'searchProjects').mockResolvedValue({
  data: [],
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as AxiosRequestHeaders
  }
});
vi.spyOn(enquiryService, 'searchEnquiries').mockResolvedValue({
  data: [],
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as AxiosRequestHeaders
  }
});
vi.spyOn(userService, 'searchUsers').mockResolvedValue({
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

const wrapperSettings = () => ({
  props: {
    contactId: 'contact123'
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
      ToastService
    ],
    stubs: ['InputText', 'Tabs', 'Tab', 'TabList', 'TabPanel', 'TabPanels', 'ContactHistoryList']
  }
});

describe('ContactPageView.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ContactPageView, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
