import { z } from 'zod';

import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import {
  addIssue,
  evenWithIssues,
  formSection,
  maxMessage,
  requiredMessage,
  requiredOneOf,
  requiredString,
  requireText
} from '@/utils/zodSchema';
import {
  locationFormSchema,
  optionalTextSchema,
  permitsFormSchema,
  refineBusinessRegistration,
  requireUnits
} from '@/validators/common';
import { contactFormSchema } from '@/validators/contact';

import type { OrgBookOption } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

export function createProjectIntakeSchema(orgBookOptions: OrgBookOption[]) {
  const basic = z
    .looseObject({
      consentToFeedback: z.boolean(requiredMessage('Consent to feedback')),
      projectApplicantType: requiredOneOf('Project developed', PROJECT_APPLICANT_LIST),
      isDevelopedInBc: z.string().nullish(),
      registeredId: optionalTextSchema('Business ID'),
      registeredName: optionalTextSchema('Business name'),
      projectName: requiredString('Project name').max(255, maxMessage('Project name', 255)),
      projectDescription: requiredString('Project description')
    })
    .superRefine(refineBusinessRegistration(orgBookOptions), evenWithIssues);

  const housing = z
    .looseObject({
      hasRentalUnits: requiredOneOf('Rental units', YES_NO_UNSURE_LIST),
      financiallySupportedBc: requiredOneOf('BC Housing', YES_NO_UNSURE_LIST),
      financiallySupportedIndigenous: requiredOneOf('Indigenous Housing Provider', YES_NO_UNSURE_LIST),
      financiallySupportedNonProfit: requiredOneOf('Non-profit housing society', YES_NO_UNSURE_LIST),
      financiallySupportedHousingCoop: requiredOneOf('Housing co-operative', YES_NO_UNSURE_LIST),
      rentalUnits: z.string().nullish(),
      indigenousDescription: z.string().nullish(),
      nonProfitDescription: z.string().nullish(),
      housingCoopDescription: z.string().nullish(),
      singleFamilySelected: z.boolean().optional(),
      multiFamilySelected: z.boolean().optional(),
      otherSelected: z.boolean().optional(),
      singleFamilyUnits: z.string().nullish(),
      multiFamilyUnits: z.string().nullish(),
      otherUnitsDescription: optionalTextSchema('Description of units'),
      otherUnits: z.string().nullish()
    })
    .superRefine((value, ctx) => {
      if (value.hasRentalUnits === BasicResponse.YES) {
        requireUnits(ctx, 'rentalUnits', 'Expected rental units', value.rentalUnits);
      }
      if (value.financiallySupportedIndigenous === BasicResponse.YES) {
        requireText(ctx, 'indigenousDescription', 'Indigenous housing provider', value.indigenousDescription);
      }
      if (value.financiallySupportedNonProfit === BasicResponse.YES) {
        requireText(ctx, 'nonProfitDescription', 'Non-profit housing society', value.nonProfitDescription);
      }
      if (value.financiallySupportedHousingCoop === BasicResponse.YES) {
        requireText(ctx, 'housingCoopDescription', 'Housing co-operative', value.housingCoopDescription);
      }

      // The section-level issue is the message ResidentialUnitsCard displays; the blank checkbox issues let
      // useFormErrorWatcher match the card's inputs so invalid submits jump to its tab
      if (!value.singleFamilySelected && !value.multiFamilySelected && !value.otherSelected) {
        addIssue(ctx, [], 'At least one residential unit type must be selected');
        for (const key of ['singleFamilySelected', 'multiFamilySelected', 'otherSelected']) addIssue(ctx, key, '\n');
      }
      if (value.singleFamilySelected) {
        requireUnits(ctx, 'singleFamilyUnits', 'Expected number of single-family units', value.singleFamilyUnits);
      }
      if (value.multiFamilySelected) {
        requireUnits(ctx, 'multiFamilyUnits', 'Expected number of multi-family units', value.multiFamilyUnits);
      }
      if (value.otherSelected) {
        if (!value.otherUnitsDescription)
          addIssue(ctx, 'otherUnitsDescription', requiredMessage('Description of units'));
        requireUnits(ctx, 'otherUnits', 'Expected number of other units', value.otherUnits);
      }
    }, evenWithIssues);

  return z.looseObject({
    [IntakeFormCategory.BASIC]: formSection(basic),
    [IntakeFormCategory.CONTACTS]: formSection(contactFormSchema),
    [IntakeFormCategory.HOUSING]: formSection(housing),
    [IntakeFormCategory.LOCATION]: formSection(locationFormSchema),
    [IntakeFormCategory.PERMITS]: formSection(permitsFormSchema)
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createProjectIntakeSchema>>>;
