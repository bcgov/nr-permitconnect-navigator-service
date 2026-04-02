import { object } from 'yup';

import type { InferType } from 'yup';
import type { Initiative } from '@/utils/enums/application';
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

interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string; // i18n instance
}

export function createProjectFormNavigatorSchema({ initiative, t }: CreateSchemaOptions) {
  return object({
    ...createContactCardNavFormSchema({ t }),
    ...createCompanyProjectNamePanelSchema({ initiative, t }),
    ...createLocationPanelSchema({ t }),
    ...createResidentialUnitsSchema({ t }),
    ...createFinanciallySupportedPanelSchema({ t }),
    ...createLocationPidsPanelSchema(),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ t }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createRelatedEnquiriesPanelSchema({ t }),
    ...createAtsInfoPanelSchema({ initiative, t }),
    ...createProjectAreasUpdatedSchema({ initiative, t }),
    ...createConsentPanelSchema({ t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
