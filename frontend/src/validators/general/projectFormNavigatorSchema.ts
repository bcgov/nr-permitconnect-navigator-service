import { boolean, number, object, string } from 'yup';

import { YES_NO_LIST } from '@/utils/constants/application';
import {
  AREA_LIST,
  BUSINESS_AREA_LIST,
  CONTACT_PREFERENCE_LIST,
  PROJECT_RELATIONSHIP_LIST,
  REGION_LIST
} from '@/utils/constants/projectCommon';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import { assignedToValidator, atsClientIdValidator, latitudeValidator, longitudeValidator } from '@/validators';
import { emailValidator } from '@/validators/common';
import { Initiative } from '@/utils/enums/application';

import type { InferType } from 'yup';

interface CreateSchemaOptions {
  initiative?: Initiative;
  t: (key: string) => string;
}

function createContactCardNavFormSchema({ t }: CreateSchemaOptions) {
  return {
    contact: object({
      contactId: string(),
      email: emailValidator(t('validators.contactCardNavForm.validContact'))
        .required()
        .label(t('validators.contactCardNavForm.contactEmail')),
      firstName: string().required().max(255).label(t('validators.contactCardNavForm.contactFirstName')),
      lastName: string().max(255).label(t('validators.contactCardNavForm.contactLastName')).nullable(),
      phoneNumber: string().required().label(t('validators.contactCardNavForm.contactPhoneNumber')),
      contactApplicantRelationship: string()
        .required()
        .oneOf(PROJECT_RELATIONSHIP_LIST)
        .label(t('validators.contactCardNavForm.contactApplicantRelationship')),
      contactPreference: string()
        .required()
        .oneOf(CONTACT_PREFERENCE_LIST)
        .label(t('validators.contactCardNavForm.contactPreference')),
      userId: string().notRequired()
    })
  };
}

function createCompanyProjectNamePanelSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    companyProjectName: object({
      activityType: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) => schema.oneOf(['Other']).required().label(t('validators.companyProjectName.activityType')),
        otherwise: (schema) => schema.notRequired()
      }),
      companyIdRegistered: string().nullable(),
      companyNameRegistered: string().max(255).label(t('validators.companyProjectName.companyNameRegistered')),
      isRegisteredInBc: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) =>
          schema.oneOf(YES_NO_LIST).required().label(t('validators.companyProjectName.isRegisteredInBc')),
        otherwise: (schema) => schema.notRequired()
      }),
      projectName: string().required().max(255).label(t('validators.companyProjectName.projectName'))
    })
  };
}

function createLocationPanelSchema({ t }: CreateSchemaOptions) {
  return {
    location: object({
      geomarkUrl: string().notRequired().max(255).label(t('validators.location.geomarkUrl')),
      locality: string().notRequired().max(255).label(t('validators.location.locality')),
      locationAddress: string(),
      locationPids: string().notRequired().max(255).label(t('validators.location.locationPids')),
      latitude: latitudeValidator(t('validators.location.latitude')),
      longitude: longitudeValidator(t('validators.location.longitude')),
      naturalDisaster: string().oneOf(YES_NO_LIST).required().label(t('validators.location.naturalDisaster')),
      province: string().notRequired().max(255).label(t('validators.location.province')),
      streetAddress: string().notRequired().max(255).label(t('validators.location.streetAddress'))
    })
  };
}

function createLocationPidsPanelSchema() {
  return {
    locationPids: object({
      auto: string()
    })
  };
}

function createLocationDescriptionPanelSchema({ t }: CreateSchemaOptions) {
  return {
    locationDescription: object({
      description: string().max(4000).label(t('validators.locationDescription.description'))
    })
  };
}

function createProjectDescriptionPanelSchema({ t }: CreateSchemaOptions) {
  return {
    projectDescription: object({
      description: string().required().label(t('validators.projectDescription.description'))
    })
  };
}

