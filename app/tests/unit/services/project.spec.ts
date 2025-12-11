import { prismaTxMock } from '../../__mocks__/prismaMock';

import { TEST_HOUSING_PROJECT_1, TEST_ELECTRIFICATION_PROJECT_1 } from '../data';
import * as projectService from '../../../src/services/project';
import { Problem } from '../../../src/utils';

describe('getProjectByActivityId', () => {
  const ACTIVITY_ID = 'ACTI1234';

  const expectedInclude = {
    activity: {
      include: {
        activityContact: {
          include: {
            contact: true
          }
        },
        initiative: true
      }
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns a housing project when only housing_result is found', async () => {
    prismaTxMock.housing_project.findFirst.mockResolvedValueOnce(
      TEST_HOUSING_PROJECT_1 as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    prismaTxMock.electrification_project.findFirst.mockResolvedValueOnce(null);

    const result = await projectService.getProjectByActivityId(prismaTxMock, ACTIVITY_ID);

    expect(prismaTxMock.housing_project.findFirst).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.findFirst).toHaveBeenCalledWith({
      where: { activityId: ACTIVITY_ID },
      include: expectedInclude
    });

    expect(prismaTxMock.electrification_project.findFirst).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.findFirst).toHaveBeenCalledWith({
      where: { activityId: ACTIVITY_ID },
      include: expectedInclude
    });

    expect(result).toStrictEqual(TEST_HOUSING_PROJECT_1);
  });

  it('returns an electrification project when only electrification_result is found', async () => {
    prismaTxMock.housing_project.findFirst.mockResolvedValueOnce(null);
    prismaTxMock.electrification_project.findFirst.mockResolvedValueOnce(
      TEST_ELECTRIFICATION_PROJECT_1 as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    const result = await projectService.getProjectByActivityId(prismaTxMock, ACTIVITY_ID);

    expect(prismaTxMock.housing_project.findFirst).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.housing_project.findFirst).toHaveBeenCalledWith({
      where: { activityId: ACTIVITY_ID },
      include: expectedInclude
    });

    expect(prismaTxMock.electrification_project.findFirst).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project.findFirst).toHaveBeenCalledWith({
      where: { activityId: ACTIVITY_ID },
      include: expectedInclude
    });

    expect(result).toStrictEqual(TEST_ELECTRIFICATION_PROJECT_1);
  });

  it('throws Problem(409) when both housing and electrification projects are found', async () => {
    prismaTxMock.housing_project.findFirst.mockResolvedValueOnce(
      TEST_HOUSING_PROJECT_1 as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    prismaTxMock.electrification_project.findFirst.mockResolvedValueOnce(
      TEST_ELECTRIFICATION_PROJECT_1 as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    await expect(projectService.getProjectByActivityId(prismaTxMock, ACTIVITY_ID)).rejects.toBeInstanceOf(Problem);
  });

  it('throws Problem(404) when no projects are found', async () => {
    prismaTxMock.housing_project.findFirst.mockResolvedValueOnce(null);
    prismaTxMock.electrification_project.findFirst.mockResolvedValueOnce(null);

    await expect(projectService.getProjectByActivityId(prismaTxMock, ACTIVITY_ID)).rejects.toBeInstanceOf(Problem);
  });
});
