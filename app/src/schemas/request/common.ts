import { z } from 'zod';

import { Regex } from '#src/utils/enums/application';

/** 8-character activity ID. */
export const activityId = z.string().min(8).max(8);

/** Date-only string (YYYY-MM-DD), canonical and not in the future. */
export const dateOnlyString = z
  .string()
  .regex(new RegExp(Regex.DATE_ONLY), '"Must be a valid date in the format YYYY-MM-DD"')
  .superRefine((value, ctx) => {
    const d = new Date(value);
    const canonical = Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
    if (canonical !== value || d.getTime() > Date.now()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '"Must be a valid date in the format YYYY-MM-DD"' });
    }
  });

/** Email address. */
export const email = z.string().regex(new RegExp(Regex.EMAIL));

/**
 * Date/timestamp not in the future, checked against the real current time on every parse
 * (not a fixed value baked in at schema-definition time).
 * @param message - validation error message
 * @returns a zod schema
 */
export const notInFutureDate = (message: string) =>
  z
    .union([z.string(), z.number(), z.date()])
    .pipe(z.coerce.date())
    .refine((d) => d.getTime() <= Date.now(), { message });

/** Phone number. */
export const phoneNumber = z.string().regex(new RegExp(Regex.PHONE_NUMBER));

/** UTC time string (HH:MM:SS(.ffffff)Z). */
export const timeTzString = z
  .string()
  .regex(new RegExp(Regex.TIMETZ), 'Must be a valid UTC time string (HH:MM:SS(.ffffff)Z)');

/** UUID v4. */
export const uuidv4 = z.string().regex(new RegExp(Regex.UUIDV4), 'Must be a valid uuidv4');

/** Boolean sent as a query string ("true"/"false"). */
export const queryBoolean = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());
