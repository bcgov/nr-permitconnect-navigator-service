import { z } from 'zod';

import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { formSection, maxMessage, requiredOneOf, requiredString } from '@/utils/zodSchema';
import { optionalTextSchema } from '@/validators/common';
import { contactFormSchema } from '@/validators/contact';

import type { CodeTableName, OrgBookOption } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

export function createProjectIntakeSchema(codeList: Record<CodeTableName, string[]>, orgBookOptions: OrgBookOption[]) {
  return z.looseObject({
    [IntakeFormCategory.BASIC]: formSection(
      z.looseObject({
        // Known bug: never required, even for the OTHER project type, as under yup
        projectDescription: z.string().nullish(),
        projectName: requiredString('Project name').max(255, maxMessage('Project name', 255)),
        registeredId: optionalTextSchema('Business ID'),
        registeredName: requiredString('Business name')
          .max(255, maxMessage('Business name', 255))
          .refine(
            (value) => orgBookOptions.some((option) => option.registeredName === value),
            'Business name must be a valid value from the list of suggestions'
          )
      })
    ),
    [IntakeFormCategory.CONTACTS]: formSection(contactFormSchema),
    project: formSection(
      z.looseObject({
        projectType: requiredOneOf('Project type', codeList.ElectrificationProjectType),
        bcHydroNumber: z.string().max(255, maxMessage('BC Hydro Call for Power project number', 255)).nullish()
      })
    )
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createProjectIntakeSchema>>>;
