import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { UserRepository } from '../../../src/repositories/user.ts';
import { SYSTEM_ID } from '../../../src/utils/constants/application.ts';
import { TEST_IDIR_USER_1 } from '../data/index.ts';

// Construct the real repo - its constructor picks tx.user, so prismaTxMock.user
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new UserRepository(prismaTxMock, 'principal-id');

describe('UserRepository', () => {
  describe('findById', () => {
    it('queries user by userId', async () => {
      prismaTxMock.user.findUnique.mockResolvedValueOnce(TEST_IDIR_USER_1);

      const result = await makeRepo().findById('user-1');

      expect(prismaTxMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          userId: 'user-1'
        }
      });
      expect(result).toEqual(TEST_IDIR_USER_1);
    });
  });

  describe('findBySub', () => {
    it('queries user by sub', async () => {
      prismaTxMock.user.findUnique.mockResolvedValueOnce(TEST_IDIR_USER_1);

      const result = await makeRepo().findBySub('sub-123');

      expect(prismaTxMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          sub: 'sub-123'
        }
      });
      expect(result).toEqual(TEST_IDIR_USER_1);
    });
  });

  describe('search', () => {
    it('builds where clause with all search parameter filters', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: ['user-1', 'user-2'],
        idp: ['AZUREIDIR', 'IDIR'],
        sub: 'cd90c6bf44074872',
        email: 'john',
        firstName: 'John',
        fullName: 'Doe',
        lastName: 'Doe',
        active: true
      };

      await makeRepo().search(params);

      expect(prismaTxMock.user.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { userId: { in: ['user-1', 'user-2'] } },
            { idp: { in: ['AZUREIDIR', 'IDIR'], mode: 'insensitive' } },
            { sub: { contains: 'cd90c6bf44074872', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'John', mode: 'insensitive' } },
            { fullName: { contains: 'Doe', mode: 'insensitive' } },
            { lastName: { contains: 'Doe', mode: 'insensitive' } },
            { active: true }
          ],
          NOT: [
            {
              userId: SYSTEM_ID
            }
          ]
        }
      });
    });

    it('excludes SYSTEM_ID from results via NOT clause', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: ['user-1'],
        idp: [],
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: true
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.NOT).toEqual([
        {
          userId: SYSTEM_ID
        }
      ]);
    });

    it('applies case-insensitive search for idp', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: ['azureidir'],
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        idp: { in: ['azureidir'], mode: 'insensitive' }
      });
    });

    it('applies case-insensitive search for sub field', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: [],
        sub: 'CD90C6BF',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        sub: { contains: 'CD90C6BF', mode: 'insensitive' }
      });
    });

    it('applies case-insensitive search for email field', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: [],
        sub: '',
        email: 'JOHN@EXAMPLE.COM',
        firstName: '',
        fullName: '',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        email: { contains: 'JOHN@EXAMPLE.COM', mode: 'insensitive' }
      });
    });

    it('applies case-insensitive search for firstName field', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: [],
        sub: '',
        email: '',
        firstName: 'JOHN',
        fullName: '',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        firstName: { contains: 'JOHN', mode: 'insensitive' }
      });
    });

    it('applies case-insensitive search for fullName field', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: [],
        sub: '',
        email: '',
        firstName: '',
        fullName: 'DOE',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        fullName: { contains: 'DOE', mode: 'insensitive' }
      });
    });

    it('applies case-insensitive search for lastName field', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: [],
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: 'DOE',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        lastName: { contains: 'DOE', mode: 'insensitive' }
      });
    });

    it('filters by active status when active is true', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const params = {
        userId: [],
        idp: [],
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: true
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        active: true
      });
    });

    it('filters by active status when active is false', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([]);

      const params = {
        userId: [],
        idp: [],
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        active: false
      });
    });

    it('handles multiple userId values', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const userIds = ['user-1', 'user-2', 'user-3'];
      const params = {
        userId: userIds,
        idp: [],
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: true
      };

      await makeRepo().search(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0] as any;
      expect(callArgs.where.AND[0]).toEqual({
        userId: { in: userIds }
      });
    });

    it('handles multiple idp values', async () => {
      prismaTxMock.user.findMany.mockResolvedValueOnce([TEST_IDIR_USER_1]);

      const idps = ['AZUREIDIR', 'IDIR', 'BCEID'];
      const params = {
        userId: [],
        idp: idps,
        sub: '',
        email: '',
        firstName: '',
        fullName: '',
        lastName: '',
        active: false
      };

      await makeRepo().search(params);

      const callArgs = prismaTxMock.user.findMany.mock.calls[0][0];
      expect(callArgs?.where?.AND).toContainEqual({
        idp: { in: idps, mode: 'insensitive' }
      });
    });
  });
});
