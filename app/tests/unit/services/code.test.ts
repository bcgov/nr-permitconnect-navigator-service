import { mockReset } from 'vitest-mock-extended';

import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import '../../__mocks__/unitOfWorkMock.ts';
import { CODE_TABLES } from '../../../src/db/codes/tables.ts';
import { listCodeTablesService } from '../../../src/services/code.ts';

import type { Mock } from 'vitest';
import type { CodeRow } from '../../../src/types/index.ts';

vi.mock('config');

// TS-friendly alias, eliminates the need for `as any` to access txMock dynamically.
type DynamicPrismaTx = Record<string, { findMany: Mock }>;
const txMock = prismaTxMock as unknown as DynamicPrismaTx;

describe('code service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(prismaTxMock);

    for (const { model } of CODE_TABLES) {
      if (!txMock[model]) txMock[model] = { findMany: vi.fn() };
      txMock[model].findMany.mockResolvedValue([]);
    }
  });

  describe('listCodeTablesService', () => {
    it('returns code tables with active rows only', async () => {
      const permitStateRows = [
        {
          code: 'IN_PROGRESS',
          display: 'In Progress',
          definition: 'desc',
          active: true,
          createdBy: null,
          createdAt: null,
          updatedBy: null,
          updatedAt: null,
          deletedBy: null,
          deletedAt: null
        }
      ] as unknown as CodeRow[];

      const targetTable = CODE_TABLES.find((t) => t.model === 'permit_state_code');
      if (targetTable) {
        txMock[targetTable.model].findMany.mockResolvedValue(permitStateRows);
      }

      const result = await listCodeTablesService();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');

      for (const { model } of CODE_TABLES) {
        expect(txMock[model].findMany).toHaveBeenCalledWith({ where: { active: true } });
      }
    });

    it('returns empty code table when no active rows exist', async () => {
      const result = await listCodeTablesService();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      for (const { name } of CODE_TABLES) {
        expect(result).toHaveProperty(name);
        expect(result[name as keyof typeof result]).toEqual([]);
      }
    });

    it('queries with where clause containing active:true', async () => {
      await listCodeTablesService();

      for (const { model } of CODE_TABLES) {
        expect(txMock[model].findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { active: true }
          })
        );
      }
    });
  });
});
