import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { enquiryService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { AxiosInstance } from 'axios';
import type { Enquiry } from '@/types';
import {
  ApplicationStatus,
  ContactPreference,
  EnquirySubmittedMethod,
  ProjectRelationship,
  SubmissionType
} from '@/utils/enums/projectCommon';
import type { EnquiryArgs } from '@/types/Enquiry';

// Constants
const PATH = 'enquiry';

const TEST_ACTIVITY_ID = '25357C4A';

const currentDate = new Date().toISOString();

const testCreateEnquiry: EnquiryArgs = {
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
  atsEnquiryId: '654321',
  contact: {
    contactId: '123',
    firstName: 'enquiryDraft1',
    lastName: 'enquiryDraft1',
    phoneNumber: '(123) 456-7890',
    email: 'test@test.weg',
    contactPreference: ContactPreference.EITHER,
    contactApplicantRelationship: ProjectRelationship.OWNER
  }
};

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
  atsEnquiryId: '654321'
};

// Mocks
const getSpy = vi.fn();
const deleteSpy = vi.fn();
const patchSpy = vi.fn();
const postSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  delete: deleteSpy,
  patch: patchSpy,
  post: postSpy,
  put: putSpy
} as unknown as AxiosInstance);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('enquiryService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });

      it('calls deleteEnquiry with correct data', () => {
        enquiryService.deleteEnquiry(testEnquiry.enquiryId);

        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${testEnquiry.enquiryId}`);
      });

      it('calls getEnquiries', () => {
        enquiryService.getEnquiries();

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`);
      });

      it('calls getEnquiry with correct data', () => {
        enquiryService.getEnquiry(testEnquiry.enquiryId);

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${testEnquiry.enquiryId}`);
      });

      it('calls listRelatedEnquiries with correct data', () => {
        enquiryService.listRelatedEnquiries(TEST_ACTIVITY_ID);

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/list/${TEST_ACTIVITY_ID}`);
      });

      it('calls createEnquiry with correct data', () => {
        enquiryService.createEnquiry(testCreateEnquiry);

        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, testCreateEnquiry);
      });

      it('calls searchEnquiries with correct data', () => {
        enquiryService.searchEnquiries({ activityId: [TEST_ACTIVITY_ID] });

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/search`, {
          params: { activityId: [TEST_ACTIVITY_ID] }
        });
      });

      it('calls updateEnquiry with correct data', () => {
        enquiryService.updateEnquiry(testEnquiry.enquiryId, testEnquiry);

        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(
          `${initiative.toLowerCase()}/${PATH}/${testEnquiry.enquiryId}`,
          testEnquiry
        );
      });
    }
  );
});
