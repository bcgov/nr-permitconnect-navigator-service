import { Prisma } from '@prisma/client';

import { prismaMock, prismaTxMock } from '../../../__mocks__/prismaMock.ts';

import type * as TransactionWrapperModule from '../../../../src/db/utils/transactionWrapper.ts';

// The shared setup file (tests/__mocks__/prismaMock.ts) replaces transactionWrapper with a stub
// for every other spec. Here we want the real implementation so we can verify how it calls
// prisma.$transaction — vi.importActual bypasses the global mock for just this file.
let transactionWrapper: (typeof TransactionWrapperModule)['transactionWrapper'];

beforeAll(async () => {
  const actual = await vi.importActual<typeof TransactionWrapperModule>(
    '../../../../src/db/utils/transactionWrapper.ts'
  );
  transactionWrapper = actual.transactionWrapper;
});

describe('transactionWrapper', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockReset();
  });

  it('invokes the callback with the transaction client and returns its result', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaTxMock));

    const result = await transactionWrapper(async (tx) => {
      expect(tx).toBe(prismaTxMock);
      return 'value';
    });

    expect(result).toBe('value');
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('uses default isolationLevel/maxWait/timeout when no opts are provided', async () => {
    prismaMock.$transaction.mockResolvedValueOnce(undefined);

    await transactionWrapper(async () => undefined);

    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      maxWait: 2000,
      timeout: 10000
    });
  });

  it('forwards caller-supplied opts to prisma.$transaction', async () => {
    prismaMock.$transaction.mockResolvedValueOnce(undefined);

    await transactionWrapper(async () => undefined, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 500,
      timeout: 1000
    });

    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 500,
      timeout: 1000
    });
  });
});
