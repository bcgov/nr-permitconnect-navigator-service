import { prismaTxMock } from '../../__mocks__/prismaMock';

import { TEST_CURRENT_CONTEXT, TEST_HOUSING_PROJECT_1 } from '../data';
import * as housingProjectService from '../../../src/services/housingProject';
import { generateDeleteStamps } from '../../../src/db/utils/utils';

beforeEach(() => {
  jest.resetAllMocks();
});

const FAKE_PROJECT = {
  ...TEST_HOUSING_PROJECT_1,
  projectId: '1'
};

describe('createHousingProject', () => {
  it('calls housing_project.create and returns result', async () => {
    prismaTxMock.housing_project.create.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await housingProjectService.createHousingProject(prismaTxMock, TEST_HOUSING_PROJECT_1);

    expect(prismaTxMock.housing_project.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.create).toHaveBeenCalledWith({
      data: TEST_HOUSING_PROJECT_1,
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

describe('deleteHousingProject', () => {
  it('calls housing_project.update', async () => {
    prismaTxMock.housing_project.update.mockResolvedValueOnce(FAKE_PROJECT);

    await housingProjectService.deleteHousingProject(prismaTxMock, '1', generateDeleteStamps(TEST_CURRENT_CONTEXT));

    expect(prismaTxMock.housing_project.delete).not.toHaveBeenCalled();
    expect(prismaTxMock.housing_project.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.update).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date), deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { housingProjectId: '1' }
    });
  });
});

describe('getHousingProjectStatistics', () => {
  it('calls $queryRaw and returns result', async () => {
    prismaTxMock.$queryRaw.mockResolvedValueOnce([FAKE_PROJECT]);

    const response = await housingProjectService.getHousingProjectStatistics(prismaTxMock, {
      dateFrom: '02/02/2025',
      dateTo: '04/04/2025',
      monthYear: '03/2025',
      userId: TEST_CURRENT_CONTEXT.userId!
    });

    expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([{ ...FAKE_PROJECT, submittedAt: expect.any(String) }]);
  });
});

describe('getHousingProject', () => {
  it('calls housing_project.findFirstOrThrow and returns result', async () => {
    prismaTxMock.housing_project.findFirstOrThrow.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await housingProjectService.getHousingProject(prismaTxMock, '1');

    expect(prismaTxMock.housing_project.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        housingProjectId: '1'
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

describe('getHousingProjects', () => {
  it('calls housing_project.findMany and returns result', async () => {
    prismaTxMock.housing_project.findMany.mockResolvedValueOnce([FAKE_PROJECT]);

    const response = await housingProjectService.getHousingProjects(prismaTxMock);

    expect(prismaTxMock.housing_project.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.findMany).toHaveBeenCalledWith({
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

describe('searchHousingProjects', () => {
  it('calls housing_project.findMany and returns result', async () => {
    prismaTxMock.housing_project.findMany.mockResolvedValueOnce([FAKE_PROJECT] as (typeof FAKE_PROJECT)[]);

    const response = await housingProjectService.searchHousingProjects(prismaTxMock, {});

    expect(prismaTxMock.housing_project.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activityId: { in: undefined }
          },
          {
            createdBy: { in: undefined }
          },
          {
            housingProjectId: { in: undefined }
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
    prismaTxMock.housing_project.findMany.mockResolvedValueOnce([FAKE_PROJECT] as (typeof FAKE_PROJECT)[]);

    const params = {
      activityId: ['123'],
      createdBy: ['456'],
      housingProjectId: ['789'],
      submissionType: ['TYPE'],
      includeUser: true
    };

    await housingProjectService.searchHousingProjects(prismaTxMock, params);

    expect(prismaTxMock.housing_project.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            housingProjectId: { in: params.housingProjectId }
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

describe('updateHousingProject', () => {
  it('calls housing_project.update with correct data and returns result', async () => {
    prismaTxMock.housing_project.update.mockResolvedValueOnce(FAKE_PROJECT);

    const response = await housingProjectService.updateHousingProject(prismaTxMock, FAKE_PROJECT);

    expect(prismaTxMock.housing_project.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.update).toHaveBeenCalledWith({
      data: FAKE_PROJECT,
      where: {
        housingProjectId: FAKE_PROJECT.housingProjectId
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
