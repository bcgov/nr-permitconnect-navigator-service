import { enquiryService } from '@/services';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testEnquiry = {
  enquiryId: 'aaaaaaaa-cccc-cccc-cccc-bbbbbbbbbbbb',
  activityId: '45A0A36A',
  assignedUserId: 'aaaaaaaa-cccc-cccc-cccc-bbbbbbbbbbbb',
  submittedAt: '2024-06-12T07:00:00.000Z',
  submittedBy: 'WILSWONG',
  isRelated: 'Yes',
  relatedActivityId: 'D95F1DE6',
  enquiryDescription: 'D95F1DE6 Test enquiry info',
  applyForPermitConnect: null,
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
      contactApplicantRelationship: 'Owner'
    }
  ]
};

const getSpy = vi.fn();
const deleteSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  delete: deleteSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('enquiryService', () => {
  it('calls deleteEnquiry with correct data', async () => {
    await enquiryService.deleteEnquiry(testEnquiry.enquiryId);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`);
  });

  it('calls getEnquiry with correct data', async () => {
    await enquiryService.getEnquiry(testEnquiry.enquiryId);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`);
  });

  it('calls createEnquiry with correct data', async () => {
    await enquiryService.createEnquiry(testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith('enquiry', testEnquiry);
  });

  it('calls updateEnquiry with correct data', async () => {
    await enquiryService.updateEnquiry(testEnquiry.enquiryId, testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`, testEnquiry);
  });
});
