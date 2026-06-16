import { TEST_CURRENT_CONTEXT, TEST_PERMIT_TYPE_LIST } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { listPermitTypesController } from '../../../src/controllers/permitType.ts';
import * as permitTypeService from '../../../src/services/permitType.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock; end?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();

beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('getPermitTypesController', () => {
  const permitTypesSpy = vi.spyOn(permitTypeService, 'listPermitTypes');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      query: { initiative: Initiative.HOUSING }
    };

    permitTypesSpy.mockResolvedValue(TEST_PERMIT_TYPE_LIST);

    await listPermitTypesController(
      req as unknown as Request<never, never, never, { initiative: Initiative }>,
      res as unknown as Response
    );

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_TYPE_LIST);
  });
});
