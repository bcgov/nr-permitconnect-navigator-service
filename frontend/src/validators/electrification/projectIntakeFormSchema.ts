import { object, string, type InferType } from 'yup';

import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator } from '@/validators';

import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types';

export function createProjectIntakeSchema(
  codeList: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>,
  orgBookOptions: OrgBookOption[]
) {
  return object({
    [IntakeFormCategory.BASIC]: object({
      projectDescription: string().when('$project.projectType', {
        is: enums.ElectrificationProjectType.OTHER,
        then: (schema) => schema.required().label('Project description'),
        otherwise: (schema) => schema.notRequired().nullable().label('Project description')
      }),
      projectName: string().required().max(255).label('Project name'),
      registeredId: string()
        .required()
        .max(255)
        .test('valid-business-id', 'Failed to set the business ID, try selecting the business name again', (value) => {
          if (!value) return false;
          return orgBookOptions.some((option) => option.registeredId === value);
        })
        .label('Business ID'),
      registeredName: string()
        .required()
        .max(255)
        .test('valid-business-name', 'Business name must be a valid value from the list of suggestions', (value) => {
          if (!value) return false;
          return orgBookOptions.some((option) => option.registeredName === value);
        })
        .label('Business name')
    }),
    [IntakeFormCategory.CONTACTS]: object({ ...contactValidator, contactId: string().required() }),
    project: object({
      projectType: string().required().max(255).oneOf(codeList.ElectrificationProjectType).label('Project type'),
      bcHydroNumber: string().notRequired().max(255).label('BC Hydro Call for Power project number')
    })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectIntakeSchema>>;
