import { z } from 'zod';

import { Regex } from '@/utils/enums/application';
import { delimitEmails } from '@/utils/utils';

import type { TypedSchema, TypedSchemaError } from 'vee-validate';

/**
 * Refinement option that runs an object-level check even when a field already failed,
 * so cross-field errors appear alongside field errors instead of after them.
 */
export const evenWithIssues = {
  when: (payload: { value: unknown }) => typeof payload.value === 'object' && payload.value !== null
};

/**
 * Builds the standard required message from a field label.
 * @param label - The field label.
 * @returns The required message.
 */
export const requiredMessage = (label: string) => `${label} is a required field`;

/**
 * Builds the standard allowed-values message from a field label.
 * @param label - The field label.
 * @param values - The allowed values.
 * @returns The allowed-values message.
 */
export const oneOfMessage = (label: string, values: readonly unknown[]) =>
  `${label} must be one of the following values: ${values.join(', ')}`;

/**
 * Builds the standard max-length message from a field label.
 * @param label - The field label.
 * @param max - The maximum length.
 * @returns The max-length message.
 */
export const maxMessage = (label: string, max: number) => `${label} must be at most ${max} characters`;

/**
 * Whether a raw input counts as not filled in: never set, cleared to null, or left empty.
 * @param value - The raw input.
 * @returns Whether the input is blank.
 */
export const isBlank = (value: unknown) => value === undefined || value === null || value === '';

/**
 * Narrows an unknown refinement value to one of a list of allowed values.
 * @param values - The allowed values.
 * @param value - The value to check.
 * @returns Whether the value is one of the allowed values.
 */
export const isOneOf = <T>(values: readonly T[], value: unknown): value is T => values.includes(value as T);

/**
 * Keeps a stored value only when it is one of a list of allowed values, so a form asks again for anything else.
 * @param values - The allowed values.
 * @param value - The stored value.
 * @returns The value, or undefined when it is not allowed.
 */
export const toOneOf = <T>(values: readonly T[], value: unknown): T | undefined =>
  isOneOf(values, value) ? value : undefined;

/**
 * Builds a required enum with the required message for missing values and the allowed-values message otherwise.
 * @param label - The field label.
 * @param values - The allowed values.
 * @returns The enum schema.
 */
export const requiredOneOf = <T extends string>(label: string, values: readonly T[]) =>
  z.enum(values as [T, ...T[]], {
    error: (issue) => (isBlank(issue.input) ? requiredMessage(label) : oneOfMessage(label, values))
  });

/**
 * Builds a required string that rejects empty strings but does not trim.
 * @param label - The field label.
 * @returns The string schema.
 */
export const requiredString = (label: string) => z.string(requiredMessage(label)).min(1, requiredMessage(label));

// Trims text and treats blank text as unset
const blankToNull = (value: unknown) => (typeof value === 'string' ? value.trim() || null : value);

/**
 * Builds optional text that is trimmed, with blank text output as null.
 * @param label - The field label.
 * @param max - The optional maximum length.
 * @returns The text schema.
 */
export const optionalTextSchema = (label: string, max?: number) =>
  z.preprocess(blankToNull, (max ? z.string().max(max, maxMessage(label, max)) : z.string()).nullish());

/**
 * Builds required text that is trimmed, so blank text counts as missing.
 * @param label - The field label.
 * @param max - The optional maximum length.
 * @returns The text schema.
 */
export const requiredTextSchema = (label: string, max?: number) =>
  z.preprocess(blankToNull, max ? requiredString(label).max(max, maxMessage(label, max)) : requiredString(label));

/**
 * Builds an optional enum where blank text, null or a missing value all mean unset and output null.
 * @param label - The field label.
 * @param values - The allowed values.
 * @returns The enum schema.
 */
export const blankOrOneOfSchema = <T extends string>(label: string, values: readonly T[]) =>
  z.preprocess(blankToNull, z.enum(values as [T, ...T[]], oneOfMessage(label, values)).nullish());

/**
 * Builds an optional enum where only a missing value means unset; unlike blankOrOneOfSchema, it rejects blanks.
 * @param label - The field label.
 * @param values - The allowed values.
 * @returns The enum schema.
 */
export const missingOrOneOfSchema = <T extends string>(label: string, values: readonly T[]) =>
  z.enum(values as [T, ...T[]], oneOfMessage(label, values)).optional();

/**
 * Preprocessor that turns numeric text from an input into a number, leaving anything else for the schema to judge.
 * @param value - The raw input.
 * @returns The number, or the raw input.
 */
export const coerceNumber = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

/**
 * Builds an optional number within inclusive bounds that also accepts numeric text.
 * @param label - The field label.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns The number schema.
 */
