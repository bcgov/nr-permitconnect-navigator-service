import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { PermitTypeRepository } from '#src/repositories/permitType';

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
