import { z } from 'zod';

import { Regex } from '@/utils/enums/application';
import { delimitEmails } from '@/utils/utils';
import { requiredString } from '@/utils/zodSchema';

import type { FormValues } from '@/utils/zodSchema';

// Takes the seeded address array, or a separated string typed into the field
const emailListSchema = (min: number, message: string) =>
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

export const roadmapFormSchema = z.looseObject({
  from: z.string(),
  to: emailListSchema(1, 'To is required'),
  cc: emailListSchema(0, 'CC is not required'),
  bcc: emailListSchema(1, 'BCC is required'),
  subject: requiredString('Subject'),
  body: requiredString('Body'),
  bodyType: z.string()
});

export type FormSchemaType = FormValues<z.infer<typeof roadmapFormSchema>>;
