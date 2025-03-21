import { permitService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { Initiative } from '@/utils/enums/application';

import type { Permit, PermitType } from '@/types';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testPermitType: PermitType = {
  permitTypeId: 1,
  agency: 'Water, Land and Resource Stewardship',
  division: 'Forest Resiliency and Archaeology',
  branch: 'Archaeology',
  businessDomain: 'Archaeology',
  type: 'Alteration',
  family: undefined,
  name: 'Archaeology Alteration Permit',
  nameSubtype: undefined,
  acronym: 'SAP',
  trackedInATS: false,
  sourceSystem: 'Archaeology Permit Tracking System',
  sourceSystemAcronym: 'APTS'
};

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
  adjudicationDate: new Date().toISOString(),
  permitType: testPermitType
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
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(PATH, testPermit1);
  });

  it('calls delete permit', async () => {
    await permitService.deletePermit(TEST_ID);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${TEST_ID}`);
  });

  it('calls delete permit with wrong ID', async () => {
    await permitService.deletePermit('wrongId');
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).not.toHaveBeenCalledWith(`${PATH}/${TEST_ID}`);
  });

  it('calls get permit type list', async () => {
    await permitService.getPermitTypes(Initiative.HOUSING);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}/types`, { params: { initiative: Initiative.HOUSING } });
  });

  it('calls get permit list', async () => {
    await permitService.listPermits({ activityId: TEST_ID });
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}`, { params: { activityId: TEST_ID } });
  });

  it('calls get permit list with wrong ID', async () => {
    await permitService.listPermits({ activityId: 'wrongId' });
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).not.toHaveBeenCalledWith(`${PATH}/list/${TEST_ID}`);
  });

  it('calls put permit', async () => {
    await permitService.updatePermit(testPermit1);
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledWith(`${PATH}/${testPermit1.permitId}`, testPermit1);
  });

  it('calls put permit with wrong object type', async () => {
    const modifiedPermit = { ...testPermit1 } as any;
    delete modifiedPermit.permitTypeId;

    await permitService.updatePermit(modifiedPermit);
    expect(updatePermitSpy).toHaveBeenCalledTimes(1);
    expect(updatePermitSpy).toThrow();
  });

  it('calls get permit', async () => {
    await permitService.listPermits({ activityId: TEST_ID });
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(`${PATH}`, { params: { activityId: TEST_ID } });
  });

  it('calls get permit with wrong ID', async () => {
    await permitService.listPermits({ activityId: 'wrongId' });
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).not.toHaveBeenCalledWith(`${PATH}/list/${TEST_ID}`);
  });
});
