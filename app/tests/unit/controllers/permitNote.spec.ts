import { createPermitNoteController } from '../../../src/controllers/permitNote';
import * as permitNoteService from '../../../src/services/permitNote';
import { uuidv4Pattern } from '../../../src/utils/regexp';

import type { Request, Response } from 'express';
import { TEST_CURRENT_CONTEXT, TEST_PERMIT_NOTE_1 } from '../data';
import { PermitNote } from '../../../src/types';
import { prismaTxMock } from '../../__mocks__/prismaMock';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('createPermitNoteController', () => {
  const createPermitNoteSpy = jest.spyOn(permitNoteService, 'createPermitNote');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        permitId: 'a752026b-2899-4603-b56b-aa3c9b53ed20',
        note: 'This is a permit note',
        isDeleted: false
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createPermitNoteSpy.mockResolvedValue(TEST_PERMIT_NOTE_1);

    await createPermitNoteController(req as unknown as Request<never, never, PermitNote>, res as unknown as Response);

    expect(createPermitNoteSpy).toHaveBeenCalledTimes(1);
    expect(createPermitNoteSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body,
      permitNoteId: expect.stringMatching(uuidv4Pattern),
      createdAt: expect.any(Date),
      createdBy: req.currentContext.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_PERMIT_NOTE_1,
      permitNoteId: expect.stringMatching(uuidv4Pattern)
    });
  });
});
