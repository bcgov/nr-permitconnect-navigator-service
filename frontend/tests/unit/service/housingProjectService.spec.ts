import { createPinia, setActivePinia } from 'pinia';
import { housingProjectService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

import type { StoreGeneric } from 'pinia';
import type { AxiosInstance } from 'axios';

// Constants
const PATH = 'project';

const TEST_ID = 'foobar';

const TEST_OBJ = {
  field1: 'testField1',
  date1: new Date().toISOString(),
  field2: 'testField2'
};

const TEST_DRAFT = {
  draftId: 'draft123',
  activityId: 'activity456',
  draftCode: 'code789',
  data: { key: 'value' },
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

const TEST_EMAIL = {
  bodyType: 'text/plain',
  body: 'This is a test email body.',
  from: 'sender@example.com',
  subject: 'Test Email Subject',
  to: ['recipient1@example.com', 'recipient2@example.com'],
  cc: ['cc1@example.com'],
  bcc: ['bcc1@example.com'],
  encoding: 'UTF-8',
  priority: 'high',
  tag: 'test'
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

describe('housingProjectService', () => {
  let appStore: StoreGeneric;

  beforeEach(() => {
    appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);
  });

  describe('getActivityIds', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getActivityIds();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/activityIds`);
    });
  });

  describe('createProject', () => {
    it('calls correct endpoint', () => {
      housingProjectService.createProject();

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}`, undefined);
    });

    it('passes parameters', () => {
      housingProjectService.createProject({ foo: 'bar' });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}`, { foo: 'bar' });
    });
  });

  describe('deleteDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.deleteDraft(TEST_ID);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/draft/${TEST_ID}`);
    });
  });

  describe('deleteProject', () => {
    it('calls correct endpoint', () => {
      housingProjectService.deleteProject(TEST_ID);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/${TEST_ID}`);
    });
  });

  describe('getDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getDraft(TEST_ID);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/draft/${TEST_ID}`);
    });
  });

  describe('getDrafts', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getDrafts();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/draft`);
    });
  });

  describe('getProjects', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getProjects();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}`);
    });
  });

  describe('getStatistics', () => {
    it('calls correct endpoint', () => {
      const testFilter = {
        dateFrom: '02/02/2022',
        dateTo: '03/03/2022',
        monthYear: '04/2022',
        userId: 'testUserId'
      };
      housingProjectService.getStatistics(testFilter);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/statistics`, {
        params: testFilter
      });
    });
  });

  describe('getProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      housingProjectService.getProject(testActivityId);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/${testActivityId}`);
    });
  });

  describe('searchProjects', () => {
    it('calls correct endpoint', () => {
      housingProjectService.searchProjects({ activityId: [TEST_ID] });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/search`, {
        params: { activityId: [TEST_ID] }
      });
    });

    it('calls endpoint with includeDeleted=false if specified', () => {
      housingProjectService.searchProjects({ activityId: [TEST_ID] });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/search`, {
        params: {
          activityId: [TEST_ID]
        }
      });
    });

    it('calls endpoint with includeDeleted=true if specified', () => {
      housingProjectService.searchProjects({});

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/search`, {
        params: {}
      });
    });
  });

  describe('submitDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.submitDraft(TEST_OBJ);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/draft/submit`, TEST_OBJ);
    });
  });

  describe('updateDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.updateDraft(TEST_DRAFT);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/draft`, TEST_DRAFT);
    });
  });

  describe('updateProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      const TEST_OBJ = {
        field1: 'testField1',
        date1: new Date().toISOString(),
        field2: 'testField2'
      };
      housingProjectService.updateProject(testActivityId, TEST_OBJ);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/${testActivityId}`, TEST_OBJ);
    });
  });

  describe('emailConfirmation', () => {
    it('calls correct endpoint', () => {
      housingProjectService.emailConfirmation(TEST_EMAIL);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.HOUSING.toLowerCase()}/${PATH}/email`, TEST_EMAIL);
    });
  });
});
