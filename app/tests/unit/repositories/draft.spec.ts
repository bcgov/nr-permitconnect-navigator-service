import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { DraftRepository } from '../../../src/repositories/draft.ts';

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
