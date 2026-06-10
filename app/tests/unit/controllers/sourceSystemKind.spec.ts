import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { getSourceSystemKindsController } from '../../../src/controllers/sourceSystemKind.ts';
import * as sourceSystemKindService from '../../../src/services/sourceSystemKind.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('getSourceSystemKindsController', () => {
  const getSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

  it('calls service and responds with 200 and result', async () => {
    const fakeResult = [{ sourceSystemKindId: 1, sourceSystem: 'PEACH', kind: 'BUILDING' }] as never;
    getSourceSystemKindsSpy.mockResolvedValueOnce(fakeResult);

    await getSourceSystemKindsController({} as Request, res as unknown as Response);

    expect(getSourceSystemKindsSpy).toHaveBeenCalledTimes(1);
    expect(getSourceSystemKindsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });
});
