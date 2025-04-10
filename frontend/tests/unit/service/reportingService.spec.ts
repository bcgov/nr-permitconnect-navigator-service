import { reportingService } from '@/services';
import { appAxios } from '@/services/interceptors';

// Constants
const PATH = 'reporting';

// Mocks
const getSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy
} as any);

// Tests
beforeEach(() => {
  vi.clearAllMocks();
});

describe('getElectrificationProjectPermitData', () => {
  it('calls correct endpoint', () => {
    reportingService.getElectrificationProjectPermitData();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/electrificationProject/permit`);
  });
});

describe('getHousingProjectPermitData', () => {
  it('calls correct endpoint', () => {
    reportingService.getHousingProjectPermitData();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/housingProject/permit`);
  });
});
