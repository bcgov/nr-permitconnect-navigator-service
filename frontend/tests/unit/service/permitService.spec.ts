import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { permitService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { PermitStage, PermitState } from '@/utils/enums/permit';

import type { AxiosInstance } from 'axios';
import type { Permit, PermitType } from '@/types';

// Constants
const PATH = 'permit';
const TEST_ID = 'testID';

const TEST_PERMIT_TYPE: PermitType = {
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

const TEST_PERMIT_1: Permit = {
  permitId: 'permitId',
  activityId: 'activityId',
  issuedPermitId: 'issuedPermitId',
  state: PermitState.IN_PROGRESS,
  needed: 'needed',
  stage: PermitStage.APPLICATION_SUBMISSION,
  submittedDate: new Date().toISOString(),
  decisionDate: new Date().toISOString(),
  permitType: TEST_PERMIT_TYPE,
  permitTypeId: TEST_PERMIT_TYPE.permitTypeId,
  permitNote: [],
  permitTracking: []
};

// Mocks
const getSpy = vi.fn();
const putSpy = vi.fn();
const deleteSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  put: putSpy,
  delete: deleteSpy
} as unknown as AxiosInstance);

// Spies
const upsertPermitSpy = vi.spyOn(permitService, 'upsertPermit');

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('permitService', () => {
  let appStore: StoreGeneric;

  describe.each([{ initiative: Initiative.ELECTRIFICATION }, { initiative: Initiative.HOUSING }])(
    '$initiative',
    ({ initiative }) => {
      beforeEach(() => {
        appStore = useAppStore();
        appStore.setInitiative(initiative);
      });
      afterEach(() => {
        upsertPermitSpy.mockReset();
      });

      it('calls creates a permit', async () => {
        await permitService.upsertPermit(TEST_PERMIT_1);
        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, TEST_PERMIT_1);
      });

      it('calls delete permit', async () => {
        await permitService.deletePermit(TEST_ID);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${TEST_ID}`);
      });

      it('calls delete permit with wrong ID', async () => {
        await permitService.deletePermit('wrongId');
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).not.toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/${TEST_ID}`);
      });

      it('calls get permit type list', async () => {
        await permitService.getPermitTypes(Initiative.HOUSING);
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/types`, {
          params: { initiative: Initiative.HOUSING }
        });
      });

      it('calls get permit list', async () => {
        await permitService.listPermits({ activityId: TEST_ID });
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, { params: { activityId: TEST_ID } });
      });

      it('calls get permit list with wrong ID', async () => {
        await permitService.listPermits({ activityId: 'wrongId' });
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).not.toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/list/${TEST_ID}`);
      });

      it('calls put permit', async () => {
        await permitService.upsertPermit(TEST_PERMIT_1);
        expect(putSpy).toHaveBeenCalledTimes(1);
        expect(putSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, TEST_PERMIT_1);
      });

      it('calls put permit with wrong object type', async () => {
        upsertPermitSpy.mockRejectedValue(new Error('Invalid permit object'));
        const modifiedPermit: { permitTypeId?: string } = { permitTypeId: '123' };
        delete modifiedPermit.permitTypeId;

        await expect(permitService.upsertPermit(modifiedPermit as unknown as Permit)).rejects.toThrow();
        expect(upsertPermitSpy).toHaveBeenCalledTimes(1);
      });

      it('calls get permit', async () => {
        await permitService.listPermits({ activityId: TEST_ID });
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}`, { params: { activityId: TEST_ID } });
      });

      it('calls get permit with wrong ID', async () => {
        await permitService.listPermits({ activityId: 'wrongId' });
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).not.toHaveBeenCalledWith(`${initiative.toLowerCase()}/${PATH}/list/${TEST_ID}`);
      });
    }
  );
});
