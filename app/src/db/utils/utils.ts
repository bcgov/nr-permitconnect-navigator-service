import { SYSTEM_ID } from '#src/utils/constants/application';

import type { Prisma } from '@prisma/client';
import type { CurrentContext } from '#types';

/**
 * Generates DB create stamps
 * @param currentContext The current context of the Express request
 * @returns An object with filled create stamps
 */
export function generateCreateStamps(currentContext: CurrentContext | undefined) {
  return {
    createdBy: currentContext?.userId ?? SYSTEM_ID,
    createdAt: new Date()
  };
}

/**
 * Generates DB update stamps
 * @param currentContext The current context of the Express request
 * @returns An object with filled update stamps
 */
export function generateUpdateStamps(currentContext: CurrentContext | undefined) {
  return {
    updatedBy: currentContext?.userId ?? SYSTEM_ID,
    updatedAt: new Date()
  };
}

/**
 * Generates null DB update stamps
 * @returns An object with null update stamps
 */
export function generateNullUpdateStamps() {
  return {
    updatedBy: null,
    updatedAt: null
  };
}

export function generateDeleteStamps(currentContext: CurrentContext | undefined) {
  return {
    deletedBy: currentContext?.userId ?? SYSTEM_ID,
    deletedAt: new Date()
  };
}

export function generateNullDeleteStamps() {
  return {
    deletedBy: null,
    deletedAt: null
  };
}

export function jsonToPrismaInputJson(json: unknown): Prisma.NullTypes.JsonNull | Prisma.InputJsonValue {
  if (json === null) return null as unknown as Prisma.JsonNullValueInput;

  // json comes in as unknown (validators use z.unknown() for this field) - confirm it's actually
  // JSON-serializable before handing it to Prisma. JSON.stringify throws on circular refs/BigInt,
  // and returns undefined for values with no JSON representation (function, symbol, undefined).
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(json);
  } catch {
    // fall through to the undefined check below
  }
  if (serialized === undefined) throw new Error('Value is not valid JSON');

  return json as Prisma.InputJsonValue;
}
