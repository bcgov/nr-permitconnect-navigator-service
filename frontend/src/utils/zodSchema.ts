import { z } from 'zod';

import type { TypedSchema, TypedSchemaError } from 'vee-validate';

/**
 * Refinement option that runs an object-level check even when a field already failed,
 * so cross-field errors appear alongside field errors instead of after them.
 */
export const evenWithIssues = {
  when: (payload: { value: unknown }) => typeof payload.value === 'object' && payload.value !== null
};

/**
 * Builds the required message yup generated from a field label.
 * @param label - The field label.
 * @returns The required message.
 */
export const requiredMessage = (label: string) => `${label} is a required field`;

/**
 * Builds the allowed-values message yup generated from a field label.
 * @param label - The field label.
 * @param values - The allowed values.
 * @returns The allowed-values message.
 */
export const oneOfMessage = (label: string, values: readonly unknown[]) =>
  `${label} must be one of the following values: ${values.join(', ')}`;

/**
 * Builds the max-length message yup generated from a field label.
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
 * Builds a required enum with yup's required message for missing values and its allowed-values message otherwise.
 * @param label - The field label.
 * @param values - The allowed values.
 * @returns The enum schema.
 */
export const requiredOneOf = <T extends string>(label: string, values: readonly T[]) =>
  z.enum(values as [T, ...T[]], {
    error: (issue) => (isBlank(issue.input) ? requiredMessage(label) : oneOfMessage(label, values))
  });

/**
 * Builds a required string that rejects empty strings but, like yup's `string().required()`, does not trim.
 * @param label - The field label.
 * @returns The string schema.
 */
export const requiredString = (label: string) => z.string(requiredMessage(label)).min(1, requiredMessage(label));

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
