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
import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types';
import type { Initiative } from '@/utils/enums/application';

interface CreateSchemaOptions {
  initiative: Initiative;
  t: (key: string) => string; // i18n instance
  enums: Record<CodeName, Record<string, string>>;
  orgBookOptions: OrgBookOption[];
}

export function createProjectFormNavigatorSchema({ initiative, t, enums, orgBookOptions }: CreateSchemaOptions) {
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
    ...createAtsInfoPanelSchema({ initiative, t }),
    ...createProjectAreasUpdatedSchema({ initiative, t }),
    ...createConsentPanelSchema({ t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
