import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ContactPage from '@/components/contact/ContactPage.vue';
import { contactService, housingProjectService, enquiryService, userService } from '@/services';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import { contactRouteNameKey, projectServiceKey } from '@/utils/keys';
import { ref } from 'vue';

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
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.OWNER,
  activityContact: []
};

vi.spyOn(contactService, 'getContact').mockResolvedValue(testContact);
vi.spyOn(housingProjectService, 'searchProjects').mockResolvedValue([]);
vi.spyOn(enquiryService, 'searchEnquiries').mockResolvedValue([]);
vi.spyOn(userService, 'listUsers').mockResolvedValue([]);

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
          initialState: {}
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    provide: {
      [contactRouteNameKey as symbol]: ref('route-name'),
      [projectServiceKey as symbol]: ref({ foo: vi.fn() })
    },
    stubs: [
      'Button',
      'Card',
      'font-awesome-icon',
      'Tabs',
      'Tab',
      'TabList',
      'TabPanel',
      'TabPanels',
      'ContactHistoryList'
    ]
  }
});

describe('ContactPage.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ContactPage, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
