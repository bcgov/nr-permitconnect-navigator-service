import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { generateCreateStamps } from '../../../src/db/utils/utils.ts';
import * as draftService from '../../../src/services/draft.ts';
import { DraftCode } from '../../../src/utils/enums/projectCommon.ts';

import type { JsonValue } from '@prisma/client/runtime/library';
import type { Draft } from '../../../src/types/index.ts';

beforeEach(() => {
  jest.resetAllMocks();
});

const DRAFT = {
  draftId: '1',
  activityId: 'ACT',
  draftCode: DraftCode.HOUSING_PROJECT,
  data: {
    key: 'value'
  } as JsonValue,
  ...generateCreateStamps(TEST_CURRENT_CONTEXT)
} as Draft;

describe('createDraft', () => {
  it('calls draft.create and returns result', async () => {
    prismaTxMock.draft.create.mockResolvedValueOnce(DRAFT);

    const response = await draftService.createDraft(prismaTxMock, DRAFT);

    expect(prismaTxMock.draft.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.draft.create).toHaveBeenCalledWith({ data: DRAFT });
    expect(response).toStrictEqual(DRAFT);
  });
});

describe('deleteDraft', () => {
  it('calls draft.delete', async () => {
    prismaTxMock.draft.delete.mockResolvedValueOnce({ draftId: '1' } as Draft);

    await draftService.deleteDraft(prismaTxMock, '1');

    expect(prismaTxMock.draft.delete).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.draft.delete).toHaveBeenCalledWith({ where: { draftId: '1' } });
  });
});

describe('getDraft', () => {
  it('calls draft.findFirstOrThrow and returns result', async () => {
    prismaTxMock.draft.findFirstOrThrow.mockResolvedValueOnce({ draftId: '1' } as Draft);

    const response = await draftService.getDraft(prismaTxMock, '1');

    expect(prismaTxMock.draft.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.draft.findFirstOrThrow).toHaveBeenCalledWith({
      where: { draftId: '1' },
      include: { activity: { include: { activityContact: true } } }
    });
    expect(response).toStrictEqual({ draftId: '1' });
  });
});

describe('getDrafts', () => {
  it('calls draft.findMany and returns result', async () => {
    prismaTxMock.draft.findMany.mockResolvedValueOnce([{ draftId: '1' }] as Draft[]);

    const response = await draftService.getDrafts(prismaTxMock, DraftCode.HOUSING_PROJECT);

    expect(prismaTxMock.draft.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.draft.findMany).toHaveBeenCalledWith({
      where: { draftCode: DraftCode.HOUSING_PROJECT },
      include: { activity: { include: { activityContact: true } } }
    });
    expect(response).toStrictEqual([{ draftId: '1' }]);
  });
});

describe('updateDraft', () => {
  it('calls draft.update with correct data and returns result', async () => {
    prismaTxMock.draft.update.mockResolvedValueOnce(DRAFT);

    const response = await draftService.updateDraft(prismaTxMock, DRAFT);

    expect(prismaTxMock.draft.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.draft.update).toHaveBeenCalledWith({
      data: DRAFT,
      where: { draftId: DRAFT.draftId }
    });
    expect(response).toStrictEqual(DRAFT);
  });
});
