import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';

import EnquiryIntakeForm from '@/components/enquiry/EnquiryIntakeForm.vue';
import { contactService, housingProjectService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';
import type { Contact } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {}
  }),
  onBeforeRouteUpdate: vi.fn(),
  onBeforeRouteLeave: vi.fn()
}));
const sampleContact: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.CONSULTANT,
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

const getActivityIds = vi.spyOn(housingProjectService, 'getActivityIds');
const getProjects = vi.spyOn(housingProjectService, 'getProjects');
const getContactSpy = vi.spyOn(contactService, 'searchContacts');

getActivityIds.mockResolvedValue({ data: ['someActivityid'] } as AxiosResponse);
getProjects.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getContactSpy.mockResolvedValue({ data: [sampleContact] } as AxiosResponse);

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
      ConfirmationService,
      ToastService
    ],
    stubs: {
      RouterLink: RouterLinkStub,
      'font-awesome-icon': true
    },
    directives: {
      Tooltip: Tooltip
    }
  }
});

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('EnquiryIntakeForm', () => {
  describe('component', async () => {
    it('renders component', async () => {
      const wrapper = mount(EnquiryIntakeForm, wrapperSettings());
      await flushPromises();

      expect(wrapper.isVisible()).toBeTruthy();
    });

    it('renders initial form fields', async () => {
      const wrapper = mount(EnquiryIntakeForm, wrapperSettings());
      await flushPromises();

      const firstNameInput = wrapper.get('[name="contacts.firstName"]');
      const lastNameInput = wrapper.get('[name="contacts.lastName"]');
      const phoneInput = wrapper.get('[name="contacts.phoneNumber"]');
      const emailInput = wrapper.get('[name="contacts.email"]');

      expect(firstNameInput.isVisible()).toBeTruthy();
      expect(lastNameInput.isVisible()).toBeTruthy();
      expect(phoneInput.isVisible()).toBeTruthy();
      expect(emailInput.isVisible()).toBeTruthy();

      const descriptionInput = wrapper.find('[name="basic.enquiryDescription"]');
      expect(descriptionInput.exists()).toBe(true);
    });
  });
});
