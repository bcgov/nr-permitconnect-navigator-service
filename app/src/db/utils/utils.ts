import { SYSTEM_ID } from '#src/utils/constants/application';

import type { Prisma } from '#prismaClient';
import type { CurrentContext } from '#types';

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
 * Builds a where fragment restricting results to activities the given user is a contact on.
 * @param userId The user to scope to, or undefined for no restriction
 * @returns A where fragment for any model with an `activity` relation, or an empty object
 */
export function activityContactScope(userId?: string) {
  if (!userId) return {};

  return {
    activity: {
      activityContact: { some: { contact: { userId } } }
    }
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
export function jsonToPrismaInputJson(json: unknown): typeof Prisma.JsonNull | Prisma.InputJsonValue | undefined {
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
