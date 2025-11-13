import {
  assignPriority,
  createHousingProjectController,
  deleteHousingProjectController,
  deleteHousingProjectDraftController,
  emailHousingProjectConfirmationController,
  getHousingProjectActivityIdsController,
  getHousingProjectController,
  getHousingProjectDraftController,
  getHousingProjectDraftsController,
  getHousingProjectsController,
  getHousingProjectStatisticsController,
  searchHousingProjectsController,
  submitHousingProjectDraftController,
  updateHousingProjectController,
  upsertHousingProjectDraftController
} from '../../../src/controllers/housingProject';
import * as activityService from '../../../src/services/activity';
import * as activityContactService from '../../../src/services/activityContact';
import * as contactService from '../../../src/services/contact';
import * as draftService from '../../../src/services/draft';
import * as emailService from '../../../src/services/email';
import * as enquiryService from '../../../src/services/enquiry';
import * as housingProjectService from '../../../src/services/housingProject';
import * as permitService from '../../../src/services/permit';
import * as permitTrackingService from '../../../src/services/permitTracking';
import { ActivityContactRole, DraftCode } from '../../../src/utils/enums/projectCommon';
import { Initiative } from '../../../src/utils/enums/application';
import { uuidv4Pattern } from '../../../src/utils/regexp';

import type { Request, Response } from 'express';
import type {
  ActivityContact,
  Draft,
  Email,
  HousingProject,
  HousingProjectIntake,
  HousingProjectSearchParameters,
  HousingProjectStatistics,
  StatisticsFilters
} from '../../../src/types';
import {
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_HOUSING_ACTIVITY,
  TEST_HOUSING_DRAFT,
  TEST_HOUSING_PROJECT_1,
  TEST_HOUSING_PROJECT_CREATE,
  TEST_HOUSING_PROJECT_INTAKE,
  TEST_IDIR_USER_1,
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_3
} from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import * as utils from '../../../src/utils/utils';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock };
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  /*
   * Must use clearAllMocks when using the mocked config
   * resetAllMocks seems to cause strange issues such as
   * functions not calling as expected
   */
  jest.clearAllMocks();
});

describe('assignPriority', () => {
  it('assigns priority 1 when housing project matches priority 1 criteria - 50 to 500 units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '50-500',
      hasRentalUnits: 'No',
      financiallySupportedBc: 'No',
      financiallySupportedIndigenous: 'No'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - over 500 units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '>500',
      hasRentalUnits: 'No',
      financiallySupportedBc: 'No',
      financiallySupportedIndigenous: 'No'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - Has Rental Units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'Yes',
      financiallySupportedBc: 'No',
      financiallySupportedIndigenous: 'No'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - Social Housing', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBc: 'Yes',
      financiallySupportedIndigenous: 'No'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - Indigenous Led', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBc: 'No',
      financiallySupportedIndigenous: 'Yes'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 and priority 2 criteria', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '10-49',
      hasRentalUnits: 'Yes',
      financiallySupportedBc: 'No',
      financiallySupportedIndigenous: 'Yes',
      multiFamilyUnits: '1-9',
      otherUnits: ''
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 2 when housing project matches priority 2 criteria - 10-49 single family units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '10-49'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(2);
  });

  it('assigns priority 2 if only multiFamilyUnits is provided', () => {
    const housingProject: Partial<HousingProject> = {
      multiFamilyUnits: '1-9'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(2);
  });

  it('assigns priority 2 if only otherUnits is provided', () => {
    const housingProject: Partial<HousingProject> = {
      otherUnits: '1-9'
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(2);
  });

  it('assigns priority 3 when housing project matches neither priority 1 nor priority 2 criteria', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBc: 'No',
      financiallySupportedIndigenous: 'No',
      multiFamilyUnits: '',
      otherUnits: ''
    };

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(3);
  });

  it('assigns priority 3 if no criteria are met/given', () => {
    const housingProject: Partial<HousingProject> = {};

    assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(3);
  });
});

