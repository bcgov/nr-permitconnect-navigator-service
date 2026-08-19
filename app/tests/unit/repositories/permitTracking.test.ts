import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { PermitTrackingRepository } from '#src/repositories/permitTracking';

// Construct the real repo
const makeRepo = () => new PermitTrackingRepository(prismaTxMock, 'principal-id');

describe('PermitTrackingRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(PermitTrackingRepository);
    });
  });
});
