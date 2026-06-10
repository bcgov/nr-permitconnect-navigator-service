import { mockDeep } from 'vitest-mock-extended';

import type * as DatabaseModule from '../../../src/db/database.ts';

vi.mock('config', () => ({
  default: {
    get: vi.fn().mockReturnValue('test'),
    has: vi.fn().mockReturnValue(false)
  }
}));

const prismaInternalMock = mockDeep<DatabaseModule.ExtendedClient>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prismaInternalMock as any).$extends = vi.fn().mockReturnValue(prismaInternalMock);

vi.mock('@prisma/client', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>('@prisma/client');
  return {
    ...actual,
    // Must be a regular function (not an arrow) so `new PrismaClient(...)` works.
    PrismaClient: vi.fn(function () {
      return prismaInternalMock;
    })
  };
});

let checkDatabaseHealth: (typeof DatabaseModule)['checkDatabaseHealth'];
let checkDatabaseSchema: (typeof DatabaseModule)['checkDatabaseSchema'];

beforeAll(async () => {
  const actual = await vi.importActual<typeof DatabaseModule>('../../../src/db/database.ts');
  checkDatabaseHealth = actual.checkDatabaseHealth;
  checkDatabaseSchema = actual.checkDatabaseSchema;
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

describe('checkDatabaseSchema', () => {
  it('returns true when every expected table is present in the Prisma datamodel', () => {
    const freezeSpy = vi.spyOn(Object, 'freeze');

    const result = checkDatabaseSchema();

    expect(result).toBe(true);
    expect(freezeSpy).toHaveBeenCalledWith({
      schemas: ['public', 'yars'],
      tables: [
        'access_request',
        'activity',
        'activity_contact',
        'contact',
        'document',
        'draft',
        'draft_code',
        'electrification_project',
        'electrification_project_category_code',
        'electrification_project_type_code',
        'email_log',
        'enquiry',
        'general_project',
        'housing_project',
        'identity_provider',
        'initiative',
        'note',
        'note_history',
        'permit',
        'permit_note',
        'permit_type',
        'user',
        'permit_type_initiative_xref'
      ]
    });

    freezeSpy.mockRestore();
  });
});
