import { prismaTxMock } from '../../__mocks__/prismaMock.ts';

import { generateCreateStamps, generateDeleteStamps } from '../../../src/db/utils/utils.ts';
import * as activityService from '../../../src/services/activity.ts';
import { Initiative as InitiativeE } from '../../../src/utils/enums/application.ts';

import type { Activity, Initiative } from '../../../src/types/index.ts';

const ACTIVITY = {
  activityId: 'ABCD1234'
} as Activity;

describe('createActivity', () => {
  it('calls activity.create and returns result', async () => {
    prismaTxMock.activity.create.mockResolvedValueOnce(ACTIVITY);
    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce({ initiativeId: '1' } as Initiative);
    const response = await activityService.createActivity(
      prismaTxMock,
      InitiativeE.HOUSING,
      generateCreateStamps(undefined)
    );

    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.activity.create).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(ACTIVITY);
  });
});

describe('deleteActivity', () => {
  it('calls activity.update', async () => {
    prismaTxMock.activity.update.mockResolvedValueOnce(ACTIVITY);
    await activityService.deleteActivity(prismaTxMock, 'ABCD1234', generateDeleteStamps(undefined));

    expect(prismaTxMock.activity.update).toHaveBeenCalledTimes(1);
  });
});

describe('deleteActivityHard', () => {
  it('calls activity.delete', async () => {
    prismaTxMock.activity.delete.mockResolvedValueOnce(ACTIVITY);
    await activityService.deleteActivityHard(prismaTxMock, 'ABCD1234');

    expect(prismaTxMock.activity.delete).toHaveBeenCalledTimes(1);
  });
});

describe('getActivity', () => {
  it('calls activity.findFirstOrThrow and returns result', async () => {
    prismaTxMock.activity.findFirstOrThrow.mockResolvedValueOnce(ACTIVITY);
    const response = await activityService.getActivity(prismaTxMock, 'ABCD1234');

    expect(prismaTxMock.activity.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(ACTIVITY);
  });
});

describe('getActivities', () => {
  it('calls activity.findMany with parameter and returns result', async () => {
    prismaTxMock.activity.findMany.mockResolvedValueOnce([ACTIVITY]);
    const response = await activityService.getActivities(prismaTxMock, InitiativeE.HOUSING);

    expect(prismaTxMock.activity.findMany).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([ACTIVITY]);
  });

  it('calls activity.findMany without parameter and returns result', async () => {
    prismaTxMock.activity.findMany.mockResolvedValueOnce([ACTIVITY]);
    const response = await activityService.getActivities(prismaTxMock);

    expect(prismaTxMock.activity.findMany).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([ACTIVITY]);
  });
});
