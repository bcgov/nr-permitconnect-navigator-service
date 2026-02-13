import { TEST_CURRENT_CONTEXT, TEST_GENERAL_PROJECT_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as generalProjectService from '../../../src/services/generalProject.ts';
import { generateDeleteStamps } from '../../../src/db/utils/utils.ts';

beforeEach(() => {
  jest.resetAllMocks();
});

const FAKE_PROJECT = {
  ...TEST_GENERAL_PROJECT_1,
  projectId: '1'
};

describe('createGeneralProject', () => {
  it('calls general_project.create and returns result', async () => {
    prismaTxMock.general_project.create.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await generalProjectService.createGeneralProject(prismaTxMock, TEST_GENERAL_PROJECT_1);

    expect(prismaTxMock.general_project.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.general_project.create).toHaveBeenCalledWith({
      data: TEST_GENERAL_PROJECT_1,
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual(FAKE_PROJECT);
  });
});

describe('deleteGeneralProject', () => {
  it('calls general_project.update', async () => {
    prismaTxMock.general_project.update.mockResolvedValueOnce(FAKE_PROJECT);

    await generalProjectService.deleteGeneralProject(prismaTxMock, '1', generateDeleteStamps(TEST_CURRENT_CONTEXT));

    expect(prismaTxMock.general_project.delete).not.toHaveBeenCalled();
    expect(prismaTxMock.general_project.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.general_project.update).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date) as Date, deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { generalProjectId: '1' }
    });
  });
});

describe('getGeneralProjectStatistics', () => {
  it('calls $queryRaw and returns result', async () => {
    prismaTxMock.$queryRaw.mockResolvedValueOnce([FAKE_PROJECT]);

    const response = await generalProjectService.getGeneralProjectStatistics(prismaTxMock, {
      dateFrom: '02/02/2025',
      dateTo: '04/04/2025',
      monthYear: '03/2025',
      userId: TEST_CURRENT_CONTEXT.userId!
    });

    expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([{ ...FAKE_PROJECT, submittedAt: expect.any(String) as string }]);
  });
});

describe('getGeneralProject', () => {
  it('calls general_project.findFirstOrThrow and returns result', async () => {
    prismaTxMock.general_project.findFirstOrThrow.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await generalProjectService.getGeneralProject(prismaTxMock, '1');

    expect(prismaTxMock.general_project.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.general_project.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        generalProjectId: '1'
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual(FAKE_PROJECT);
  });
});

describe('getGeneralProjects', () => {
  it('calls general_project.findMany and returns result', async () => {
    prismaTxMock.general_project.findMany.mockResolvedValueOnce([FAKE_PROJECT]);

    const response = await generalProjectService.getGeneralProjects(prismaTxMock);

    expect(prismaTxMock.general_project.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.general_project.findMany).toHaveBeenCalledWith({
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    expect(response).toStrictEqual([FAKE_PROJECT]);
  });
});

describe('searchGeneralProjects', () => {
  it('calls general_project.findMany and returns result', async () => {
    prismaTxMock.general_project.findMany.mockResolvedValueOnce([FAKE_PROJECT] as (typeof FAKE_PROJECT)[]);

    const response = await generalProjectService.searchGeneralProjects(prismaTxMock, {});

    expect(prismaTxMock.general_project.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.general_project.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activityId: { in: undefined }
          },
          {
            createdBy: { in: undefined }
          },
          {
            generalProjectId: { in: undefined }
          },
          {
            submissionType: { in: undefined }
          }
        ]
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual([FAKE_PROJECT]);
  });

  it('passes parameters', async () => {
    prismaTxMock.general_project.findMany.mockResolvedValueOnce([FAKE_PROJECT] as (typeof FAKE_PROJECT)[]);

    const params = {
      activityId: ['123'],
      createdBy: ['456'],
      generalProjectId: ['789'],
      submissionType: ['TYPE'],
      includeUser: true
    };

    await generalProjectService.searchGeneralProjects(prismaTxMock, params);

    expect(prismaTxMock.general_project.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            generalProjectId: { in: params.generalProjectId }
          },
          {
            submissionType: { in: params.submissionType }
          }
        ]
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        },
        user: params.includeUser
      }
    });
  });
});

describe('updateGeneralProject', () => {
  it('calls general_project.update with correct data and returns result', async () => {
    prismaTxMock.general_project.update.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await generalProjectService.updateGeneralProject(prismaTxMock, FAKE_PROJECT);

    expect(prismaTxMock.general_project.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.general_project.update).toHaveBeenCalledWith({
      data: FAKE_PROJECT,
      where: {
        generalProjectId: FAKE_PROJECT.generalProjectId
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual(FAKE_PROJECT);
  });
});
