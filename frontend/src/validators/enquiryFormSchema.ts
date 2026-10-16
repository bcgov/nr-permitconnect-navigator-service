import { z } from 'zod';

import { APPLICATION_STATUS_LIST, ENQUIRY_SUBMITTED_METHOD, ENQUIRY_TYPE_LIST } from '@/utils/constants/projectCommon';
import { formSection, maxMessage, oneOfMessage, requiredMessage, requiredString } from '@/utils/zodSchema';
import { assignedToSchema, atsClientIdSchema, toNumber } from '@/validators/common';
import { createContactCardNavFormSchema } from '@/validators/navigator';

import type { CreateSchemaOptions } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

const optionalOneOf = <T extends string>(label: string, values: readonly T[]) =>
  z.enum(values as [T, ...T[]], oneOfMessage(label, values)).optional();

export function createEnquiryFormSchema({ t }: Pick<CreateSchemaOptions, 't'>) {
  return z.looseObject({
    ...createContactCardNavFormSchema({ t }),
    relatedActivityId: z.string().max(255, maxMessage('Related submission', 255)).nullish(),
    enquiryDescription: requiredString('Enquiry detail'),
    addedToAts: z.boolean(requiredMessage('Authorized Tracking System (ATS) updated')),
    atsInfo: formSection(
      z.looseObject({
        atsClientId: atsClientIdSchema(t('validators.atsClientId.label')),
        atsEnquiryId: z.preprocess(toNumber, z.number('ATS enquiry # must be a number').nullish())
      })
    ),
    submissionState: formSection(
      z.looseObject({
        submittedMethod: optionalOneOf('Submitted method', ENQUIRY_SUBMITTED_METHOD),
        submissionType: optionalOneOf('Submission type', ENQUIRY_TYPE_LIST),
        assignedUser: assignedToSchema(t('validators.submissionState.assignedToMsg')),
        enquiryStatus: optionalOneOf('Activity state', APPLICATION_STATUS_LIST)
      })
    )
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createEnquiryFormSchema>>>;
