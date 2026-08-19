import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { PermitNoteRepository } from '#src/repositories/permitNote';

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
