import { z } from 'zod';

import { Regex } from '#src/utils/enums/application';

export const activityId = z.string().min(8).max(8);

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

export const email = z.string().regex(new RegExp(Regex.EMAIL));

// z.coerce.date().max(new Date()) evaluates new Date() once at schema-definition time, not per
// request - a fixed "now" baked in at server startup that every later timestamp then fails against.
// This checks against the real current time on every parse instead.
export const notInFutureDate = (message: string) =>
  z.coerce.date().refine((d) => d.getTime() <= Date.now(), { message });

export const phoneNumber = z.string().regex(new RegExp(Regex.PHONE_NUMBER));

export const timeTzString = z
  .string()
  .regex(new RegExp(Regex.TIMETZ), 'Must be a valid UTC time string (HH:MM:SS(.ffffff)Z)');

export const uuidv4 = z.string().uuid();

// Query string values arrive as strings ("true"/"false"), not real booleans - z.coerce.boolean() would
// wrongly treat "false" as truthy, so parse the two accepted string forms explicitly.
export const queryBoolean = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());
