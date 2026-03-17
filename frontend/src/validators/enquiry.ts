import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactSchema } from '@/validators';
import { object, string, type InferType } from 'yup';

export const enquirySchema = object({
  [IntakeFormCategory.BASIC]: object({
    enquiryDescription: string().required().label('Enquiry')
  }),
  [IntakeFormCategory.CONTACTS]: contactSchema
});

export type FormSchemaType = InferType<typeof enquirySchema>;
