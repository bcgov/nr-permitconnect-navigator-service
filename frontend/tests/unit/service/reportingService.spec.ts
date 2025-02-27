import { appAxios } from '@/services/interceptors';

import { reportingService } from '@/services';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const PATH = 'reporting';

const getSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSubmissionPermitData', () => {
  it('calls correct endpoint', () => {
    reportingService.getSubmissionPermitData();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/submission/permit`);
  });
});