function createAstNotesPanelSchema({ t }: CreateSchemaOptions) {
  return {
    astNotes: object({
      notes: string().max(4000).label(t('validators.astNotes.notes'))
    })
  };
}

function createSubmissionStatePanelSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    submissionState: object({
      applicationStatus: string()
        .required()
        .oneOf(APPLICATION_STATUS_LIST)
        .label(t('validators.submissionState.applicationStatus')),
      area: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) => schema.oneOf(AREA_LIST).label(t('validators.submissionState.area')),
        otherwise: (schema) => schema.notRequired()
      }),
      assignedUser: assignedToValidator(
        t('validators.submissionState.assignedToMsg'),
        t('validators.submissionState.assignedTo')
      ),
      queuePriority: number()
        .required()
        .integer()
        .oneOf(QUEUE_PRIORITY)
        .typeError(t('validators.submissionState.queuePriorityNumber'))
        .label(t('validators.submissionState.queuePriority')),
      region: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) => schema.oneOf(REGION_LIST).label(t('validators.submissionState.region')),
        otherwise: (schema) => schema.notRequired()
      }),
      submissionType: string()
        .required()
        .oneOf(SUBMISSION_TYPE_LIST)
        .label(t('validators.submissionState.submissionType'))
    })
  };
}

function createRelatedEnquiriesPanelSchema({ t }: CreateSchemaOptions) {
  return {
    relatedEnquiries: object({
      csv: string().notRequired().label(t('validators.relatedEnquiries.csv'))
    })
  };
}

function createAtsInfoPanelSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    atsInfo: object({
      atsClientId: atsClientIdValidator(t('validators.atsClientId.label')),
      atsEnquiryId: number().nullable(),
      businessArea: string().when([], {
        is: () => initiative === Initiative.GENERAL,
        then: (schema) => schema.oneOf(BUSINESS_AREA_LIST).label(t('validators.atsInfo.businessArea')),
        otherwise: (schema) => schema.notRequired()
      })
    })
  };
}

function createProjectAreasUpdatedSchema({ initiative, t }: CreateSchemaOptions) {
  return {
    projectAreasUpdated: object({
      aaiUpdated: boolean().required().label(t('validators.projectAreasUpdated.aaiUpdated')),
      addedToAts: boolean().when([], {
        is: () => initiative !== Initiative.GENERAL,
        then: (schema) => schema.required().label(t('validators.projectAreasUpdated.aaiUpdated')),
        otherwise: (schema) => schema.notRequired()
      }),
      ltsaCompleted: boolean().when([], {
        is: () => initiative !== Initiative.GENERAL,
        then: (schema) => schema.required().label(t('validators.projectAreasUpdated.aaiUpdated')),
        otherwise: (schema) => schema.notRequired()
      }),
      bcOnlineCompleted: boolean().when([], {
        is: () => initiative !== Initiative.GENERAL,
        then: (schema) => schema.required().label(t('validators.projectAreasUpdated.bcOnlineCompleted')),
        otherwise: (schema) => schema.notRequired()
      })
    })
  };
}

export function createProjectFormNavigatorSchema({ initiative, t }: CreateSchemaOptions) {
  return object({
    ...createContactCardNavFormSchema({ t }),
    ...createCompanyProjectNamePanelSchema({ initiative, t }),
    ...createLocationPanelSchema({ t }),
    ...createLocationPidsPanelSchema(),
    ...createLocationDescriptionPanelSchema({ t }),
    ...createProjectDescriptionPanelSchema({ t }),
    ...createAstNotesPanelSchema({ t }),
    ...createSubmissionStatePanelSchema({ initiative, t }),
    ...createRelatedEnquiriesPanelSchema({ t }),
    ...createAtsInfoPanelSchema({ initiative, t }),
    ...createProjectAreasUpdatedSchema({ initiative, t })
  });
}

export type FormSchemaType = InferType<ReturnType<typeof createProjectFormNavigatorSchema>>;
