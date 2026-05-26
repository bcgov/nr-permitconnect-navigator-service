// Unmock the cache module so we test the actual implementation
jest.unmock('../../../../src/db/codes/cache.ts');

import { codeTable, refreshCodeCaches } from '../../../../src/db/codes/cache.ts';
import { CODE_TABLES } from '../../../../src/db/codes/tables.ts';
import * as txWrapper from '../../../../src/db/utils/transactionWrapper.ts';
import * as codeService from '../../../../src/services/code.ts';
import { getLogger } from '../../../../src/utils/log.ts';
import type { CodeTableName } from '../../../../src/db/codes/types.ts';

jest.mock('../../../../src/utils/log.ts', () => {
  const mLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    verbose: jest.fn(),
    log: jest.fn()
  };
  return {
    getLogger: () => mLogger
  };
});

const mockLogger = getLogger();

describe('codeTable cache', () => {
  const listAllCodeTablesSpy = jest.spyOn(codeService, 'listAllCodeTables');
  const txWrapperSpy = jest.spyOn(txWrapper, 'transactionWrapper');

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset the module's in-memory cache state before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txWrapperSpy.mockImplementation(async (fn) => fn('tx' as any));
    listAllCodeTablesSpy.mockResolvedValue(undefined as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    await refreshCodeCaches();
  });

  describe('codeTable', () => {
    it('should return empty arrays/objects for all code tables initially', () => {
      for (const { name } of CODE_TABLES) {
        expect(codeTable[name as CodeTableName].codes).toEqual([]);
        expect(codeTable[name as CodeTableName].displays).toEqual({});
        expect(codeTable[name as CodeTableName].definitions).toEqual({});
      }
    });
  });

  describe('refreshCodeCaches', () => {
    it('should refresh the cache with new code tables and log debug', async () => {
      const fakeRows = Object.fromEntries(
        CODE_TABLES.map(({ name }) => [
          name,
          [
            { code: 'A', display: 'Alpha', definition: 'First' },
            { code: 'B', display: 'Beta', definition: null }
          ]
        ])
      );

      listAllCodeTablesSpy.mockResolvedValue(fakeRows as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await refreshCodeCaches();

      expect(result).toBe(true);
      for (const { name } of CODE_TABLES) {
        expect(codeTable[name as CodeTableName].codes).toEqual(['A', 'B']);
        expect(codeTable[name as CodeTableName].displays).toEqual({ A: 'Alpha', B: 'Beta' });
        expect(codeTable[name as CodeTableName].definitions).toEqual({ A: 'First' });
      }
      expect(mockLogger.debug).toHaveBeenCalledWith('Codes cache refreshed');
    });

    it('should log error and return false if refresh fails', async () => {
      txWrapperSpy.mockRejectedValueOnce(new Error('fail'));

      const result = await refreshCodeCaches();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Codes cache refresh failed', expect.any(Error));
    });

    it('should throw an error if an un-cached code table is accessed', () => {
      const noTable = 'MissingTable';

      expect(() => {
        // @ts-expect-error - Intentionally accessing a missing property to test the Proxy trap
        codeTable[noTable]; // eslint-disable-line @typescript-eslint/no-unused-expressions
      }).toThrow(
        `Code table '${noTable}' is missing from the cache. Run 'npm run prisma:enums' to ensure correct code enums.`
      );
    });
  });
});
