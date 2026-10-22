import { z } from 'zod';

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
    ...createElectrificationPanelSchema({ codeList, t }),
    ...createCompanyProjectNamePanelSchema({ initiative, t, orgBookOptions }),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ t }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createAtsInfoPanelSchema({ initiative, t, codeList }),
    ...createProjectAreasUpdatedSchema({ initiative, t })
  });
}

export type FormSchemaType = FormValues<z.infer<ReturnType<typeof createProjectFormNavigatorSchema>>>;
