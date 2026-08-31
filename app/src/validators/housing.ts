import { z } from 'zod';

import { YES_NO_UNSURE_LIST } from '#src/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '#src/utils/constants/housing';
import { BasicResponse } from '#src/utils/enums/application';

const yesNoUnsure = z.enum(YES_NO_UNSURE_LIST as [string, ...string[]]);
const unitsList = z.enum(NUM_RESIDENTIAL_UNITS_LIST as [string, ...string[]]);

const baseHousing = z.object({
  financiallySupportedBc: yesNoUnsure,
  financiallySupportedIndigenous: yesNoUnsure,
  financiallySupportedNonProfit: yesNoUnsure,
  financiallySupportedHousingCoop: yesNoUnsure,
  hasRentalUnits: yesNoUnsure,
  housingCoopDescription: z.string().max(255).trim().optional(),
  indigenousDescription: z.string().max(255).trim().optional(),
  multiFamilySelected: z.boolean().nullish(),
  multiFamilyUnits: unitsList.optional(),
  nonProfitDescription: z.string().max(255).trim().optional(),
  otherSelected: z.boolean().nullish(),
  otherUnits: unitsList.optional(),
  otherUnitsDescription: z.string().max(255).trim().optional(),
  rentalUnits: unitsList.optional(),
  singleFamilySelected: z.boolean().nullish(),
  singleFamilyUnits: unitsList.optional()
});

type HousingShape = z.infer<typeof baseHousing>;

export const housing = baseHousing.superRefine((data, ctx) => {
  const conditionals: [boolean, keyof HousingShape][] = [
    [data.financiallySupportedHousingCoop === BasicResponse.YES, 'housingCoopDescription'],
    [data.financiallySupportedIndigenous === BasicResponse.YES, 'indigenousDescription'],
    [data.financiallySupportedNonProfit === BasicResponse.YES, 'nonProfitDescription'],
    [data.multiFamilySelected === true, 'multiFamilyUnits'],
    [data.otherSelected === true, 'otherUnits'],
    [data.otherSelected === true, 'otherUnitsDescription'],
    [data.hasRentalUnits === BasicResponse.YES, 'rentalUnits'],
    [data.singleFamilySelected === true, 'singleFamilyUnits']
  ];
  for (const [conditionMet, field] of conditionals) {
    const value = data[field];
    const isEmpty = value === undefined || value === null || value === '';
    if (conditionMet && isEmpty) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `"${field}" is required` });
    } else if (!conditionMet && !isEmpty) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `"${field}" is not allowed` });
    }
  }

  // Joi's .or() is presence-based, not truthiness-based - check key existence, not value
  if (!('singleFamilySelected' in data) && !('multiFamilySelected' in data) && !('otherSelected' in data)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'must contain at least one of singleFamilySelected, multiFamilySelected, otherSelected'
    });
  }
});
