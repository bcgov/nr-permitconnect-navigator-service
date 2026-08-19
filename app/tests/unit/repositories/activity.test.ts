import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { ActivityRepository } from '#src/repositories/activity';

// Construct the real repo
const makeRepo = () => new ActivityRepository(prismaTxMock, 'principal-id');

describe('ActivityRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(ActivityRepository);
    });
  });
});
