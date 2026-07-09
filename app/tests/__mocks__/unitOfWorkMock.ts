import { mockDeep } from 'vitest-mock-extended';

import { prismaTxMock } from './prismaMock.ts';

import type { Repositories } from '../../src/db/unitOfWork.ts';

export const mockRepos = mockDeep<Repositories>();

vi.mock('../../src/db/unitOfWork', () => ({
  __esModule: true,
  unitOfWork: {
    execute: vi.fn(async (fn: (repos: Repositories, tx: unknown) => unknown) => fn(mockRepos, prismaTxMock)),
    executeRaw: vi.fn(async (fn: (tx: unknown, principal: string) => unknown, principal = 'SYS') =>
      fn(prismaTxMock, principal)
    )
  }
}));
