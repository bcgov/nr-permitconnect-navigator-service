import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { GroupRepository } from '#src/repositories/yars/group';

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
