import { prismaTxMock } from '../../__mocks__/prismaMock';

import { TEST_NOTE_1 } from '../data';
import * as noteService from '../../../src/services/note';

describe('createNote', () => {
  it('calls note.create and returns result', async () => {
    prismaTxMock.note.create.mockResolvedValueOnce(TEST_NOTE_1);

    const response = await noteService.createNote(prismaTxMock, TEST_NOTE_1);

    expect(prismaTxMock.note.create).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(TEST_NOTE_1);
  });
});
