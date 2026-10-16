import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import EnquiryListNavigator from '@/components/enquiry/EnquiryListNavigator.vue';
import { enquiryService } from '@/services';
import {
  ApplicationStatus,
  ContactPreference,
  EnquirySubmittedMethod,
  ProjectRelationship,
  SubmissionType
} from '@/utils/enums/projectCommon';

import type { Enquiry } from '@/types';
import { enquiryRouteNameKey } from '@/utils/keys';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));
const mockConfirmRequire = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useConfirm: () => ({ require: mockConfirmRequire }),
  useToast: () => ({ error: mockToastError, success: vi.fn() })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

const deleteEnquirySpy = vi.spyOn(enquiryService, 'deleteEnquiry');
deleteEnquirySpy.mockResolvedValue(undefined);
const createEnquirySpy = vi.spyOn(enquiryService, 'createEnquiry');
const currentDate = new Date().toISOString();

// Example Enquiry object
const testEnquiry: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  submissionType: SubmissionType.GUIDANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  enquiryStatus: ApplicationStatus.NEW,
  submittedMethod: EnquirySubmittedMethod.EMAIL,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  addedToAts: false,
  atsClientId: 123456,
  atsEnquiryId: 654321
};

const testEnquiries = [testEnquiry];

const staffContact = {
  contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b',
  firstName: 'Staff',
  lastName: 'Member',
  email: 'staff@example.com',
  phoneNumber: '2505551234',
  contactApplicantRelationship: ProjectRelationship.OTHER,
  contactPreference: ContactPreference.EMAIL
};
const wrapperSettings = (testEnquiriesProp = testEnquiries, loading = false, contact: object = staffContact) => ({
  props: {
    enquiries: testEnquiriesProp,
    loading: loading
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            },
            contact: { contact }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    provide: {
      [enquiryRouteNameKey as symbol]: ref('route-name')
    },
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('EnquiryListNavigator.vue', () => {
  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryListNavigator, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  describe('creating a new enquiry', () => {
    async function createNew(contact: object) {
      createEnquirySpy.mockResolvedValue({} as never);
      const wrapper = mount(EnquiryListNavigator, wrapperSettings(testEnquiries, false, contact));

      (wrapper.vm as unknown as { handleCreateNewActivity: () => void }).handleCreateNewActivity();
      await mockConfirmRequire.mock.calls[0][0].accept();
    }

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('creates the enquiry with the staff contact', async () => {
      await createNew(staffContact);

      expect(createEnquirySpy).toHaveBeenCalledWith({ contact: staffContact });
      expect(mockToastError).not.toHaveBeenCalled();
    });

    // The API requires these, but a stored contact can lack them
    it.each(['phoneNumber', 'contactApplicantRelationship', 'contactPreference'])(
      'explains instead of calling the API when the contact has no %s',
      async (field) => {
        await createNew({ ...staffContact, [field]: null });

        expect(createEnquirySpy).not.toHaveBeenCalled();
        expect(mockToastError).toHaveBeenCalled();
      }
    );
  });
});
