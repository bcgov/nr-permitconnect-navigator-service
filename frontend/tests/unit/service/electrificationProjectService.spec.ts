import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { electrificationProjectService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { AxiosInstance } from 'axios';
import type {
  Draft,
  ElectrificationProjectIntake,
  GetProjectStatisticsRequest,
  PatchElectrificationProjectRequest,
  UpsertDraftRequest
} from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectIntakeFormSchema';

// Constants
const PATH = 'project';

const TEST_ID = 'foobar';
const TEST_OBJ = {
  field1: 'testField1',
  date1: new Date().toISOString(),
  field2: 'testField2'
};

const TEST_DRAFT: Partial<Draft<FormSchemaType>> = {
  draftId: 'draft123',
  activityId: 'activity456',
  draftCode: 'code789',
  data: {} as FormSchemaType,
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

// Mocks
const getSpy = vi.fn();
const deleteSpy = vi.fn();
const patchSpy = vi.fn();
const postSpy = vi.fn();
const putSpy = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  patch: patchSpy,
  post: postSpy,
  put: putSpy
} as unknown as AxiosInstance);

// Tests
beforeEach(() => {
  setActivePinia(createPinia());

  vi.clearAllMocks();
});

describe('electrificationProjectService', () => {
  let appStore: StoreGeneric;

  beforeEach(() => {
    appStore = useAppStore();
    appStore.setInitiative(Initiative.ELECTRIFICATION);
  });

  describe('getActivityIds', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.getActivityIds();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/activityIds`);
    });
  });

  describe('createProject', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.createProject({});

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`, undefined);
    });

    it('passes parameters', () => {
      electrificationProjectService.createProject({ projectName: 'foo' });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`, {
        projectName: 'foo'
      });
    });
  });

  describe('deleteDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.deleteDraft({ draftId: TEST_ID });

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${TEST_ID}`);
    });
  });

  describe('deleteProject', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.deleteProject({ projectId: TEST_ID });

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${TEST_ID}`);
    });
  });

  describe('getDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.getDraft({ draftId: TEST_ID });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${TEST_ID}`);
    });
  });

  describe('getDrafts', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.getDrafts();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`);
    });
  });

  describe('listProjects', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.listProjects();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`);
    });
  });

  describe('getStatistics', () => {
    it('calls correct endpoint', () => {
      const testFilter: GetProjectStatisticsRequest = {
        dateFrom: new Date(2022, 1, 2), // 02/02/2022
        dateTo: new Date(2022, 2, 3), // 03/03/2022
        monthYear: new Date(2022, 3, 1), // 04/2022 -> 1 Apr 2022
        userId: 'testUserId'
      };
      electrificationProjectService.getStatistics(testFilter);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/statistics`, {
        params: testFilter
      });
    });
  });

  describe('getProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      electrificationProjectService.getProject({ projectId: testActivityId });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${testActivityId}`);
    });
  });

  describe('searchProjects', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.searchProjects({ activityId: [TEST_ID] });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/search`, {
        activityId: [TEST_ID]
      });
    });
  });

  describe('submitDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.submitDraft(TEST_OBJ as unknown as ElectrificationProjectIntake);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/submit`, TEST_OBJ);
    });
  });

  describe('updateDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.upsertDraft(TEST_DRAFT as unknown as UpsertDraftRequest);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`, TEST_DRAFT);
    });
  });

  describe('patchProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      electrificationProjectService.patchProject(TEST_OBJ as unknown as PatchElectrificationProjectRequest);

      expect(patchSpy).toHaveBeenCalledTimes(1);
      expect(patchSpy).toHaveBeenCalledWith(
        `${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${testActivityId}`,
        TEST_OBJ
      );
    });
  });
});
