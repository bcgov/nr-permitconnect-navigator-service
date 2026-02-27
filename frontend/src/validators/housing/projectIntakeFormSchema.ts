import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/projectCommon';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { contactValidator, locationValidator, permitsValidator } from '@/validators';
import { boolean, object, string, type InferType } from 'yup';

import type { OrgBookOption } from '@/types';

const YesNoUnsureSchema = string().required().oneOf(YES_NO_UNSURE_LIST);

export function createProjectIntakeSchema(orgBookOptions: OrgBookOption[]) {
  return object({
    [IntakeFormCategory.BASIC]: object({
      consentToFeedback: boolean().required().label('Consent to feedback'),
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
    [IntakeFormCategory.CONTACTS]: object({ ...contactValidator, contactId: string().required() }),
    [IntakeFormCategory.HOUSING]: object().shape(
      {
        hasRentalUnits: YesNoUnsureSchema.label('Rental units'),
        financiallySupportedBc: YesNoUnsureSchema.label('BC Housing'),
        financiallySupportedIndigenous: YesNoUnsureSchema.label('Indigenous Housing Provider'),
        financiallySupportedNonProfit: YesNoUnsureSchema.label('Non-profit housing society'),
        financiallySupportedHousingCoop: YesNoUnsureSchema.label('Housing co-operative'),
        rentalUnits: string().when('hasRentalUnits', {
          is: (value: string) => value === BasicResponse.YES,
          then: () => string().oneOf(NUM_RESIDENTIAL_UNITS_LIST).required().label('Expected rental units'),
          otherwise: () => string().nullable()
        }),
        indigenousDescription: string().when('financiallySupportedIndigenous', {
          is: (value: string) => value === BasicResponse.YES,
          then: () => string().required().max(255).label('Indigenous housing provider'),
          otherwise: () => string().nullable()
        }),
        nonProfitDescription: string().when('financiallySupportedNonProfit', {
          is: (value: string) => value === BasicResponse.YES,
          then: () => string().required().max(255).label('Non-profit housing society'),
          otherwise: () => string().nullable()
        }),
        housingCoopDescription: string().when('financiallySupportedHousingCoop', {
          is: (value: string) => value === BasicResponse.YES,
          then: () => string().required().max(255).label('Housing co-operative'),
          otherwise: () => string().nullable()
        }),
        singleFamilySelected: boolean().when(['multiFamilySelected', 'otherSelected'], {
          is: (multi: boolean, other: boolean) => !(multi || other),
          then: (schema) => {
            return schema.test('housing-checkbox-test', '\n', function (value) {
              if (value) return true;
              else return false;
            });
          },
          otherwise: (schema) => schema.notRequired()
        }),
        singleFamilyUnits: string().when('singleFamilySelected', {
          is: (value: boolean) => value,
          then: (schema) =>
            schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Expected number of single-family units'),
          otherwise: () => string().nullable()
        }),
        multiFamilySelected: boolean().when(['singleFamilySelected', 'otherSelected'], {
          is: (single: boolean, other: boolean) => !(single || other),
          then: (schema) => {
            return schema.test('housing-checkbox-test', '\n', function (value) {
              if (value) return true;
              else return false;
            });
          },
          otherwise: (schema) => schema.notRequired()
        }),
        multiFamilyUnits: string().when('multiFamilySelected', {
          is: (value: boolean) => value,
          then: (schema) =>
            schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Expected number of multi-family units'),
          otherwise: () => string().nullable()
        }),
        otherSelected: boolean().when(['singleFamilySelected', 'multiFamilySelected'], {
          is: (single: boolean, multi: boolean) => !(single || multi),
          then: (schema) => {
            return schema.test('housing-checkbox-test', '\n', function (value) {
              if (value) return true;
              else return false;
            });
          },
          otherwise: (schema) => schema.notRequired()
        }),
        otherUnitsDescription: string().when('otherSelected', {
          is: (value: boolean) => value,
          then: (schema) => schema.required().label('Description of units'),
          otherwise: () => string().nullable()
        }),
        otherUnits: string().when('otherSelected', {
          is: (value: boolean) => value,
          then: (schema) => schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Expected number of other units'),
          otherwise: () => string().nullable()
        })
      },
      [
        ['multiFamilySelected', 'otherSelected'],
        ['singleFamilySelected', 'otherSelected'],
        ['singleFamilySelected', 'multiFamilySelected']
      ]
    ),
    [IntakeFormCategory.LOCATION]: locationValidator,
    [IntakeFormCategory.PERMITS]: permitsValidator
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectIntakeSchema>>;
