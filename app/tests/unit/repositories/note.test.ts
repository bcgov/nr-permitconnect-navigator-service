import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { NoteRepository } from '#src/repositories/note';

// Construct the real repo
const makeRepo = () => new NoteRepository(prismaTxMock, 'principal-id');

describe('NoteRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(NoteRepository);
    });
  });
});
