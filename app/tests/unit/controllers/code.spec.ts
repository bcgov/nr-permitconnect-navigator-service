import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { listAllCodeTablesController } from '../../../src/controllers/code.ts';
import * as codeService from '../../../src/services/code.ts';

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

describe('listAllCodeTablesController', () => {
  const listAllCodeTablesSpy = vi.spyOn(codeService, 'listAllCodeTables');

  it('calls service and responds with 200 and result', async () => {
    const fakeResult = { foo: [{ code: 'X', display: 'X', definition: 'X' }] } as never;
    listAllCodeTablesSpy.mockResolvedValueOnce(fakeResult);

    await listAllCodeTablesController({} as Request, res as unknown as Response);

    expect(listAllCodeTablesSpy).toHaveBeenCalledTimes(1);
    expect(listAllCodeTablesSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });
});
