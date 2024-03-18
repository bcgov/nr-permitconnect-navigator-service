import { submissionService } from '@/services';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const PATH = 'submission/';
const getSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('submissionService test', () => {
  it('gets submissions', async () => {
    await submissionService.getSubmissions();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(PATH);
  });

  it('gets statistics', async () => {
    const testFilter = {
      dateFrom: '02/02/2022',
      dateTo: '03/03/2022',
      monthYear: '04/2022',
      userId: 'testUserId'
    };
    await submissionService.getStatistics(testFilter);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}statistics`, { params: testFilter });
  });

  it('gets a single submission', async () => {
    const testActivityId = 'testActivityId';
    await submissionService.getSubmission(testActivityId);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}${testActivityId}`);
  });

  it('updates a submission', async () => {
    const testActivityId = 'testActivityId';
    const testObj = {
      field1: 'testField1',
      date1: new Date().toISOString(),
      field2: 'testField2'
    };
    await submissionService.updateSubmission(testActivityId, testObj);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`${PATH}${testActivityId}`, testObj);
  });
});
