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

import type { Contact, HousingProject } from '@/types';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey
} from '@/utils/keys';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key // returns the key as the translation
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

const listActivityIds = vi.spyOn(housingProjectService, 'listActivityIds');
const listProjects = vi.spyOn(housingProjectService, 'listProjects');
const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');

listActivityIds.mockResolvedValue(['someActivityid']);
listProjects.mockResolvedValue([{ activityId: 'someActivityid' }] as HousingProject[]);
searchContactsSpy.mockResolvedValue([sampleContact]);

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
    provide: {
      [enquiryConfirmRouteNameKey as symbol]: ref('route-name'),
      [enquiryPermitConfirmRouteNameKey as symbol]: ref('route-name'),
      [enquiryProjectConfirmRouteNameKey as symbol]: ref('route-name'),
      [enquiryRouteNameKey as symbol]: ref('route-name')
    },
    stubs: {
      RouterLink: RouterLinkStub,
      'font-awesome-icon': true,
      CollectionDisclaimer: true,
      FormNavigationGuard: true,
      ContactCardIntakeForm: true,
      TextAreaCard: true,
      'i18n-t': true
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

    it('renders TextAreaCard with required prop', async () => {
      const settings = wrapperSettings();

      const wrapper = mount(EnquiryIntakeForm, settings);
      await flushPromises();

      const textAreaCard = wrapper.findComponent({ name: 'TextAreaCard' });
      expect(textAreaCard.exists()).toBe(true);
      expect(textAreaCard.props('required')).toBe(true);
    });
  });
});
