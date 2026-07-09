import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { ActivityContactRepository } from '../../../src/repositories/activityContact.ts';

// Construct the real repo
const makeRepo = () => new ActivityContactRepository(prismaTxMock, 'principal-id');

describe('ActivityContactRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(ActivityContactRepository);
    });
  });
});
