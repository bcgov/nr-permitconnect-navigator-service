import { Prisma } from '@prisma/client';

import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import prisma from '../../../src/db/database.ts';
import { unitOfWork } from '../../../src/db/unitOfWork.ts';
import { requestContext } from '../../../src/types/context.ts';
import { SYSTEM_ID } from '../../../src/utils/constants/application.ts';

// Mock requestContext to control the AsyncLocalStorage output during tests
vi.mock('../../../src/types/context.ts', () => ({
  requestContext: {
    getStore: vi.fn()
  }
}));

describe('UnitOfWork', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Intercept Prisma's $transaction to immediately execute the callback with our transaction mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback(prismaTxMock);
    });
  });

  describe('execute', () => {
    const allRepositories = [
      'accessRequest',
      'activity',
      'activityContact',
      'contact',
      'document',
      'draft',
      'electrificationProject',
      'enquiry',
      'generalProject',
      'housingProject',
      'identityProvider',
      'initiative',
      'note',
      'noteHistory',
      'permit',
      'permitNote',
      'permitTracking',
      'permitType',
      'sourceSystemKind',
      'user',
      'group',
      'groupRolePolicyVw',
      'policyAttribute',
      'subjectGroup'
    ] as const;

    it('invokes the callback with a RepositoryProvider and the transaction mock', async () => {
      const result = await unitOfWork.execute(async (repos, tx) => {
        expect(tx).toBe(prismaTxMock);
        expect(repos).toBeDefined();
        return 'success';
      });

      expect(result).toBe('success');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it.each(allRepositories)('lazy loads and caches the %s repository', async (repoName) => {
      await unitOfWork.execute(async (repos) => {
        // Access the repository via the getter
        const repoInstance1 = repos[repoName];

        // Access it a second time to trigger the cache
        const repoInstance2 = repos[repoName];

        // Assert it instantiated successfully
        expect(repoInstance1).toBeDefined();
        expect(typeof repoInstance1).toBe('object');

        // Assert the exact same object reference is returned (caching works)
        expect(repoInstance1).toBe(repoInstance2);
      });
    });

    it('passes default transaction options to Prisma', async () => {
      await unitOfWork.execute(async () => 'test');

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        maxWait: 2000,
        timeout: 10000
      });
    });

    it('passes custom transaction options to Prisma', async () => {
      const customOpts = {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 20000
      };

      await unitOfWork.execute(async () => 'test', customOpts);

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), customOpts);
    });

    it('uses the requestContext principal if none is provided', async () => {
      vi.mocked(requestContext.getStore).mockReturnValue({ principal: 'context-user' } as never);

      await unitOfWork.execute(async (repos) => {
        expect(repos.user).toBeDefined();
      });

      expect(requestContext.getStore).toHaveBeenCalledTimes(1);
    });

    it('falls back to SYSTEM_ID if no principal or context is available', async () => {
      vi.mocked(requestContext.getStore).mockReturnValue(undefined);

      await unitOfWork.execute(async (repos) => {
        expect(repos.user).toBeDefined();
      });

      expect(requestContext.getStore).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeRaw', () => {
    it('invokes the callback with the raw transaction client and principal', async () => {
      const result = await unitOfWork.executeRaw(async (tx, principal) => {
        expect(tx).toBe(prismaTxMock);
        expect(principal).toBe('custom-principal');
        return 'raw-success';
      }, 'custom-principal');

      expect(result).toBe('raw-success');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('falls back to SYSTEM_ID if no principal is provided', async () => {
      await unitOfWork.executeRaw(async (tx, principal) => {
        expect(principal).toBe(SYSTEM_ID);
      });
    });

    it('passes custom transaction options to Prisma', async () => {
      const customOpts = {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadUncommitted,
        maxWait: 1000,
        timeout: 5000
      };

      await unitOfWork.executeRaw(async () => 'test', SYSTEM_ID, customOpts);

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), customOpts);
    });
  });
});
