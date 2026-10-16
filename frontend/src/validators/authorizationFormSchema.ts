import { z } from 'zod';

import { PERMIT_NEEDED_LIST, VALID_STATE_STAGES } from '@/utils/constants/permit';
import { PermitStage, PermitState } from '@/utils/enums/codeEnums';
import { PermitNeeded } from '@/utils/enums/permit';
import {
  addIssue,
  coerceNumber,
  dateSchema,
  evenWithIssues,
  isOneOf,
  maxMessage,
  notInFutureSchema,
  requiredMessage,
  requiredOneOf
} from '@/utils/zodSchema';

import type { CreateSchemaOptions, PermitType } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

const PERMIT_STAGE_LIST = Object.values(PermitStage);
const PERMIT_STATE_LIST = Object.values(PermitState);

/**
 * Builds the authorization form schema.
 * @param options - Schema options.
 * @param initial - The stage and state the form opened with; changing either requires a note.
 * @returns The authorization form schema.
 */
export function createAuthorizationFormSchema(
  { t }: Pick<CreateSchemaOptions, 't'>,
  initial?: { stage?: string; state?: string }
) {
  const trackingIdTypeLabel = t('authorization.authorizationForm.trackingIdType');
  const trackingIdLabel = t('authorization.authorizationForm.trackingId');
  const technicalReviewerLabel = t('authorization.authorizationStatusUpdatesCard.technicalReviewer');
  const consultationLabel = (key: string) => t(`authorization.authorizationFirstNationConsultation.${key}`);

  return z
    .looseObject({
      permitNote: z.string().nullish(),
      authorizationType: z
        .custom<PermitType>()
        .refine(
          (value) => typeof value === 'object' && value !== null,
          requiredMessage(t('authorization.authorizationForm.authorizationType'))
        ),
      consultationStartDate: dateSchema(consultationLabel('consultationStartDate')),
      consultationEndDate: dateSchema(consultationLabel('consultationEndDate')),
      needed: requiredOneOf(t('authorization.authorizationForm.needed'), PERMIT_NEEDED_LIST),
      stage: requiredOneOf(t('authorization.common.applicationStage'), PERMIT_STAGE_LIST),
      issuedPermitId: z.string().nullish(),
      permitId: z.string().optional(),
      permitTracking: z
        .array(
          z.looseObject({
            sourceSystemKindId: z.preprocess(
              coerceNumber,
              z.number(`${trackingIdTypeLabel} must be a number`).optional()
            ),
            trackingId: z.string().max(255, maxMessage(trackingIdLabel, 255)).optional(),
            shownToProponent: z.boolean().default(false)
          })
        )
        .optional(),
      state: requiredOneOf(t('authorization.authorizationForm.authorizationStatus'), PERMIT_STATE_LIST),
      submittedDate: notInFutureSchema(t('authorization.common.submittedDate')),
      decisionDate: notInFutureSchema(t('authorization.common.decisionDate')),
      statusLastVerified: notInFutureSchema(t('authorization.authorizationForm.statusLastVerified')),
      statusLastChanged: notInFutureSchema(t('authorization.authorizationForm.statusLastChanged')),
      targetDate: dateSchema(t('authorization.common.targetDate')),
      targetDateDescription: z.string().nullish(),
      technicalReviewer: z.string().max(255, maxMessage(technicalReviewerLabel, 255)).nullish()
    })
    .superRefine((form, ctx) => {
      if ((form.stage !== initial?.stage || form.state !== initial?.state) && !form.permitNote) {
        addIssue(ctx, 'permitNote', t('authorization.authorizationForm.noteRequired'));
      }
      if (
        form.consultationStartDate &&
        form.consultationEndDate &&
        form.consultationEndDate < form.consultationStartDate
      ) {
        addIssue(ctx, 'consultationEndDate', consultationLabel('consultationEndDateInvalid'));
      }
      if (form.needed === PermitNeeded.UNDER_INVESTIGATION && form.state !== PermitState.NONE) {
        addIssue(ctx, 'needed', t('authorization.authorizationForm.neededCondition'));
      }
      if (
        isOneOf(PERMIT_STATE_LIST, form.state) &&
        form.stage !== undefined &&
        !VALID_STATE_STAGES[form.state].includes(form.stage)
      ) {
        addIssue(ctx, 'state', t('authorization.authorizationForm.authStatusConditionInvalid'));
      }
    }, evenWithIssues);
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createAuthorizationFormSchema>>>;
