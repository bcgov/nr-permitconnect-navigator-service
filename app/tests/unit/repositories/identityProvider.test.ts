import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { IdentityProviderRepository } from '#src/repositories/identityProvider';

// Construct the real repo
const makeRepo = () => new IdentityProviderRepository(prismaTxMock, 'principal-id');

describe('IdentityProviderRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(IdentityProviderRepository);
    });
  });
});
