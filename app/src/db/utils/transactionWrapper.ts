import { Prisma } from '@prisma/client';

import prisma from '../dataConnection.ts';

import type { PrismaTransactionClient } from '../dataConnection.ts';

interface TxOpts {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxWait?: number;
  timeout?: number;
}

/**
 * Run a transaction with the specified options
 * @param fn The function to run within the transaction
 * @param opts Options for the transaction
 * @returns The result of the transaction
 */
export async function transactionWrapper<T>(
  fn: (tx: PrismaTransactionClient) => Promise<T>,
  opts: TxOpts = {}
): Promise<T> {
  const { isolationLevel = Prisma.TransactionIsolationLevel.ReadCommitted, maxWait = 2000, timeout = 10000 } = opts;

  return prisma.$transaction((tx) => fn(tx), { isolationLevel, maxWait, timeout });
}
