import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { DraftRepository } from '#src/repositories/draft';

// Construct the real repo
const makeRepo = () => new DraftRepository(prismaTxMock, 'principal-id');

describe('DraftRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(DraftRepository);
    });
  });
});
