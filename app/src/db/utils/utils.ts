import { Prisma } from '@prisma/client';

import { SYSTEM_ID } from '../../utils/constants/application.ts';

import type { CurrentContext } from '../../types/index.ts';

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

export function jsonToPrismaInputJson(json: Prisma.JsonValue): Prisma.NullTypes.JsonNull | Prisma.InputJsonValue {
  if (json === null) return null as unknown as Prisma.JsonNullValueInput;
  return json;
}
