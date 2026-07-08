import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { PermitNoteRepository } from '../../../src/repositories/permitNote.ts';

// Construct the real repo
const makeRepo = () => new PermitNoteRepository(prismaTxMock, 'principal-id');

describe('PermitNoteRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(PermitNoteRepository);
    });
  });
});
