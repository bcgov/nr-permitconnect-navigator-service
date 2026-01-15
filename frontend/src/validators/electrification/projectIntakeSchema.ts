import { object, string } from 'yup';

import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator } from '@/validators';

import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types';

export function createProjectIntakeSchema(
  codeList: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>,
  orgBookOptions: Array<OrgBookOption>
) {
  return object({
    [IntakeFormCategory.CONTACTS]: object(contactValidator),
    project: object({
      companyNameRegistered: string()
        .required()
        .max(255)
        .test('valid-business-name', 'Business name must be a valid value from the list of suggestions', (value) => {
          if (!value) return false;
          return orgBookOptions.some((option) => option.registeredName === value);
        })
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