export const numberRangeSchema = (label: string, min: number, max: number) =>
  z.preprocess(
    coerceNumber,
    z
      .number(`${label} must be a number`)
      .min(min, `${label} must be greater than or equal to ${min}`)
      .max(max, `${label} must be less than or equal to ${max}`)
      .nullish()
  );

/**
 * Preprocessor that turns date text into a Date, with date-only strings parsed as local midnight.
 * @param value - The raw input.
 * @returns The date, or the raw input.
 */
export const coerceDate = (value: unknown) =>
  typeof value === 'string' ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value) : value;

/**
 * Builds an optional date that also accepts date text.
 * @param label - The field label.
 * @returns The date schema.
 */
export const dateSchema = (label: string) =>
  z.preprocess(coerceDate, z.date(`${label} must be a valid date`).nullish());

/**
 * Builds an optional date that also accepts date text and rejects dates after now.
 * @param label - The field label.
 * @returns The date schema.
 */
export const notInFutureSchema = (label: string) =>
  dateSchema(label).refine((date) => !date || date.getTime() <= Date.now(), 'Date cannot be in the future');

/**
 * Builds a list of email addresses that accepts an array or a space, comma or semicolon separated string.
 * @param min - The minimum number of addresses.
 * @param message - The message when there are too few addresses.
 * @returns The email list schema.
 */
export const emailListSchema = (min: number, message: string) =>
  z.preprocess(
    (value) => (Array.isArray(value) ? value : typeof value === 'string' ? delimitEmails(value) : []),
    z
      .array(
        z
          .string()
          .trim()
          .regex(new RegExp(Regex.EMAIL), { error: (issue) => `${issue.input} is not a valid email` })
      )
      .min(min, message)
  );

/**
 * Adds a custom issue to a refinement, at a field of the refined object or at the object itself.
 * @param ctx - The refinement context.
 * @param key - The field key, or a path relative to the refined object (`[]` for the object itself).
 * @param message - The issue message.
 */
export function addIssue(ctx: z.RefinementCtx, key: string | PropertyKey[], message: string) {
  ctx.addIssue({ code: 'custom', path: typeof key === 'string' ? [key] : key, message });
}

/**
 * Requires a conditionally required text field and caps it at 255 characters.
 * @param ctx - The refinement context.
 * @param key - The field key.
 * @param label - The field label.
 * @param value - The field value.
 */
export function requireText(ctx: z.RefinementCtx, key: string, label: string, value: unknown) {
  if (!value) addIssue(ctx, key, requiredMessage(label));
  else if (typeof value === 'string' && value.length > 255) addIssue(ctx, key, maxMessage(label, 255));
}

/**
 * Validates a missing form section as `{}`, so its fields report errors instead of the section itself.
 * vee-validate drops a section entirely once all of its fields unmount.
 * @param schema - The section schema.
 * @returns The section schema with an empty-object prefault.
 */
export const formSection = <T extends z.ZodType>(schema: T) => schema.prefault({} as z.input<T>);

/**
 * A form schema's output type without the `[key: string]: unknown` index signatures z.looseObject adds,
 * so API interfaces stay assignable to form values.
 */
export type FormValues<T> = T extends Date | ((...args: never[]) => unknown)
  ? T
  : T extends readonly (infer U)[]
    ? FormValues<U>[]
    : T extends object
      ? { [K in keyof T as string extends K ? never : K]: FormValues<T[K]> }
      : T;

/**
 * Formats a zod issue path the way vee-validate field names are written, e.g. `permits.appliedPermits[0].permitTypeId`.
 * @param path - The zod issue path.
 * @returns The vee-validate field path.
 */
function toFieldPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((acc, key) => {
    if (typeof key === 'number') return `${acc}[${key}]`;
    return acc ? `${acc}.${String(key)}` : String(key);
  }, '');
}

/**
 * Wraps a zod schema for vee-validate, which has no zod 4 adapter or Standard Schema support as of 4.15.1.
 * @param schema - The zod schema to validate the form with.
 * @returns A vee-validate typed schema; submit handlers receive the parsed output.
 */
export function toTypedSchema<T extends z.ZodType>(schema: T): TypedSchema<z.input<T>, z.output<T>> {
  return {
    __type: 'VVTypedSchema',
    async parse(values) {
      const result = await schema.safeParseAsync(values);
      if (result.success) return { value: result.data, errors: [] };

      const errors: Record<string, TypedSchemaError> = {};
      for (const issue of result.error.issues) {
        const path = toFieldPath(issue.path);
        (errors[path] ??= { path, errors: [] }).errors.push(issue.message);
      }
      return { errors: Object.values(errors) };
    }
  };
}
