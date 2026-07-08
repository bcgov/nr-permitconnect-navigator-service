import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { InitiativeRepository } from '../../../src/repositories/initiative.ts';

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
