import { YES_NO_LIST } from '@/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/projectCommon';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator, locationValidator, permitsValidator } from '@/validators';
import { object, string, type InferType } from 'yup';

import type { OrgBookOption } from '@/types';

export function createProjectIntakeSchema(orgBookOptions: OrgBookOption[]) {
  return object({
    [IntakeFormCategory.CONTACTS]: object({ ...contactValidator, contactId: string().required() }),
    [IntakeFormCategory.BASIC]: object({
      projectApplicantType: string().required().oneOf(PROJECT_APPLICANT_LIST).label('Project developed'),
      isDevelopedInBc: string().when('projectApplicantType', {
        is: (value: string) => value === ProjectApplicant.BUSINESS,
        then: (schema) => schema.required().oneOf(YES_NO_LIST).label('Registered in BC'),
        otherwise: (schema) => schema.notRequired().nullable().label('Registered in BC')
      }),
      registeredId: string().when('isDevelopedInBc', {
        is: (value: string) => value === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .test(
              'valid-business-id',
              'Failed to set the business ID, try selecting the business name again',
              (value) => {
                if (!value) return false;
                return orgBookOptions.some((option) => option.registeredId === value);
              }
            )
            .label('Business ID'),
        otherwise: (schema) => schema.notRequired().nullable().label('Business ID')
      }),
      registeredName: string().when('isDevelopedInBc', {
        is: (value: string) => value === BasicResponse.YES,
        then: (schema) =>
          schema
            .required()
            .max(255)
            .test(
              'valid-business-name',
              'Business name must be a valid value from the list of suggestions',
              (value) => {
                if (!value) return false;
                return orgBookOptions.some((option) => option.registeredName === value);
              }
            )
            .label('Business name'),
        otherwise: (schema) => schema.notRequired().nullable().label('Business name')
      }),
      projectName: string().required().max(255).label('Project name'),
      projectDescription: string().required().label('Project description')
    }),
    [IntakeFormCategory.LOCATION]: locationValidator,
    [IntakeFormCategory.PERMITS]: permitsValidator
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectIntakeSchema>>;
