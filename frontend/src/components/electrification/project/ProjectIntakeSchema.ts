import { object, string } from 'yup';

import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator } from '@/validators';

import type { CodeName } from '@/store/codeStore';

// Form validation schema
const stringRequiredSchema = string().required().max(255);

export function createProjectIntakeSchema(
  codeValues: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>,
  orgBookOptions: Array<string>
) {
  return object({
    [IntakeFormCategory.CONTACTS]: object(contactValidator),
    project: object({
      companyNameRegistered: stringRequiredSchema
        .oneOf(orgBookOptions, 'Business name must be a valid value from the list of suggestions')
        .label('Business name'),
      projectName: stringRequiredSchema.label('Project name'),
      projectType: stringRequiredSchema.oneOf(codeValues.ElectrificationProjectType).label('Project type'),
      bcHydroNumber: string().notRequired().max(255).nullable().label('BC Hydro Call for Power project number'),
      projectDescription: string().when('projectType', {
        is: enums.ElectrificationProjectType.OTHER,
        then: (schema) => schema.required().label('Project description'),
        otherwise: (schema) => schema.notRequired().nullable().label('Project description')
      })
    })
  });
}
