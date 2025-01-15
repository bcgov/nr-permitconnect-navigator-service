import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../../src/db/dataConnection.ts';

jest.mock('../../src/db/dataConnection.ts', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
