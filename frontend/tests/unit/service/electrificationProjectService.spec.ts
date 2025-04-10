import { createPinia, setActivePinia, type StoreGeneric } from 'pinia';

import { electrificationProjectService } from '@/services';
import { appAxios } from '@/services/interceptors';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

// Constants
const PATH = 'project';

const testID = 'foobar';
const testObj = {
  field1: 'testField1',
  date1: new Date().toISOString(),
  field2: 'testField2'
};

const testDraft = {
  draftId: 'draft123',
  activityId: 'activity456',
  draftCode: 'code789',
  data: { key: 'value' },
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

const testEmail = {
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
  put: putSpy
} as any);

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
      electrificationProjectService.createProject();

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`, undefined);
    });

    it('passes parameters', () => {
      electrificationProjectService.createProject({ foo: 'bar' });

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`, { foo: 'bar' });
    });
  });

  describe('deleteProject', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.deleteProject(testID);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${testID}`);
    });
  });

  describe('deleteDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.deleteDraft(testID);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${testID}`);
    });
  });

  describe('getDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.getDraft(testID);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/${testID}`);
    });
  });

  describe('getDrafts', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.getDrafts();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`);
    });
  });

  describe('getProjects', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.getProjects();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}`);
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
      electrificationProjectService.getProject(testActivityId);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${testActivityId}`);
    });
  });

  describe('searchProjects', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.searchProjects({ activityId: [testID] });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/search`, {
        params: { activityId: [testID] }
      });
    });

    it('calls endpoint with includeDeleted=false if specified', () => {
      electrificationProjectService.searchProjects({ activityId: [testID], includeDeleted: false });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/search`, {
        params: {
          activityId: [testID],
          includeDeleted: false
        }
      });
    });

    it('calls endpoint with includeDeleted=true if specified', () => {
      electrificationProjectService.searchProjects({ includeDeleted: true });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/search`, {
        params: {
          includeDeleted: true
        }
      });
    });
  });

  describe('submitDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.submitDraft(testObj);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft/submit`, testObj);
    });
  });

  describe('updateDraft', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.updateDraft(testDraft);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/draft`, testDraft);
    });
  });

  describe('updateIsDeletedFlag', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.updateIsDeletedFlag(testID, true);

      expect(patchSpy).toHaveBeenCalledTimes(1);
      expect(patchSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${testID}/delete`, {
        isDeleted: true
      });
    });
  });

  describe('updateProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      const testObj = {
        field1: 'testField1',
        date1: new Date().toISOString(),
        field2: 'testField2'
      };
      electrificationProjectService.updateProject(testActivityId, testObj);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(
        `${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/${testActivityId}`,
        testObj
      );
    });
  });

  describe('emailConfirmation', () => {
    it('calls correct endpoint', () => {
      electrificationProjectService.emailConfirmation(testEmail);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${Initiative.ELECTRIFICATION.toLowerCase()}/${PATH}/email`, testEmail);
    });
  });
});
