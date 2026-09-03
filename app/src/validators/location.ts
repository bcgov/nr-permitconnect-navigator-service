import { z } from 'zod';

import { YES_NO_LIST } from '#src/utils/constants/application';
import { PROJECT_LOCATION_LIST } from '#src/utils/constants/housing';
import { ProjectLocation } from '#src/utils/enums/housing';

// Shared by createHousingProject/createGeneralProject - both intake forms use the same
// LocationCard.vue component, radio-driven off projectLocation (frontend validators/common.ts).
export const location = z
  .object({
    naturalDisaster: z.enum(YES_NO_LIST as [string, ...string[]]),
    projectLocation: z.enum(PROJECT_LOCATION_LIST as [string, ...string[]]),
    streetAddress: z.string().max(255).nullish(),
    locality: z.string().max(255).nullish(),
    province: z.string().max(255).nullish(),
    latitude: z.number().min(48).max(60).nullish(),
    longitude: z.number().min(-139).max(-114).nullish(),
    ltsaPidLookup: z.string().max(255).nullish(),
    geomarkUrl: z.string().max(255).nullish(),
    geoJson: z.unknown().nullish(),
    projectLocationDescription: z.string().max(4000).nullish()
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.projectLocation === ProjectLocation.STREET_ADDRESS) {
      for (const field of ['streetAddress', 'locality', 'province'] as const) {
        if (!data[field]) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `"${field}" is required` });
        }
      }
    }
    if (data.projectLocation === ProjectLocation.LOCATION_COORDINATES) {
      for (const field of ['latitude', 'longitude'] as const) {
        if (data[field] === undefined || data[field] === null) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `"${field}" is required` });
        }
      }
    }
  });
