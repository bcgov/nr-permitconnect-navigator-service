import { IntakeFormCategory } from '@/utils/enums/housing';
import { contactValidator } from '@/validators';
import { object, string } from 'yup';

import type { CodeName } from '@/store/codeStore';

// Form validation schema
const stringRequiredSchema = string().required().max(255);

export function createProjectIntakeSchema(
  codeValues: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>
) {
  return object({
    [IntakeFormCategory.CONTACTS]: object(contactValidator),
    project: object({
      companyNameRegistered: stringRequiredSchema.label('Business name'),
      projectName: stringRequiredSchema.label('Project name'),
      projectType: stringRequiredSchema.oneOf(codeValues.ElectrificationProjectType).label('Project type'),
      bcHydroNumber: string().when('projectType', {
        is: (value: string) =>
          value === enums.ElectrificationProjectType.IPP_SOLAR || value === enums.ElectrificationProjectType.IPP_WIND,
        then: (schema) => schema.required().label('BC Hydro Call for Power project number'),
        otherwise: (schema) => schema.notRequired().nullable().label('BC Hydro Call for Power project number')
      }),
      projectDescription: string().when('projectType', {
        is: enums.ElectrificationProjectType.OTHER,
        then: (schema) => schema.required().label('Project description'),
        otherwise: (schema) => schema.notRequired().nullable().label('Project description')
      })
    })
  });
}
