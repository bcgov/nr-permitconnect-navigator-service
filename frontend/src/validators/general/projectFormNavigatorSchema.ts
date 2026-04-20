import { object } from 'yup';

import {
  createAstNotesPanelSchema,
  createAtsInfoPanelSchema,
  createCompanyProjectNamePanelSchema,
  createContactCardNavFormSchema,
  createLocationDescriptionPanelSchema,
  createLocationPanelSchema,
  createLocationPidsPanelSchema,
  createProjectAreasUpdatedSchema,
  createProjectDescriptionPanelSchema,
  createRelatedEnquiriesPanelSchema,
  createSubmissionStatePanelSchema
} from '@/validators/navigator';

import type { InferType } from 'yup';
import type { CreateSchemaOptions } from '@/types';

export function createProjectFormNavigatorSchema({
  initiative,
  t,
  enums,
  codeList,
  orgBookOptions
}: Required<CreateSchemaOptions>) {
  return object({
    ...createContactCardNavFormSchema({ t }),
    ...createCompanyProjectNamePanelSchema({ initiative, t, orgBookOptions }),
    ...createLocationPanelSchema({ t }),
    ...createLocationPidsPanelSchema(),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ initiative, t, enums }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createRelatedEnquiriesPanelSchema({ t }),
    ...createAtsInfoPanelSchema({ initiative, t, codeList }),
    ...createProjectAreasUpdatedSchema({ initiative, t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
