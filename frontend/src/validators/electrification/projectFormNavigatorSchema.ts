import { object } from 'yup';

import {
  createAstNotesPanelSchema,
  createAtsInfoPanelSchema,
  createCompanyProjectNamePanelSchema,
  createContactCardNavFormSchema,
  createElectrificationPanelSchema,
  createLocationDescriptionPanelSchema,
  createProjectAreasUpdatedSchema,
  createProjectDescriptionPanelSchema,
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
    ...createElectrificationPanelSchema({ codeList }),
    ...createCompanyProjectNamePanelSchema({ initiative, t, orgBookOptions }),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ initiative, t, enums }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createAtsInfoPanelSchema({ initiative, t, codeList }),
    ...createProjectAreasUpdatedSchema({ initiative, t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
