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
  contactFirstName: 'enquiryDraft1',
  contactLastName: 'enquiryDraft1',
  contactPhoneNumber: '(123) 456-7890',
  contactEmail: 'test@test.weg',
  contactPreference: 'Phone call',
  contactApplicantRelationship: 'Owner',
  isRelated: 'Yes',
  relatedActivityId: 'D95F1DE6',
  enquiryDescription: 'D95F1DE6 Test enquiry info',
  applyForPermitConnect: null,
  intakeStatus: 'Submitted',
  updatedAt: '2024-06-13T00:00:00.000Z',
  submissionType: 'General enquiry'
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
  it('calls createDraft with correct data', async () => {
    await enquiryService.createDraft(testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith('enquiry/draft', testEnquiry);
  });

  it('calls deleteEnquiry with correct data', async () => {
    await enquiryService.deleteEnquiry(testEnquiry.enquiryId, true);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith('enquiry', {
      params: { enquiryId: testEnquiry.enquiryId, hardDelete: true }
    });
  });

  it('calls getEnquiries w/ undefined param', async () => {
    await enquiryService.getEnquiries();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('enquiry', { params: { self: undefined } });
  });

  it('calls getEnquiries w/ correct param', async () => {
    const testBoolean = true;
    await enquiryService.getEnquiries(testBoolean);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('enquiry', { params: { self: testBoolean } });

    await enquiryService.getEnquiries(!testBoolean);

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(getSpy).toHaveBeenCalledWith('enquiry', { params: { self: !testBoolean } });
  });

  it('calls getEnquiry with correct data', async () => {
    await enquiryService.getEnquiry(testEnquiry.enquiryId);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`);
  });

  it('calls updateDraft with correct data', async () => {
    await enquiryService.updateDraft(testEnquiry.enquiryId, testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`enquiry/draft/${testEnquiry.enquiryId}`, testEnquiry);
  });

  it('calls updateEnquiry with correct data', async () => {
    await enquiryService.updateEnquiry(testEnquiry.enquiryId, testEnquiry);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`enquiry/${testEnquiry.enquiryId}`, testEnquiry);
  });
});
