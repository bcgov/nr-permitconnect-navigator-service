import { TEST_ACTIVITY_HOUSING } from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import * as activityDomain from '#src/domains/activity';
import { deleteActivityService } from '#src/services/activity';

vi.mock('config');

const deleteActivitySpy = vi.spyOn(activityDomain, 'deleteActivity');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deleteActivityService', () => {
  it('calls deleteActivity domain with correct repos and activityId', async () => {
    deleteActivitySpy.mockResolvedValue(undefined);

    await deleteActivityService(TEST_ACTIVITY_HOUSING.activityId);

    expect(deleteActivitySpy).toHaveBeenCalledTimes(1);
    expect(deleteActivitySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        activity: mockRepos.activity,
        activityContact: mockRepos.activityContact,
        document: mockRepos.document,
        electrificationProject: mockRepos.electrificationProject,
        enquiry: mockRepos.enquiry,
        generalProject: mockRepos.generalProject,
        housingProject: mockRepos.housingProject,
        note: mockRepos.note,
        noteHistory: mockRepos.noteHistory,
        permit: mockRepos.permit,
        permitNote: mockRepos.permitNote,
        permitTracking: mockRepos.permitTracking
      }),
      TEST_ACTIVITY_HOUSING.activityId
    );
  });
});
