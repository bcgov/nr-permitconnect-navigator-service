import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

import prisma from '../../src/db/dataConnection';
import { transactionWrapper } from '../../src/db/utils/transactionWrapper';

import type { ExtendedClient, PrismaTransactionClient } from '../../src/db/dataConnection';

jest.mock('../../src/db/dataConnection', () => ({
  __esModule: true,
  default: mockDeep<ExtendedClient>()
}));

jest.mock('../../src/db/utils/transactionWrapper', () => ({
  __esModule: true,
  transactionWrapper: jest.fn()
}));

beforeEach(() => {
  mockReset(prismaMock);
  mockReset(prismaTxMock);
  (transactionWrapper as unknown as jest.Mock).mockImplementation(async (fn) => fn(prismaTxMock));
});

export const prismaMock = prisma as unknown as DeepMockProxy<ExtendedClient>;
export const prismaTxMock: DeepMockProxy<PrismaTransactionClient> = mockDeep<PrismaTransactionClient>();
