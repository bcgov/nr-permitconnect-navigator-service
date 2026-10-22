import { z } from 'zod';

import { APPLICATION_STATUS_LIST, ENQUIRY_SUBMITTED_METHOD, ENQUIRY_TYPE_LIST } from '@/utils/constants/projectCommon';
import { formSection, maxMessage, missingOrOneOfSchema, requiredMessage, requiredString } from '@/utils/zodSchema';
import { assignedToSchema, atsIdSchema } from '@/validators/common';
import { createContactCardNavFormSchema } from '@/validators/navigator';

import type { CreateSchemaOptions } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

export function createEnquiryFormSchema({ t }: Pick<CreateSchemaOptions, 't'>) {
  return z.looseObject({
    ...createContactCardNavFormSchema({ t }),
    relatedActivityId: z.string().max(255, maxMessage('Related submission', 255)).nullish(),
    enquiryDescription: requiredString('Enquiry detail'),
    addedToAts: z.boolean(requiredMessage('Authorized Tracking System (ATS) updated')),
    atsInfo: formSection(
      z.looseObject({
        atsClientId: atsIdSchema(t('validators.atsClientId.label')),
        atsEnquiryId: atsIdSchema('ATS enquiry #')
      })
    ),
    submissionState: formSection(
      z.looseObject({
        submittedMethod: missingOrOneOfSchema('Submitted method', ENQUIRY_SUBMITTED_METHOD),
        submissionType: missingOrOneOfSchema('Submission type', ENQUIRY_TYPE_LIST),
        assignedUser: assignedToSchema(t('validators.submissionState.assignedToMsg')),
        enquiryStatus: missingOrOneOfSchema('Activity state', APPLICATION_STATUS_LIST)
      })
    )
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createEnquiryFormSchema>>>;
