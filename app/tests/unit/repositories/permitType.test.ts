import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { PermitTypeRepository } from '../../../src/repositories/permitType.ts';

// Construct the real repo
const makeRepo = () => new PermitTypeRepository(prismaTxMock, 'principal-id');

describe('PermitTypeRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(PermitTypeRepository);
    });
  });
});
