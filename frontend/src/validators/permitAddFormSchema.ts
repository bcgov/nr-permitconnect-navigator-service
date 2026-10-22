import { z } from 'zod';

import { formSection } from '@/utils/zodSchema';
import { appliedPermitSchema } from '@/validators/common';

import type { FormValues } from '@/utils/zodSchema';

const PERMIT_REQUIRED = 'At least one permit is required';

export const permitAddFormSchema = z.looseObject({
  permits: formSection(
    z.looseObject({ appliedPermits: z.array(appliedPermitSchema, PERMIT_REQUIRED).min(1, PERMIT_REQUIRED) })
  )
});

export type FormSchemaType = FormValues<z.infer<typeof permitAddFormSchema>>;
