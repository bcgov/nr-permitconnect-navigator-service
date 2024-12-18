import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../../src/db/dataConnection';

jest.mock('../../src/db/dataConnection', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
