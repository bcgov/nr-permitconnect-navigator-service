import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';

import EnquiryIntakeForm from '@/components/enquiry/EnquiryIntakeForm.vue';
import { contactService, enquiryService, housingProjectService } from '@/services';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey
} from '@/utils/keys';

import { testContactDefaults } from '../../../fixtures';
import { mockRouter, resetMockRouter } from '../../../mockRouter';
import { mountComponent } from '../../../mountComponent';

import type { Contact, HousingProject } from '@/types';
import type { FormSchemaType } from '@/validators/enquiryIntakeFormSchema';

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
  ...testContactDefaults,
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
const createEnquirySpy = vi.spyOn(enquiryService, 'createEnquiry');

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
  vi.clearAllMocks();
});

// Tests

describe('EnquiryIntakeForm', () => {
  describe('rendering', () => {
    describe('mandatory fields', () => {
      describe('enquiryDescription', () => {
        it('renders a TextAreaCard bound to basic.enquiryDescription', async () => {
          const { wrapper } = mountEnquiryIntakeForm();
          await flushPromises();

          const textAreaCard = wrapper.findComponent({ name: 'TextAreaCard' });
          expect(textAreaCard.props('fieldName')).toBe('basic.enquiryDescription');
        });

        it('sets required prop', async () => {
          const { wrapper } = mountEnquiryIntakeForm();
          await flushPromises();

          const textAreaCard = wrapper.findComponent({ name: 'TextAreaCard' });
          expect(textAreaCard.props('required')).toBe(true);
        });
      });
    });
  });

  describe('onSubmit', () => {
    // The create enquiry contact is strict, so a user-linked contact's userId must not be sent
    it('sends only the submitted contact fields', async () => {
      createEnquirySpy.mockResolvedValue({ enquiryId: 'enquiry123' } as Awaited<
        ReturnType<typeof enquiryService.createEnquiry>
      >);
      const { wrapper } = mountEnquiryIntakeForm();
      await flushPromises();

      const { userId, contactId, firstName, lastName, email, phoneNumber } = sampleContact;
      const { contactApplicantRelationship, contactPreference } = sampleContact;
      const contact = {
        contactId,
        firstName,
        lastName,
        email,
        phoneNumber,
        contactApplicantRelationship,
        contactPreference
      };
      const values = { basic: { enquiryDescription: 'Description' }, contacts: { ...contact, userId } };

      await (wrapper.vm as unknown as { onSubmit: (v: FormSchemaType) => Promise<void> }).onSubmit(
        values as FormSchemaType
      );

      expect(createEnquirySpy).toHaveBeenCalledWith(expect.objectContaining({ contact }));
      expect(createEnquirySpy.mock.calls[0]![0].contact).not.toHaveProperty('userId');
    });
  });
});
