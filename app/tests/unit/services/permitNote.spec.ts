import { prismaTxMock } from '../../__mocks__/prismaMock';

import { TEST_PERMIT_NOTE_1 } from '../data';
import * as permitNoteService from '../../../src/services/permitNote';

describe('createPermitNote', () => {
  it('calls permit_note.create and returns result', async () => {
    prismaTxMock.permit_note.create.mockResolvedValueOnce(TEST_PERMIT_NOTE_1);

    const response = await permitNoteService.createPermitNote(prismaTxMock, TEST_PERMIT_NOTE_1);

    expect(prismaTxMock.permit_note.create).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(TEST_PERMIT_NOTE_1);
  });
});
