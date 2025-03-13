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

describe('getHousingProjectPermitData', () => {
  it('calls correct endpoint', () => {
    reportingService.getHousingProjectPermitData();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/housingProject/permit`);
  });
});
