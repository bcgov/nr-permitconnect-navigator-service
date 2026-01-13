import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { enquiryService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

// Constants
const PATH = 'enquiry';

const TEST_ACTIVITY_ID = '25357C4A';

const testEnquiry = {
  enquiryId: 'aaaaaaaa-cccc-cccc-cccc-bbbbbbbbbbbb',
  activityId: '45A0A36A',
  assignedUserId: 'aaaaaaaa-cccc-cccc-cccc-bbbbbbbbbbbb',
  submittedAt: '2024-06-12T07:00:00.000Z',
  submittedBy: 'WILSWONG',
  relatedActivityId: 'D95F1DE6',
  enquiryDescription: 'D95F1DE6 Test enquiry info',
  updatedAt: '2024-06-13T00:00:00.000Z',
  submissionType: 'General enquiry',
  contacts: [
    {
      firstName: 'enquiryDraft1',
      lastName: 'enquiryDraft1',
      phoneNumber: '(123) 456-7890',
      email: 'test@test.weg',
      contactPreference: 'Phone call',
      contactApplicantRelationship: 'Property owner'
    }
  ]
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
} as any);

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
        enquiryService.createEnquiry(testEnquiry);

        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, testEnquiry);
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
