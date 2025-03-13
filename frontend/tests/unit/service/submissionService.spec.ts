import { housingProjectService } from '@/services';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

const PATH = 'housingProject';
const getSpy = vi.fn();
const deleteSpy = vi.fn();
const patchSpy = vi.fn();
const putSpy = vi.fn();

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

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  delete: deleteSpy,
  get: getSpy,
  patch: patchSpy,
  put: putSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('housingProjectService', () => {
  describe('getActivityIds', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getActivityIds();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/activityIds`);
    });
  });

  describe('createHousingProject', () => {
    it('calls correct endpoint', () => {
      housingProjectService.createHousingProject();

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(PATH, undefined);
    });

    it('passes parameters', () => {
      housingProjectService.createHousingProject({ foo: 'bar' });

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(PATH, { foo: 'bar' });
    });
  });

  describe('deleteHousingProject', () => {
    it('calls correct endpoint', () => {
      housingProjectService.deleteHousingProject(testID);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/${testID}`);
    });
  });

  describe('deleteDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.deleteDraft(testID);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(`${PATH}/draft/${testID}`);
    });
  });

  describe('getDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getDraft(testID);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/draft/${testID}`);
    });
  });

  describe('getDrafts', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getDrafts();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/draft`);
    });
  });

  describe('getHousingProjects', () => {
    it('calls correct endpoint', () => {
      housingProjectService.getHousingProjects();

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(PATH);
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
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/statistics`, { params: testFilter });
    });
  });

  describe('getHousingProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      housingProjectService.getHousingProject(testActivityId);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/${testActivityId}`);
    });
  });

  describe('searchHousingProjects', () => {
    it('calls correct endpoint', () => {
      housingProjectService.searchHousingProjects({ activityId: [testID] });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/search`, { params: { activityId: [testID] } });
    });

    it('calls endpoint with includeDeleted=false if specified', () => {
      housingProjectService.searchHousingProjects({ activityId: [testID], includeDeleted: false });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/search`, {
        params: {
          activityId: [testID],
          includeDeleted: false
        }
      });
    });

    it('calls endpoint with includeDeleted=true if specified', () => {
      housingProjectService.searchHousingProjects({ includeDeleted: true });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`${PATH}/search`, {
        params: {
          includeDeleted: true
        }
      });
    });
  });

  describe('submitDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.submitDraft(testObj);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${PATH}/draft/submit`, testObj);
    });
  });

  describe('updateDraft', () => {
    it('calls correct endpoint', () => {
      housingProjectService.updateDraft(testDraft);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${PATH}/draft`, testDraft);
    });
  });

  describe('updateIsDeletedFlag', () => {
    it('calls correct endpoint', () => {
      housingProjectService.updateIsDeletedFlag(testID, true);

      expect(patchSpy).toHaveBeenCalledTimes(1);
      expect(patchSpy).toHaveBeenCalledWith(`${PATH}/${testID}/delete`, { isDeleted: true });
    });
  });

  describe('updateHousingProject', () => {
    it('calls correct endpoint', () => {
      const testActivityId = 'testActivityId';
      const testObj = {
        field1: 'testField1',
        date1: new Date().toISOString(),
        field2: 'testField2'
      };
      housingProjectService.updateHousingProject(testActivityId, testObj);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${PATH}/${testActivityId}`, testObj);
    });
  });

  describe('emailConfirmation', () => {
    it('calls correct endpoint', () => {
      housingProjectService.emailConfirmation(testEmail);

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith(`${PATH}/email`, testEmail);
    });
  });
});
