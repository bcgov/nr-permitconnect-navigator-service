import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { NoteRepository } from '../../../src/repositories/note.ts';

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
