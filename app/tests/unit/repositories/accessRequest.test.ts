import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { AccessRequestRepository } from '../../../src/repositories/accessRequest.ts';

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
