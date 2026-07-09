import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { PermitTrackingRepository } from '../../../src/repositories/permitTracking.ts';

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
