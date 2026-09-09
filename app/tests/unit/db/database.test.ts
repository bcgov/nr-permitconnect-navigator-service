import { mockDeep } from 'vitest-mock-extended';

import type * as DatabaseModule from '#src/db/database';

vi.mock('config', () => ({
  default: {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'server.db.password') return 'p@ss:w/o?r#d%';
      return 'test';
    }),
    has: vi.fn().mockReturnValue(false)
  }
}));

const prismaInternalMock = mockDeep<DatabaseModule.ExtendedClient>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prismaInternalMock as any).$extends = vi.fn().mockReturnValue(prismaInternalMock);

vi.mock('../../../src/db/generated/client/client.ts', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('../../../src/db/generated/client/client.ts');
  return {
    ...actual,
    // Must be a regular function (not an arrow) so `new PrismaClient(...)` works.
    PrismaClient: vi.fn(function () {
      return prismaInternalMock;
    })
  };
});

let checkDatabaseHealth: (typeof DatabaseModule)['checkDatabaseHealth'];

beforeEach(async () => {
  const actual = await vi.importActual<typeof DatabaseModule>('../../../src/db/database.ts');
  checkDatabaseHealth = actual.checkDatabaseHealth;
});

describe('checkDatabaseHealth', () => {
  beforeEach(() => {
    prismaInternalMock.$queryRaw.mockReset();
  });

  it('returns true when the query resolves with { result: 1 }', async () => {
    prismaInternalMock.$queryRaw.mockResolvedValueOnce([{ result: 1 }]);

    const result = await checkDatabaseHealth();

    expect(prismaInternalMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prismaInternalMock.$queryRaw).toHaveBeenCalledWith(expect.arrayContaining(['SELECT 1 AS result']));
    expect(result).toBe(true);
  });

  it('returns false when the query rejects', async () => {
    prismaInternalMock.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

    const result = await checkDatabaseHealth();

    expect(prismaInternalMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('returns false when the query resolves but result is not 1', async () => {
    prismaInternalMock.$queryRaw.mockResolvedValueOnce([{ result: 0 }]);

    const result = await checkDatabaseHealth();

    expect(result).toBe(false);
  });
});
