import { prismaTxMock } from '../../../__mocks__/prismaMock.ts';
import { GroupRepository } from '../../../../src/repositories/yars/group.ts';

// Construct the real repo
const makeRepo = () => new GroupRepository(prismaTxMock, 'principal-id');

describe('GroupRepository', () => {
  describe('search', () => {
    it('makes repo', () => {
      const repo = makeRepo();

      expect(repo).toBeInstanceOf(GroupRepository);
    });
  });
});
