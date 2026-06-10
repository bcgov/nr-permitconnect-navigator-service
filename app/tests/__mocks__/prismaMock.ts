import { mockDeep, mockReset } from 'vitest-mock-extended';
import { vi } from 'vitest';

import prisma from '../../src/db/database.ts';
import * as codeEnums from '../../src/db/codes/enums.ts';

import type { DeepMockProxy } from 'vitest-mock-extended';
import type { ExtendedClient, PrismaTransactionClient } from '../../src/db/database.ts';

function makeCodeTableMock() {
  const codeTable: Record<
    string,
    { codes: string[]; displays: Record<string, string>; definitions: Record<string, string> }
  > = {};
  for (const [tableName, enumObj] of Object.entries(codeEnums)) {
    if (typeof enumObj === 'object' && enumObj !== null) {
      const codes = Object.values(enumObj);
      codeTable[tableName] = {
        codes,
        displays: Object.fromEntries(
          codes.map((code) => [code, code.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())])
        ),
        definitions: Object.fromEntries(codes.map((code) => [code, `${code} definition`]))
      };
    }
  }
  return codeTable;
}

type TransactionWrapperFn = <T>(callback: (tx: DeepMockProxy<PrismaTransactionClient>) => Promise<T>) => Promise<T>;
let transactionWrapperMock: ReturnType<typeof vi.fn> | undefined;

vi.mock('../../src/db/database', () => ({
  __esModule: true,
  default: mockDeep<ExtendedClient>(),
  checkDatabaseHealth: vi.fn(),
  checkDatabaseSchema: vi.fn()
}));

vi.mock('../../src/db/utils/transactionWrapper', () => {
  transactionWrapperMock = vi.fn();
  return {
    __esModule: true,
    transactionWrapper: transactionWrapperMock
  };
});

vi.mock('../../src/db/codes/cache', () => ({
  codeTable: makeCodeTableMock()
}));

// Prisma here is the mocked default export installed above, it is exposed as the shared DeepMockProxy.
// Note: we intentionally do NOT mockReset this between tests, several existing tests rely on mock implementations
// (e.g. $transaction.mockImplementationOnce) persisting across tests within a file.
// Tests that need a clean prismaMock should clear/reset specific methods themselves.
const prismaMockInstance = prisma as unknown as DeepMockProxy<ExtendedClient>;
const prismaTxMockInstance: DeepMockProxy<PrismaTransactionClient> = mockDeep<PrismaTransactionClient>();

beforeEach(() => {
  mockReset(prismaTxMockInstance);
  if (transactionWrapperMock) {
    transactionWrapperMock.mockReset();
    transactionWrapperMock.mockImplementation(((fn) => fn(prismaTxMockInstance)) as TransactionWrapperFn);
  }
});

export const prismaMock = prismaMockInstance;
export const prismaTxMock = prismaTxMockInstance;
