import { enquiryService } from '@/services';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const isDeleted = true;

const testActivityId = '25357C4A';

const testEnquiry = {
  enquiryId: 'aaaaaaaa-cccc-cccc-cccc-bbbbbbbbbbbb',
  activityId: '45A0A36A',
  assignedUserId: 'aaaaaaaa-cccc-cccc-cccc-bbbbbbbbbbbb',
  submittedAt: '2024-06-12T07:00:00.000Z',
  submittedBy: 'WILSWONG',
  relatedActivityId: 'D95F1DE6',
  enquiryDescription: 'D95F1DE6 Test enquiry info',
  intakeStatus: 'Submitted',
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

const getSpy = vi.fn();
const deleteSpy = vi.fn();
const patchSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  delete: deleteSpy,
  patch: patchSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('enquiryService', () => {
  it('calls deleteEnquiry with correct data', () => {
    enquiryService.deleteEnquiry(testEnquiry.enquiryId);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`);
  });

  it('calls getEnquiries', () => {
    enquiryService.getEnquiries();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('enquiry');
  });

  it('calls getEnquiry with correct data', () => {
    enquiryService.getEnquiry(testEnquiry.enquiryId);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`);
  });

  it('calls listRelatedEnquiries with correct data', () => {
    enquiryService.listRelatedEnquiries(testActivityId);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`enquiry/list/${testActivityId}`);
  });

  it('calls createEnquiry with correct data', () => {
    enquiryService.createEnquiry(testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith('enquiry', testEnquiry);
  });

  it('calls searchEnquiries with correct data', () => {
    enquiryService.searchEnquiries({ activityId: [testActivityId] });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('enquiry/search', { params: { activityId: [testActivityId] } });
  });

  it('calls updateIsDeletedFlag with correct data', () => {
    enquiryService.updateIsDeletedFlag(testEnquiry.enquiryId, isDeleted);

    expect(patchSpy).toHaveBeenCalledTimes(1);
    expect(patchSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}/delete`, { isDeleted: isDeleted });
  });

  it('calls updateEnquiry with correct data', () => {
    enquiryService.updateEnquiry(testEnquiry.enquiryId, testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`, testEnquiry);
  });
});
