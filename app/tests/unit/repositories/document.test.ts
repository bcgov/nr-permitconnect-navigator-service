import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { DocumentRepository } from '#src/repositories/document';

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
