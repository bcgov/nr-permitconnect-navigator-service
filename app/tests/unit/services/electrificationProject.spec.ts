import { prismaTxMock } from '../../__mocks__/prismaMock';

import { TEST_CURRENT_CONTEXT, TEST_ELECTRIFICATION_PROJECT_1 } from '../data';
import * as electrificationProjectService from '../../../src/services/electrificationProject';
import { generateDeleteStamps } from '../../../src/db/utils/utils';

beforeEach(() => {
  jest.resetAllMocks();
});

const FAKE_PROJECT = {
  ...TEST_ELECTRIFICATION_PROJECT_1,
  projectId: '1'
};

describe('createElectrificationProject', () => {
  it('calls electrification_project.create and returns result', async () => {
    prismaTxMock.electrification_project.create.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await electrificationProjectService.createElectrificationProject(
      prismaTxMock,
      TEST_ELECTRIFICATION_PROJECT_1
    );

    expect(prismaTxMock.electrification_project.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.create).toHaveBeenCalledWith({
      data: TEST_ELECTRIFICATION_PROJECT_1,
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

describe('deleteElectrificationProject', () => {
  it('calls electrification_project.update', async () => {
    prismaTxMock.electrification_project.update.mockResolvedValueOnce(FAKE_PROJECT);

    await electrificationProjectService.deleteElectrificationProject(
      prismaTxMock,
      '1',
      generateDeleteStamps(TEST_CURRENT_CONTEXT)
    );

    expect(prismaTxMock.electrification_project.delete).not.toHaveBeenCalled();
    expect(prismaTxMock.electrification_project.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.update).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date), deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { electrificationProjectId: '1' }
    });
  });
});

describe('getElectrificationProjectStatistics', () => {
  it('calls $queryRaw and returns result', async () => {
    prismaTxMock.$queryRaw.mockResolvedValueOnce([FAKE_PROJECT]);

    const response = await electrificationProjectService.getElectrificationProjectStatistics(prismaTxMock, {
      dateFrom: '02/02/2025',
      dateTo: '04/04/2025',
      monthYear: '03/2025',
      userId: TEST_CURRENT_CONTEXT.userId!
    });

    expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([{ ...FAKE_PROJECT, submittedAt: expect.any(String) }]);
  });
});

describe('getElectrificationProject', () => {
  it('calls electrification_project.findFirstOrThrow and returns result', async () => {
    prismaTxMock.electrification_project.findFirstOrThrow.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await electrificationProjectService.getElectrificationProject(prismaTxMock, '1');

    expect(prismaTxMock.electrification_project.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        electrificationProjectId: '1'
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

describe('getElectrificationProjects', () => {
  it('calls electrification_project.findMany and returns result', async () => {
    prismaTxMock.electrification_project.findMany.mockResolvedValueOnce([FAKE_PROJECT]);

    const response = await electrificationProjectService.getElectrificationProjects(prismaTxMock);

    expect(prismaTxMock.electrification_project.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.findMany).toHaveBeenCalledWith({
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

describe('searchElectrificationProjects', () => {
  it('calls electrification_project.findMany and returns result', async () => {
    prismaTxMock.electrification_project.findMany.mockResolvedValueOnce([FAKE_PROJECT] as (typeof FAKE_PROJECT)[]);

    const response = await electrificationProjectService.searchElectrificationProjects(prismaTxMock, {});

    expect(prismaTxMock.electrification_project.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activityId: { in: undefined }
          },
          {
            createdBy: { in: undefined }
          },
          {
            electrificationProjectId: { in: undefined }
          },
          {
            projectType: { in: undefined }
          },
          {
            projectCategory: { in: undefined }
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
    prismaTxMock.electrification_project.findMany.mockResolvedValueOnce([FAKE_PROJECT] as (typeof FAKE_PROJECT)[]);

    const params = {
      activityId: ['123'],
      createdBy: ['456'],
      electrificationProjectId: ['789'],
      projectType: ['TYPE'],
      projectCategory: ['CAT'],
      includeUser: true
    };

    await electrificationProjectService.searchElectrificationProjects(prismaTxMock, params);

    expect(prismaTxMock.electrification_project.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            electrificationProjectId: { in: params.electrificationProjectId }
          },
          {
            projectType: { in: params.projectType }
          },
          {
            projectCategory: { in: params.projectCategory }
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

describe('updateElectrificationProject', () => {
  it('calls electrification_project.update with correct data and returns result', async () => {
    prismaTxMock.electrification_project.update.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await electrificationProjectService.updateElectrificationProject(prismaTxMock, FAKE_PROJECT);

    expect(prismaTxMock.electrification_project.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.update).toHaveBeenCalledWith({
      data: FAKE_PROJECT,
      where: {
        electrificationProjectId: FAKE_PROJECT.electrificationProjectId
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
