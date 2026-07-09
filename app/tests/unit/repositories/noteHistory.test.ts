import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { NoteHistoryRepository } from '../../../src/repositories/noteHistory.ts';

// Construct the real repo
const makeRepo = () => new NoteHistoryRepository(prismaTxMock, 'principal-id');

describe('NoteHistoryRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(NoteHistoryRepository);
    });
  });
});
