import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { ActivityRepository } from '../../../src/repositories/activity.ts';

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
