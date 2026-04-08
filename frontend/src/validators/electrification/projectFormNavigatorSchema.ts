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
import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types';
import type { Initiative } from '@/utils/enums/application';

interface CreateSchemaOptions {
  initiative: Initiative;
  t: (key: string) => string; // i18n instance
  codeList: Record<CodeName, string[]>;
  enums: Record<CodeName, Record<string, string>>;
  orgBookOptions: OrgBookOption[];
}

export function createProjectFormNavigatorSchema({
  initiative,
  t,
  codeList,
  enums,
  orgBookOptions
}: CreateSchemaOptions) {
  return object({
    ...createContactCardNavFormSchema({ t }),
    ...createElectrificationPanelSchema({ t, codeList }),
    ...createCompanyProjectNamePanelSchema({ initiative, t, orgBookOptions }),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ initiative, t, enums }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createAtsInfoPanelSchema({ initiative, t }),
    ...createProjectAreasUpdatedSchema({ initiative, t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
