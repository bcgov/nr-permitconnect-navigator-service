import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { ActivityContactRepository } from '#src/repositories/activityContact';

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
