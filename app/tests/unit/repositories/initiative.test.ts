import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { InitiativeRepository } from '#src/repositories/initiative';

// Construct the real repo
const makeRepo = () => new InitiativeRepository(prismaTxMock, 'principal-id');

describe('InitiativeRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(InitiativeRepository);
    });
  });
});
