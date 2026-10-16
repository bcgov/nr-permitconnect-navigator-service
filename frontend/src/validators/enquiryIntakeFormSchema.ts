import { z } from 'zod';

import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { formSection, requiredString } from '@/utils/zodSchema';
import { contactFormSchema } from '@/validators/contact';

import type { FormValues } from '@/utils/zodSchema';

export const enquiryIntakeFormSchema = z.looseObject({
  [IntakeFormCategory.BASIC]: formSection(z.looseObject({ enquiryDescription: requiredString('Enquiry') })),
  [IntakeFormCategory.CONTACTS]: formSection(contactFormSchema)
});

export type FormSchemaType = FormValues<z.infer<typeof enquiryIntakeFormSchema>>;
