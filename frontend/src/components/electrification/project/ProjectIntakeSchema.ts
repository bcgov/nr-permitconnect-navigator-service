import { object, string } from 'yup';

import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator } from '@/validators';

import type { CodeName } from '@/store/codeStore';

export function createProjectIntakeSchema(
  codeList: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>,
  orgBookOptions: Array<string>
) {
  return object({
    [IntakeFormCategory.CONTACTS]: object(contactValidator),
    project: object({
      companyNameRegistered: string()
        .required()
        .max(255)
        .oneOf(orgBookOptions, 'Business name must be a valid value from the list of suggestions')
        .label('Business name'),
      projectName: string().required().max(255).label('Project name'),
      projectType: string().required().max(255).oneOf(codeList.ElectrificationProjectType).label('Project type'),
      bcHydroNumber: string().notRequired().max(255).nullable().label('BC Hydro Call for Power project number'),
      projectDescription: string().when('projectType', {
        is: enums.ElectrificationProjectType.OTHER,
        then: (schema) => schema.required().label('Project description'),
        otherwise: (schema) => schema.notRequired().nullable().label('Project description')
      })
    })
  });
}
