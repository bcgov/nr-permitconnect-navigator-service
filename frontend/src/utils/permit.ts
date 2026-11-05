import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { PermitStage } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';
import { toOneOf } from '@/utils/utils';

import type { z } from 'zod';
import type { Permit } from '@/types';
import type { FormValues } from '@/utils/zodSchema';
import type { permitsFormSchema } from '@/validators/common';

type PermitsFormValues = FormValues<z.output<typeof permitsFormSchema>>;

/**
 * Builds the permits section of an intake submit payload.
 * @param permits - The parsed permits section of the form.
 * @returns The permits section of the payload.
 */
export const toPermitsPayload = (permits: PermitsFormValues) => ({
  appliedPermits: permits.appliedPermits?.map((x) => ({
    submittedDate: x.submittedDate?.toISOString(),
    permitTracking: [{ trackingId: x.permitTracking?.[0]?.trackingId }],
    permitTypeId: x.permitTypeId
  })),
  hasAppliedProvincialPermits: permits.hasAppliedProvincialPermits,
  investigatePermits: permits.investigatePermits
});

/**
 * Restores the permits section of a saved draft, turning its JSON dates back into Dates.
 * @param permits - The draft's permits section, missing on drafts saved before the form had one.
 * @returns The permits form values.
 */
export const draftToPermitsFormValues = (permits: PermitsFormValues | undefined) => ({
  ...permits,
  appliedPermits:
    permits?.appliedPermits?.map((x) => ({
      permitTypeId: x.permitTypeId,
      permitTracking: [{ trackingId: x.permitTracking?.[0]?.trackingId }],
      submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined
    })) ?? []
});

/**
 * Builds the permits form values for an existing project.
 * @param hasAppliedProvincialPermits - The project's saved answer.
 * @param permits - The project's permits.
 * @returns The permits form values.
 */
export const projectToPermitsFormValues = (hasAppliedProvincialPermits: string | null, permits: Permit[]) => ({
  appliedPermits: permits
    .filter((x) => x.stage === PermitStage.APPLICATION_SUBMISSION)
    .map((x) => ({ ...x, submittedDate: x.submittedDate ? new Date(x.submittedDate) : undefined })),
  hasAppliedProvincialPermits: toOneOf(YES_NO_UNSURE_LIST, hasAppliedProvincialPermits),
  investigatePermits: permits.filter((x) => x.needed === PermitNeeded.UNDER_INVESTIGATION)
});