describe('createHousingProjectController', () => {
  const upsertPermitSpy = jest.spyOn(permitService, 'upsertPermit');
  const upsertPermitTrackingSpy = jest.spyOn(permitTrackingService, 'upsertPermitTracking');
  const createHousingProjectSpy = jest.spyOn(housingProjectService, 'createHousingProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');
  const getCurrentUsernameSpy = jest.spyOn(utils, 'getCurrentUsername');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_HOUSING_PROJECT_INTAKE },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_HOUSING_ACTIVITY);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_HOUSING_ACTIVITY.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    createHousingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_CREATE);
    upsertPermitTrackingSpy.mockResolvedValue([]);
    getCurrentUsernameSpy.mockReturnValue(TEST_IDIR_USER_1.fullName as string);

    await createHousingProjectController(
      req as unknown as Request<never, never, HousingProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING, {
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: [TEST_CURRENT_CONTEXT.userId]
    });
    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_HOUSING_ACTIVITY.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_HOUSING_PROJECT_CREATE,
      housingProjectId: expect.stringMatching(uuidv4Pattern),
      submittedAt: expect.any(Date),
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_HOUSING_PROJECT_1,
      housingProjectId: expect.stringMatching(uuidv4Pattern),
      submittedAt: expect.any(Date),
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
  });

  it('creates permits if they exist', async () => {
    const req = {
      body: {
        appliedPermits: [TEST_PERMIT_1, TEST_PERMIT_2],
        investigatePermits: [TEST_PERMIT_3]
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_HOUSING_ACTIVITY);
    createHousingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_CREATE);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_1);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_2);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_3);
    upsertPermitTrackingSpy.mockResolvedValue([]);

    await createHousingProjectController(
      req as unknown as Request<never, never, HousingProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);

    expect(upsertPermitSpy).toHaveBeenCalledTimes(3);
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(1, prismaTxMock, {
      ...TEST_PERMIT_1,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(2, prismaTxMock, {
      ...TEST_PERMIT_2,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(3, prismaTxMock, {
      ...TEST_PERMIT_3,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(0);
  });
});

describe('deleteHousingProjectController', () => {
  const getHousingProjectSpy = jest.spyOn(housingProjectService, 'getHousingProject');
  const deleteHousingProjectSpy = jest.spyOn(housingProjectService, 'deleteHousingProject');
  const deleteActivitySpy = jest.spyOn(activityService, 'deleteActivity');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getHousingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1);
    deleteActivitySpy.mockResolvedValue();

    await deleteHousingProjectController(
      req as unknown as Request<{ housingProjectId: string }>,
      res as unknown as Response
    );

    expect(getHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(getHousingProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.housingProjectId);
    expect(deleteHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(deleteHousingProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.housingProjectId, {
      deletedAt: expect.any(Date),
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(deleteActivitySpy).toHaveBeenCalledTimes(1);
    expect(deleteActivitySpy).toHaveBeenCalledWith(prismaTxMock, TEST_HOUSING_PROJECT_1.activityId, {
      deletedAt: expect.any(Date),
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('deleteHousingProjectDraftController', () => {
  const getDraftSpy = jest.spyOn(draftService, 'getDraft');
  const deleteActivityHardSpy = jest.spyOn(activityService, 'deleteActivityHard');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftSpy.mockResolvedValue(TEST_HOUSING_DRAFT);
    deleteActivityHardSpy.mockResolvedValue();

    await deleteHousingProjectDraftController(
      req as unknown as Request<{ draftId: string }>,
      res as unknown as Response
    );

    expect(getDraftSpy).toHaveBeenCalledTimes(1);
    expect(getDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(deleteActivityHardSpy).toHaveBeenCalledTimes(1);
    expect(deleteActivityHardSpy).toHaveBeenCalledWith(prismaTxMock, TEST_HOUSING_DRAFT.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('emailHousingProjectConfirmationController', () => {
  const emailSpy = jest.spyOn(emailService, 'email');

  it('should call services and respond with status and result', async () => {
    const req = {
      body: {
        to: 'test@test.com',
        subject: 'Subject',
        body: 'Some body text'
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    emailSpy.mockResolvedValue({ data: { text: '1234' }, status: 200 });

    await emailHousingProjectConfirmationController(
      req as unknown as Request<never, never, Email>,
      res as unknown as Response
    );

    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: '1234' });
  });
});

describe('getHousingProjectActivityIdsController', () => {
  const getHousingProjectsSpy = jest.spyOn(housingProjectService, 'getHousingProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    getHousingProjectsSpy.mockResolvedValue([TEST_HOUSING_PROJECT_1]);

    await getHousingProjectActivityIdsController(req as unknown as Request, res as unknown as Response);

    expect(getHousingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(getHousingProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_PROJECT_1.activityId]);
  });
});

describe('getHousingProjectDraftController', () => {
  const getDraftSpy = jest.spyOn(draftService, 'getDraft');

  it('should call services and respond with 200', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftSpy.mockResolvedValue(TEST_HOUSING_DRAFT);

    await getHousingProjectDraftController(req as unknown as Request<{ draftId: string }>, res as unknown as Response);

    expect(getDraftSpy).toHaveBeenCalledTimes(1);
    expect(getDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_DRAFT);
  });
});

describe('getHousingProjectDraftsController', () => {
  const getDraftsSpy = jest.spyOn(draftService, 'getDrafts');

  it('should call services and respond with 200', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftsSpy.mockResolvedValue([TEST_HOUSING_DRAFT]);

    await getHousingProjectDraftsController(req as unknown as Request, res as unknown as Response);

    expect(getDraftsSpy).toHaveBeenCalledTimes(1);
    expect(getDraftsSpy).toHaveBeenCalledWith(prismaTxMock, DraftCode.HOUSING_PROJECT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_DRAFT]);
  });
});

describe('getHousingProjectStatisticsController', () => {
  const statisticsSpy = jest.spyOn(housingProjectService, 'getHousingProjectStatistics');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: {
        dateFrom: '',
        dateTo: '',
        monthYear: '',
        userId: ''
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const statistics: HousingProjectStatistics[] = [
      {
        total_submissions: 0,
        total_submissions_between: 0,
        total_submissions_monthyear: 0,
        total_submissions_assignedto: 0,
        intake_submitted: 0,
        intake_assigned: 0,
        intake_completed: 0,
        state_new: 0,
        state_inprogress: 0,
        state_delayed: 0,
        state_completed: 0,
        supported_bc: 0,
        supported_indigenous: 0,
        supported_non_profit: 0,
        supported_housing_coop: 0,
        waiting_on: 0,
        queue_1: 0,
        queue_2: 0,
        queue_3: 0,
        escalation: 0,
        general_enquiry: 0,
        guidance: 0,
        inapplicable: 0,
        status_request: 0,
        multi_permits_needed: 0
      }
    ];

    statisticsSpy.mockResolvedValue(statistics);

    await getHousingProjectStatisticsController(
      req as unknown as Request<never, never, never, StatisticsFilters>,
      res as unknown as Response
    );

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(prismaTxMock, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(statistics[0]);
  });
});

describe('getHousingProjectController', () => {
  const housingProjectSpy = jest.spyOn(housingProjectService, 'getHousingProject');
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    housingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1);
    getRelatedEnquiriesSpy.mockResolvedValue([]);

    await getHousingProjectController(
      req as unknown as Request<{ housingProjectId: string }>,
      res as unknown as Response
    );

    expect(housingProjectSpy).toHaveBeenCalledTimes(1);
    expect(housingProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.housingProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_PROJECT_1);
  });
});

describe('getHousingProjectsController', () => {
  const housingProjectsSpy = jest.spyOn(housingProjectService, 'getHousingProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      query: {}
    };

    housingProjectsSpy.mockResolvedValue([TEST_HOUSING_PROJECT_1]);

    await getHousingProjectsController(req as unknown as Request, res as unknown as Response);

    expect(housingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(housingProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_PROJECT_1]);
  });
});

describe('searchHousingProjectsController', () => {
  const searchHousingProjectsSpy = jest.spyOn(housingProjectService, 'searchHousingProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { activityId: ['ACTI1234', 'ACTI5678'], includeUser: false },
      currentContext: TEST_CURRENT_CONTEXT
    };

    searchHousingProjectsSpy.mockResolvedValue([TEST_HOUSING_PROJECT_1]);

    await searchHousingProjectsController(
      req as unknown as Request<never, never, never, HousingProjectSearchParameters>,
      res as unknown as Response
    );

    expect(searchHousingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchHousingProjectsSpy).toHaveBeenCalledWith(prismaTxMock, {
      activityId: ['ACTI1234', 'ACTI5678'],
      includeUser: false
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_PROJECT_1]);
  });
});

describe('submitHousingProjectDraftController', () => {
  const upsertPermitSpy = jest.spyOn(permitService, 'upsertPermit');
  const createHousingProjectSpy = jest.spyOn(housingProjectService, 'createHousingProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');
  const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
  const deleteDraftSpy = jest.spyOn(draftService, 'deleteDraft');
  const upsertPermitTrackingSpy = jest.spyOn(permitTrackingService, 'upsertPermitTracking');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_HOUSING_PROJECT_INTAKE },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_HOUSING_ACTIVITY);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_HOUSING_ACTIVITY.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    createHousingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1);
    upsertContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

    await submitHousingProjectDraftController(
      req as unknown as Request<never, never, HousingProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING, {
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: [TEST_CURRENT_CONTEXT.userId]
    });
    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_HOUSING_ACTIVITY.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_HOUSING_PROJECT_1,
      housingProjectId: expect.stringMatching(uuidv4Pattern),
      submittedAt: expect.any(Date),
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_HOUSING_PROJECT_1,
      contact: TEST_CONTACT_1
    });
  });

  it('should delete associated draft if it exists', async () => {
    const req = {
      body: { ...TEST_HOUSING_PROJECT_INTAKE, draftId: '44dc87a5-a441-4904-8a27-11f8a41c8d87' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_HOUSING_ACTIVITY);
    createHousingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1);
    deleteDraftSpy.mockResolvedValue();

    await submitHousingProjectDraftController(
      req as unknown as Request<never, never, HousingProjectIntake>,
      res as unknown as Response
    );

    expect(deleteDraftSpy).toHaveBeenCalledTimes(1);
    expect(deleteDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.body.draftId);
  });

  it('creates permits if they exist', async () => {
    const req = {
      body: {
        appliedPermits: [TEST_PERMIT_1, TEST_PERMIT_2],
        investigatePermits: [TEST_PERMIT_3]
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_HOUSING_ACTIVITY);
    createHousingProjectSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_1);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_2);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_3);
    upsertPermitTrackingSpy.mockResolvedValue([]);
    upsertContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

    await submitHousingProjectDraftController(
      req as unknown as Request<never, never, HousingProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(upsertPermitSpy).toHaveBeenCalledTimes(3);
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(1, prismaTxMock, {
      ...TEST_PERMIT_1,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(2, prismaTxMock, {
      ...TEST_PERMIT_2,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(3, prismaTxMock, {
      ...TEST_PERMIT_3,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(0);
  });
});

describe('updateHousingProjectDraftController', () => {
  const createDraftSpy = jest.spyOn(draftService, 'createDraft');
  const updateDraftSpy = jest.spyOn(draftService, 'updateDraft');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        data: {
          contactFirstName: 'test',
          contactLastName: 'person',
          basic: {
            projectApplicantType: 'Business'
          },
          housing: {
            projectName: 'TheProject'
          },
          location: {
            projectLocation: 'Some place'
          },
          permits: {
            hasAppliedProvincialPermits: true
          }
        }
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_HOUSING_ACTIVITY);
    createDraftSpy.mockResolvedValue(TEST_HOUSING_DRAFT);

    await upsertHousingProjectDraftController(
      req as unknown as Request<never, never, Draft>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledWith(prismaTxMock, {
      draftId: expect.stringMatching(uuidv4Pattern),
      activityId: 'ACTI1234',
      draftCode: DraftCode.HOUSING_PROJECT,
      data: req.body.data,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: null,
      updatedBy: null,
      deletedAt: null,
      deletedBy: null
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
      activityId: 'ACTI1234'
    });
  });

  it('updates draft with the given draftId and activityId', async () => {
    const req = {
      body: {
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
        activityId: 'ACTI1234',
        contactFirstName: 'test',
        contactLastName: 'person',
        basic: {
          projectApplicantType: 'Business'
        },
        housing: {
          projectName: 'TheProject'
        },
        location: {
          projectLocation: 'Some place'
        },
        permits: {
          hasAppliedProvincialPermits: true
        }
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    updateDraftSpy.mockResolvedValue(TEST_HOUSING_DRAFT);

    await upsertHousingProjectDraftController(
      req as unknown as Request<never, never, Draft>,
      res as unknown as Response
    );

    expect(updateDraftSpy).toHaveBeenCalledTimes(1);
    expect(updateDraftSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
      activityId: 'ACTI1234'
    });
  });
});

describe('updateHousingProjectController', () => {
  const updateSpy = jest.spyOn(housingProjectService, 'updateHousingProject');

  const UPDATED_PROJECT: HousingProject = { ...TEST_HOUSING_PROJECT_1, projectName: 'NEW NAME' };

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: UPDATED_PROJECT,
      currentContext: TEST_CURRENT_CONTEXT
    };

    updateSpy.mockResolvedValue(UPDATED_PROJECT);

    await updateHousingProjectController(
      req as unknown as Request<never, never, HousingProject>,
      res as unknown as Response
    );

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...UPDATED_PROJECT,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(UPDATED_PROJECT);
  });
});
