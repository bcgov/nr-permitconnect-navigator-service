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

/**
 * Converts an unknown value (validators use z.unknown() for JSON fields) into a Prisma JSON input.
 * `undefined` passes through unchanged since Prisma treats it as "omit this field," not invalid data.
 * Otherwise returns the parsed JSON round-trip (not the original value), since JSON.stringify
 * silently drops/coerces values with no JSON representation (undefined props, functions,
 * NaN/Infinity->null) that would otherwise slip past this check unmodified.
 * @param json - the raw value to convert
 * @returns the Prisma JSON input, or undefined if `json` was undefined
 */
export function jsonToPrismaInputJson(json: unknown): Prisma.NullTypes.JsonNull | Prisma.InputJsonValue | undefined {
  if (json === null) return null as unknown as Prisma.JsonNullValueInput;
  if (json === undefined) return undefined;

  try {
    const serialized = JSON.stringify(json);
    if (serialized === undefined) throw new Error('Value is not valid JSON');
    return JSON.parse(serialized) as Prisma.InputJsonValue;
  } catch {
    throw new Error('Value is not valid JSON');
  }
}
