import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { DocumentRepository } from '../../../src/repositories/document.ts';

// Construct the real repo
const makeRepo = () => new DocumentRepository(prismaTxMock, 'principal-id');

describe('DocumentRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(DocumentRepository);
    });
  });
});
