import { z } from 'zod';

import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import {
  evenWithIssues,
  formSection,
  maxMessage,
  requiredOneOf,
  requiredString,
  requiredTextSchema
} from '@/utils/zodSchema';
import { locationFormSchema, permitsFormSchema, refineBusinessRegistration } from '@/validators/common';
import { contactFormSchema } from '@/validators/contact';

import type { OrgBookOption } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

export function createProjectIntakeSchema(orgBookOptions: OrgBookOption[]) {
  const basic = z
    .looseObject({
      projectApplicantType: requiredOneOf('Project developed', PROJECT_APPLICANT_LIST),
      isDevelopedInBc: z.string().nullish(),
      // Unlike housing, these are not trimmed
      registeredId: z.string().nullish(),
      registeredName: z.string().nullish(),
      projectName: requiredString('Project name').max(255, maxMessage('Project name', 255)),
      projectDescription: requiredTextSchema('Project description'),
      projectNumber: z.string().max(255, maxMessage('Project number', 255)).optional()
    })
    .superRefine(refineBusinessRegistration(orgBookOptions), evenWithIssues);

  return z.looseObject({
    [IntakeFormCategory.CONTACTS]: formSection(contactFormSchema),
    [IntakeFormCategory.BASIC]: formSection(basic),
    [IntakeFormCategory.LOCATION]: formSection(locationFormSchema),
    [IntakeFormCategory.PERMITS]: formSection(permitsFormSchema)
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createProjectIntakeSchema>>>;
