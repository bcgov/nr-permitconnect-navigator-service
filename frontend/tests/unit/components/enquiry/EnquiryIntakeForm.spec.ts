import { flushPromises } from '@vue/test-utils';

import EnquiryIntakeForm from '@/components/enquiry/EnquiryIntakeForm.vue';
import { contactService, housingProjectService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { Contact, HousingProject } from '@/types';
import { mountComponent } from '../../../mountComponent';
import { mockRouter, resetMockRouter } from '../../../mockRouter';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey
} from '@/utils/keys';
import { ref } from 'vue';

// Mocks

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key // returns the key as the translation
  }),
  createI18n: vi.fn(() => ({
    global: {
      t: (key: string) => key
    },
    install: vi.fn()
  }))
}));

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({
    params: {},
    query: {}
  }),
  onBeforeRouteUpdate: vi.fn(),
  onBeforeRouteLeave: vi.fn()
}));

// Fixtures

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

// Mount

const listActivityIds = vi.spyOn(housingProjectService, 'listActivityIds');
const listProjects = vi.spyOn(housingProjectService, 'listProjects');
const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');

listActivityIds.mockResolvedValue(['someActivityid']);
listProjects.mockResolvedValue([{ activityId: 'someActivityid' }] as HousingProject[]);
searchContactsSpy.mockResolvedValue([sampleContact]);

function mountEnquiryIntakeForm() {
  const { wrapper } = mountComponent(EnquiryIntakeForm, {
    piniaState: { auth: { user: {} } },
    provide: {
      [enquiryConfirmRouteNameKey]: ref('route-name'),
      [enquiryPermitConfirmRouteNameKey]: ref('route-name'),
      [enquiryProjectConfirmRouteNameKey]: ref('route-name'),
      [enquiryRouteNameKey]: ref('route-name')
    },
    stubs: {
      CollectionDisclaimer: true,
      FormNavigationGuard: true,
      ContactCardIntakeForm: true,
      TextAreaCard: true,
      'i18n-t': true
    }
  });

  return { wrapper };
}

beforeEach(() => {
  resetMockRouter();
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

// Tests

describe('EnquiryIntakeForm', () => {
  describe('component', async () => {
    it('renders component', async () => {
      const { wrapper } = mountEnquiryIntakeForm();
      await flushPromises();

      expect(wrapper.isVisible()).toBeTruthy();
    });

    it('renders TextAreaCard with required prop', async () => {
      const { wrapper } = mountEnquiryIntakeForm();
      await flushPromises();

      const textAreaCard = wrapper.findComponent({ name: 'TextAreaCard' });
      expect(textAreaCard.exists()).toBe(true);
      expect(textAreaCard.props('required')).toBe(true);
    });
  });
});
