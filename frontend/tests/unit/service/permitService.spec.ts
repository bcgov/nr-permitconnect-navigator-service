import { permitService } from '@/services';
import { appAxios } from '@/services/interceptors';

import type { Permit } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testPermit1: Permit = {
  permitId: 'permitId',
  permitTypeId: 0,
  activityId: 'activityId',
  issuedPermitId: 'issuedPermitId',
  trackingId: 'trackingId',
  authStatus: 'authStatus',
  needed: 'needed',
  status: 'status',
  submittedDate: new Date().toISOString(),
  adjudicationDate: new Date().toISOString()
};

const PATH = 'permit';
const TEST_ID = 'testID';

const getSpy = vi.fn();
const putSpy = vi.fn();
const deleteSpy = vi.fn();

const updatePermitSpy = vi.spyOn(permitService, 'updatePermit');

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  put: putSpy,
  delete: deleteSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('permitService test', () => {
  it('calls creates a permit', async () => {
    await permitService.createPermit(testPermit1);
    expect(putSpy).toHaveBeenCalledWith(PATH, testPermit1);
  });

  it('calls delete permit', async () => {
    await permitService.deletePermit(TEST_ID);
    expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${TEST_ID}`);
  });

  it('calls delete permit with wrong ID', async () => {
    await permitService.deletePermit('wrongId');
    expect(deleteSpy).not.toHaveBeenCalledWith(`${PATH}/${TEST_ID}`);
  });

  it('calls get permit type list', async () => {
    await permitService.getPermitTypes();
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/types`);
  });

  it('calls get permit list', async () => {
    await permitService.listPermits(TEST_ID);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/list/${TEST_ID}`);
  });

  it('calls get permit list with wrong ID', async () => {
    await permitService.listPermits('wrongId');
    expect(getSpy).not.toHaveBeenCalledWith(`${PATH}/list/${TEST_ID}`);
  });

  it('calls put permit', async () => {
    await permitService.updatePermit(testPermit1);
    expect(putSpy).toHaveBeenCalledWith(`${PATH}/${testPermit1.permitId}`, testPermit1);
  });

  it('calls put permit with wrong object type', async () => {
    const modifiedPermit = { ...testPermit1 } as any;
    delete modifiedPermit.permitTypeId;

    await permitService.updatePermit(modifiedPermit);
    expect(updatePermitSpy).toThrow();
  });
});
