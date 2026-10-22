import { z } from 'zod';

import { Regex } from '@/utils/enums/application';
import { emailListSchema, requiredString } from '@/utils/zodSchema';

import type { FormValues } from '@/utils/zodSchema';

export const roadmapFormSchema = z.looseObject({
  from: z.string().regex(new RegExp(Regex.EMAIL), 'The roadmap has no valid sender email'),
  to: emailListSchema(1, 'To is required'),
  cc: emailListSchema(0, 'CC is not required'),
  bcc: emailListSchema(1, 'BCC is required'),
  subject: requiredString('Subject'),
  body: requiredString('Body'),
  bodyType: z.string()
});

export type FormSchemaType = FormValues<z.infer<typeof roadmapFormSchema>>;
