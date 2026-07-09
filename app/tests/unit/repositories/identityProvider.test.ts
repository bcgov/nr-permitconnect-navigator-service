import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { IdentityProviderRepository } from '../../../src/repositories/identityProvider.ts';

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
