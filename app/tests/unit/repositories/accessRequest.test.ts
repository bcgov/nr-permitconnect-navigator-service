import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { AccessRequestRepository } from '#src/repositories/accessRequest';

// Construct the real repo
const makeRepo = () => new AccessRequestRepository(prismaTxMock, 'principal-id');

describe('AccessRequestRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(AccessRequestRepository);
    });
  });
});
