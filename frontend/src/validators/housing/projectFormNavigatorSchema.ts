import { object } from 'yup';

import {
  createAstNotesPanelSchema,
  createAtsInfoPanelSchema,
  createCompanyProjectNamePanelSchema,
  createConsentPanelSchema,
  createContactCardNavFormSchema,
  createFinanciallySupportedPanelSchema,
  createLocationDescriptionPanelSchema,
  createLocationPanelSchema,
  createLocationPidsPanelSchema,
  createProjectAreasUpdatedSchema,
  createProjectDescriptionPanelSchema,
  createRelatedEnquiriesPanelSchema,
  createResidentialUnitsSchema,
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
    ...createResidentialUnitsSchema({ t }),
    ...createFinanciallySupportedPanelSchema({ t }),
    ...createLocationPidsPanelSchema(),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ initiative, t, enums }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createRelatedEnquiriesPanelSchema({ t }),
    ...createAtsInfoPanelSchema({ initiative, t, codeList }),
    ...createProjectAreasUpdatedSchema({ initiative, t }),
    ...createConsentPanelSchema({ t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
