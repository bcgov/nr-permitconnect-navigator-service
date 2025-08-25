import { v4 as uuidv4 } from 'uuid';

import { PrismaTransactionClient } from '../db/dataConnection';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import {
  generateCreateStamps,
  generateNullUpdateStamps,
  generateUpdateStamps,
  jsonToPrismaInputJson
} from '../db/utils/utils';
import { createActivity, deleteActivity } from '../services/activity';
import { upsertContacts } from '../services/contact';
import { createDraft, deleteDraft, getDraft, getDrafts, updateDraft } from '../services/draft';
import { email } from '../services/email';
import {
  createHousingProject,
  getHousingProject,
  getHousingProjects,
  getHousingProjectStatistics,
  searchHousingProjects,
  updateHousingProject
} from '../services/housingProject';
import { upsertPermit } from '../services/permit';
import { upsertPermitTracking } from '../services/permitTracking';
import { BasicResponse, Initiative } from '../utils/enums/application';
import { NumResidentialUnits } from '../utils/enums/housing';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '../utils/enums/permit';
import { ApplicationStatus, DraftCode, IntakeStatus, SubmissionType } from '../utils/enums/projectCommon';
import { Problem } from '../utils';
import { getCurrentUsername, isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type {
  CurrentContext,
  Draft,
  Email,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  HousingProjectStatistics,
  Permit,
  StatisticsFilters
} from '../types';

/**
 * @function assignPriority
 * Assigns a priority level to a housing project based on given criteria
 * Criteria defined below
 */
export const assignPriority = (housingProject: Partial<HousingProject>) => {
  const matchesPriorityOneCriteria = // Priority 1 Criteria:
    // 1. More than 50 units (any)
    housingProject.singleFamilyUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
    housingProject.singleFamilyUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
    housingProject.multiFamilyUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
    housingProject.multiFamilyUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
    housingProject.otherUnits === NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED ||
    housingProject.otherUnits === NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED ||
    // 2. Supports Rental Units
    housingProject.hasRentalUnits === 'Yes' ||
    // 3. Social Housing
    housingProject.financiallySupportedBc === 'Yes' ||
    // 4. Indigenous Led
    housingProject.financiallySupportedIndigenous === 'Yes';

  const matchesPriorityTwoCriteria = // Priority 2 Criteria:
    // 1. Single Family >= 10 Units
    housingProject.singleFamilyUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE ||
    // 2. Has 1 or more MultiFamily Units
    housingProject.multiFamilyUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE ||
    housingProject.multiFamilyUnits === NumResidentialUnits.ONE_TO_NINE ||
    // 3. Has 1 or more Other Units
    housingProject.otherUnits === NumResidentialUnits.TEN_TO_FOURTY_NINE ||
    housingProject.otherUnits === NumResidentialUnits.ONE_TO_NINE;

  if (matchesPriorityOneCriteria) {
    housingProject.queuePriority = 1;
  } else if (matchesPriorityTwoCriteria) {
    housingProject.queuePriority = 2;
  } else {
    // Prioriy 3 Criteria:
    housingProject.queuePriority = 3; // Everything Else
  }
};

const generateHousingProjectData = async (
  tx: PrismaTransactionClient,
  data: HousingProjectIntake,
  currentContext: CurrentContext
) => {
  const activityId =
    data.activityId ?? (await createActivity(tx, Initiative.HOUSING, generateCreateStamps(currentContext)))?.activityId;

  let basic, housing, location, permits;
  let appliedPermits: Array<Permit> = [],
    investigatePermits: Array<Permit> = [];

  if (data.basic) {
    basic = {
      consentToFeedback: data.basic.consentToFeedback ?? false,
      projectApplicantType: data.basic.projectApplicantType,
      isDevelopedInBc: data.basic.isDevelopedInBc,
      companyNameRegistered: data.basic.registeredName
    };
  }

  if (data.housing) {
    housing = {
      projectName: data.housing.projectName,
      projectDescription: data.housing.projectDescription,
      singleFamilyUnits: data.housing.singleFamilyUnits,
      multiFamilyUnits: data.housing.multiFamilyUnits,
      otherUnitsDescription: data.housing.otherUnitsDescription,
      otherUnits: data.housing.otherUnits,
      hasRentalUnits: data.housing.hasRentalUnits,
      financiallySupportedBc: data.housing.financiallySupportedBc,
      financiallySupportedIndigenous: data.housing.financiallySupportedIndigenous,
      financiallySupportedNonProfit: data.housing.financiallySupportedNonProfit,
      financiallySupportedHousingCoop: data.housing.financiallySupportedHousingCoop,
      rentalUnits: data.housing.rentalUnits,
      indigenousDescription: data.housing.indigenousDescription,
      nonProfitDescription: data.housing.nonProfitDescription,
      housingCoopDescription: data.housing.housingCoopDescription
    };
  }

  if (data.location) {
    location = {
      naturalDisaster: data.location.naturalDisaster === BasicResponse.YES ? true : false,
      projectLocation: data.location.projectLocation,
      projectLocationDescription: data.location.projectLocationDescription,
      geomarkUrl: data.location.geomarkUrl,
      geoJson: jsonToPrismaInputJson(data.location.geoJson),
      locationPids: data.location.ltsaPidLookup,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      streetAddress: data.location.streetAddress,
      locality: data.location.locality,
      province: data.location.province
    };
  }

  if (data.permits) {
    permits = {
      hasAppliedProvincialPermits: data.permits.hasAppliedProvincialPermits
    };
  }

  if (data.appliedPermits && data.appliedPermits.length) {
    appliedPermits = data.appliedPermits.map((x: Permit) => ({
      permitId: x.permitId ?? uuidv4(),
      permitTypeId: x.permitTypeId,
      activityId: activityId as string,
      status: PermitStatus.APPLIED,
      needed: PermitNeeded.YES,
      statusLastVerified: null,
      issuedPermitId: null,
      authStatus: PermitAuthorizationStatus.IN_REVIEW,
      submittedDate: x.submittedDate,
      adjudicationDate: null,
      permitTracking: x.permitTracking,
      createdAt: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null
    }));
  }

  if (data.investigatePermits && data.investigatePermits.length) {
    investigatePermits = data.investigatePermits.map((x: Permit) => ({
      permitId: x.permitId ?? uuidv4(),
      permitTypeId: x.permitTypeId as number,
      activityId: activityId as string,
      status: PermitStatus.NEW,
      needed: PermitNeeded.UNDER_INVESTIGATION,
      statusLastVerified: null,
      issuedPermitId: null,
      authStatus: PermitAuthorizationStatus.NONE,
      submittedDate: null,
      adjudicationDate: null,
      createdAt: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null
    }));
  }

  // Put new housing project together
  const housingProjectData = {
    housingProject: {
      ...basic,
      ...housing,
      ...location,
      ...permits,
      housingProjectId: uuidv4(),
      activityId: activityId,
      submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
      submittedBy: getCurrentUsername(currentContext),
      intakeStatus: IntakeStatus.SUBMITTED,
      applicationStatus: data.applicationStatus ?? ApplicationStatus.NEW,
      submissionType: data?.submissionType ?? SubmissionType.GUIDANCE,
      createdAt: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
      aaiUpdated: false,
      assignedUserId: null,
      locationPids: null,
      queuePriority: null,
      relatedPermits: null,
      astNotes: null,
      astUpdated: false,
      addedToAts: false,
      atsClientId: null,
      ltsaCompleted: false,
      bcOnlineCompleted: false,
      financiallySupported: false,
      waitingOn: null,
      checkProvincialPermits: null,
      atsEnquiryId: null
    } as HousingProject,
    appliedPermits,
    investigatePermits
  };

  assignPriority(housingProjectData.housingProject);

  return housingProjectData;
};

/**
 * @function emailConfirmation
 * Send an email with the confirmation of housing project
 */
export const emailHousingProjectConfirmationController = async (req: Request<never, never, Email>, res: Response) => {
  const { data, status } = await email(req.body);
  res.status(status).json(data);
};

export const getHousingProjectActivityIdsController = async (req: Request, res: Response) => {
  let response = await transactionWrapper<HousingProject[]>(async (tx: PrismaTransactionClient) => {
    return await getHousingProjects(tx);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter(
      (x) => x?.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response.map((x) => x.activityId));
};

export const createHousingProjectController = async (
  req: Request<never, never, HousingProjectIntake>,
  res: Response
) => {
  // TODO: Remove when create PUT calls get switched to POST
  if (req.body === undefined) req.body = {} as HousingProjectIntake;
  const result = await transactionWrapper<HousingProject>(async (tx: PrismaTransactionClient) => {
    const { housingProject, appliedPermits, investigatePermits } = await generateHousingProjectData(
      tx,
      req.body,
      req.currentContext
    );
    // Create new housing project
    const data = await createHousingProject(tx, {
      ...housingProject,
      ...generateCreateStamps(req.currentContext)
    });

    // Create each permit and tracking IDs
    await Promise.all(
      appliedPermits.map(async (p: Permit) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { permitTracking, ...rest } = p;
        await upsertPermit(tx, rest);
      })
    );
    await Promise.all(investigatePermits.map(async (p: Permit) => await upsertPermit(tx, p)));
    await Promise.all(
      appliedPermits
        .filter((p: Permit) => !!p.permitTracking)
        .map(async (p: Permit) => await upsertPermitTracking(tx, p))
    );

    return data;
  });

  res.status(201).json(result);
};

export const deleteHousingProjectController = async (req: Request<{ housingProjectId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const project = await getHousingProject(tx, req.params.housingProjectId);
    await deleteActivity(tx, project.activityId, generateUpdateStamps(req.currentContext));
  });

  res.status(204).end();
};

export const deleteHousingProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    await deleteDraft(tx, req.params.draftId);
  });
  res.status(204).end();
};

