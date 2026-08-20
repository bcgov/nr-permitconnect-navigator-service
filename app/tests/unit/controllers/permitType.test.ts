import { TEST_CURRENT_CONTEXT, TEST_PERMIT_TYPE_1 } from '#tests/unit/data/index';
import { listPermitTypesController } from '#src/controllers/permitType';
import * as permitTypeService from '#src/services/permitType';
import { Initiative } from '#src/utils/enums/application';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

vi.mock('config');

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  vi.clearAllMocks();
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
});

describe('listPermitTypesController', () => {
  const listSpy = vi.spyOn(permitTypeService, 'listPermitTypesService');

  it('calls the service with optional initiative then responds 200', async () => {
    const req = {
      query: { initiative: Initiative.HOUSING }
    } as unknown as Request<never, never, never, { initiative?: Initiative }>;

    listSpy.mockResolvedValue([TEST_PERMIT_TYPE_1]);

    await listPermitTypesController(req, res as unknown as Response);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_PERMIT_TYPE_1]);
  });
});
