import { roadmapService } from '@/services';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const PATH = 'roadmap';
// const getSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  // get: getSpy,
  put: putSpy
} as any);

const testAddressString = ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'];
const unformattedEmailList = 'test.1.address@test.bc.ca, testAddress2@test.com,; test3Email@test.ca';
const bccField = 'addressTest2@test.com';

const testData = {
  activityId: '123-123',
  emailData: {
    from: 'fromAddress@test.com',
    to: testAddressString,
    bcc: [bccField],
    subject: 'Here is your housing project Permit Roadmap',
    bodyType: 'text',
    body: 'testText'
  }
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('roadmapService test', () => {
  it('sends email when called with right params', async () => {
    await roadmapService.send(testData.activityId, ['testSelectedFileIds'], testData.emailData);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(PATH, {
      activityId: testData.activityId,
      selectedFileIds: ['testSelectedFileIds'],
      emailData: expect.objectContaining({
        to: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'],
        bcc: [bccField]
      })
    });
    expect(putSpy).not.toHaveBeenCalledWith(expect.objectContaining({ cc: expect.anything() }));
  });

  it('formats improper to/cc/bcc fields', async () => {
    const modifiedEmail = {
      ...testData.emailData,
      to: unformattedEmailList,
      cc: unformattedEmailList,
      bcc: unformattedEmailList
    };

    // @ts-expect-error: testing if email object it not proper type
    await roadmapService.send(testData.activityId, ['testSelectedFileIds'], modifiedEmail);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(
      PATH,
      expect.objectContaining({
        emailData: expect.objectContaining({
          to: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'],
          cc: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca'],
          bcc: ['test.1.address@test.bc.ca', 'testAddress2@test.com', 'test3Email@test.ca']
        })
      })
    );
  });
});