export const getHousingProjectDraftController = async (req: Request<{ draftId: string }>, res: Response) => {
  const response = await transactionWrapper<Draft>(async (tx: PrismaTransactionClient) => {
    return await getDraft(tx, req.params.draftId);
  });
  res.status(200).json(response);
};

export const getHousingProjectDraftsController = async (req: Request, res: Response) => {
  let response = await transactionWrapper<Draft[]>(async (tx: PrismaTransactionClient) => {
    return await getDrafts(tx, DraftCode.HOUSING_PROJECT);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter((x: Draft) => x?.createdBy === req.currentContext.userId);
  }

  res.status(200).json(response);
};

export const getHousingProjectStatisticsController = async (
  req: Request<never, never, never, StatisticsFilters>,
  res: Response
) => {
  const response = await transactionWrapper<HousingProjectStatistics[]>(async (tx: PrismaTransactionClient) => {
    return await getHousingProjectStatistics(tx, req.query);
  });
  res.status(200).json(response[0]);
};

export const getHousingProjectController = async (req: Request<{ housingProjectId: string }>, res: Response) => {
  const response = await transactionWrapper<HousingProject>(async (tx: PrismaTransactionClient) => {
    return await getHousingProject(tx, req.params.housingProjectId);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    if (response?.submittedBy.toUpperCase() !== getCurrentUsername(req.currentContext)?.toUpperCase()) {
      throw new Problem(403);
    }
  }

  res.status(200).json(response);
};

export const getHousingProjectsController = async (req: Request, res: Response) => {
  let response = await transactionWrapper<HousingProject[]>(async (tx: PrismaTransactionClient) => {
    return await getHousingProjects(tx);
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter(
      (x) => x.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response);
};

export const searchHousingProjectsController = async (
  req: Request<never, never, never, HousingProjectSearchParameters>,
  res: Response
) => {
  let response = await transactionWrapper<HousingProject[]>(async (tx: PrismaTransactionClient) => {
    return await searchHousingProjects(tx, {
      ...req.query,
      includeUser: isTruthy(req.query.includeUser)
    });
  });

  if (req.currentAuthorization?.attributes.includes('scope:self')) {
    response = response.filter(
      (x) => x.submittedBy.toUpperCase() === getCurrentUsername(req.currentContext)?.toUpperCase()
    );
  }

  res.status(200).json(response);
};

export const submitHousingProjectDraftController = async (
  req: Request<never, never, HousingProjectIntake>,
  res: Response
) => {
  const result = await transactionWrapper<HousingProject>(async (tx: PrismaTransactionClient) => {
    const { housingProject, appliedPermits, investigatePermits } = await generateHousingProjectData(
      tx,
      req.body,
      req.currentContext
    );

    // Create contacts
    if (req.body.contacts) await upsertContacts(tx, req.body.contacts);

    // Create new housing project
    const data = await createHousingProject(tx, {
      ...housingProject,
      ...generateCreateStamps(req.currentContext)
    });

    // Create each permit and tracking IDs
    await Promise.all(
      appliedPermits.map(async (p: Permit) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { permitTracking, ...rest } = p;
        await upsertPermit(tx, rest);
      })
    );
    await Promise.all(investigatePermits.map(async (p: Permit) => await upsertPermit(tx, p)));
    await Promise.all(
      appliedPermits
        .filter((p: Permit) => !!p.permitTracking)
        .map(async (p: Permit) => await upsertPermitTracking(tx, p))
    );

    // Delete old draft
    if (req.body.draftId) await deleteDraft(tx, req.body.draftId);

    return data;
  });

  res.status(201).json({ activityId: result.activityId, housingProjectId: result.housingProjectId });
};

export const updateHousingProjectDraftController = async (req: Request<never, never, Draft>, res: Response) => {
  const update = req.body.draftId && req.body.activityId;

  const response = await transactionWrapper<Draft>(async (tx: PrismaTransactionClient) => {
    if (update) {
      // Update draft
      return await updateDraft(tx, {
        ...req.body,
        ...generateUpdateStamps(req.currentContext)
      });
    } else {
      // Create new draft
      const activityId = (await createActivity(tx, Initiative.HOUSING, generateCreateStamps(req.currentContext)))
        ?.activityId;

      return await createDraft(tx, {
        draftId: uuidv4(),
        activityId: activityId,
        draftCode: DraftCode.HOUSING_PROJECT,
        data: req.body.data,
        ...generateCreateStamps(req.currentContext),
        ...generateNullUpdateStamps()
      });
    }
  });

  res.status(update ? 200 : 201).json({ draftId: response?.draftId, activityId: response?.activityId });
};

export const updateHousingProjectController = async (req: Request<never, never, HousingProject>, res: Response) => {
  const response = await transactionWrapper<HousingProject>(async (tx: PrismaTransactionClient) => {
    return await updateHousingProject(tx, {
      ...req.body,
      ...generateUpdateStamps(req.currentContext)
    });
  });

  res.status(200).json(response);
};
