import { mockDeep, mockReset } from 'jest-mock-extended';

import prisma from '../../src/db/dataConnection.ts';
import * as codeEnums from '../../src/db/codes/enums.ts';
import { transactionWrapper } from '../../src/db/utils/transactionWrapper.ts';

import type { DeepMockProxy } from 'jest-mock-extended';
import type { ExtendedClient, PrismaTransactionClient } from '../../src/db/dataConnection.ts';

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

jest.mock('../../src/db/dataConnection', () => ({
  __esModule: true,
  default: mockDeep<ExtendedClient>()
}));

jest.mock('../../src/db/utils/transactionWrapper', () => ({
  __esModule: true,
  transactionWrapper: jest.fn()
}));

jest.mock('../../src/db/codes/cache', () => ({
  codeTable: makeCodeTableMock()
}));

beforeEach(() => {
  mockReset(prismaMock);
  mockReset(prismaTxMock);
  (transactionWrapper as unknown as jest.Mock).mockImplementation(async (fn) => fn(prismaTxMock));
});

export const prismaMock = prisma as unknown as DeepMockProxy<ExtendedClient>;
export const prismaTxMock: DeepMockProxy<PrismaTransactionClient> = mockDeep<PrismaTransactionClient>();
