import { z } from 'zod';

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
} from '@/validators/navigatorPanels';

import type { CreateSchemaOptions } from '@/types';
import type { FormValues } from '@/utils/zodSchema';

export function createProjectFormNavigatorSchema({
  initiative,
  t,
  codeList,
  orgBookOptions
}: Required<CreateSchemaOptions>) {
  return z.looseObject({
    ...createContactCardNavFormSchema({ t }),
    ...createCompanyProjectNamePanelSchema({ initiative, t, orgBookOptions }),
    ...createLocationPanelSchema({ t }),
    ...createResidentialUnitsSchema({ t }),
    ...createFinanciallySupportedPanelSchema({ t }),
    ...createLocationPidsPanelSchema(),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ initiative, t }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createRelatedEnquiriesPanelSchema(),
    ...createAtsInfoPanelSchema({ initiative, t, codeList }),
    ...createProjectAreasUpdatedSchema({ initiative, t }),
    ...createConsentPanelSchema({ t })
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createProjectFormNavigatorSchema>>>;
