import {
  createGeneralProjectController,
  deleteGeneralProjectController,
  deleteGeneralProjectDraftController,
  emailGeneralProjectConfirmationController,
  getGeneralProjectActivityIdsController,
  getGeneralProjectController,
  getGeneralProjectDraftController,
  getGeneralProjectDraftsController,
  getGeneralProjectsController,
  getGeneralProjectStatisticsController,
  searchGeneralProjectsController,
  submitGeneralProjectDraftController,
  updateGeneralProjectController,
  upsertGeneralProjectDraftController
} from '../../../src/controllers/generalProject.ts';
import * as activityService from '../../../src/services/activity.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import * as contactService from '../../../src/services/contact.ts';
import * as draftService from '../../../src/services/draft.ts';
import * as emailService from '../../../src/services/email.ts';
import * as enquiryService from '../../../src/services/enquiry.ts';
import * as generalProjectService from '../../../src/services/generalProject.ts';
import * as permitService from '../../../src/services/permit.ts';
import * as permitTrackingService from '../../../src/services/permitTracking.ts';
import { ActivityContactRole, DraftCode } from '../../../src/utils/enums/projectCommon.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';

import type { Request, Response } from 'express';
import type {
  ActivityContact,
  Draft,
  Email,
  GeneralProject,
  GeneralProjectIntake,
  GeneralProjectSearchParameters,
  GeneralProjectStatistics,
  StatisticsFilters
} from '../../../src/types/index.ts';
import {
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_ACTIVITY_GENERAL,
  TEST_GENERAL_DRAFT,
  TEST_GENERAL_PROJECT_1,
  TEST_GENERAL_PROJECT_CREATE,
  TEST_GENERAL_PROJECT_INTAKE,
  TEST_IDIR_USER_1,
  TEST_PERMIT_1,
  TEST_PERMIT_2,
  TEST_PERMIT_3,
  TEST_EMAIL_RESPONSE
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

describe('createGeneralProjectController', () => {
  const upsertPermitSpy = jest.spyOn(permitService, 'upsertPermit');
  const upsertPermitTrackingSpy = jest.spyOn(permitTrackingService, 'upsertPermitTracking');
  const createGeneralProjectSpy = jest.spyOn(generalProjectService, 'createGeneralProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');
  const getCurrentUsernameSpy = jest.spyOn(utils, 'getCurrentUsername');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_GENERAL_PROJECT_INTAKE },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_GENERAL);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    createGeneralProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_CREATE);
    upsertPermitTrackingSpy.mockResolvedValue([]);
    getCurrentUsernameSpy.mockReturnValue(TEST_IDIR_USER_1.fullName!);

    await createGeneralProjectController(
      req as unknown as Request<never, never, GeneralProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.GENERAL, {
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: [TEST_CURRENT_CONTEXT.userId]
    });
    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_GENERAL.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(createGeneralProjectSpy).toHaveBeenCalledTimes(1);
    expect(createGeneralProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_GENERAL_PROJECT_CREATE,
      generalProjectId: expect.stringMatching(uuidv4Pattern) as string,
      submittedAt: expect.any(Date) as Date,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_GENERAL_PROJECT_1,
      generalProjectId: expect.stringMatching(uuidv4Pattern) as string,
      submittedAt: expect.any(Date) as Date,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
  });

  it('creates permits if they exist', async () => {
    const permit1NoTracking = { ...TEST_PERMIT_1 };
    delete permit1NoTracking.permitTracking;
    const permit2NoTracking = { ...TEST_PERMIT_2 };
    delete permit2NoTracking.permitTracking;
    const permit3NoTracking = { ...TEST_PERMIT_3 };
    delete permit3NoTracking.permitTracking;

    const req = {
      body: {
        appliedPermits: [permit1NoTracking, permit2NoTracking],
        investigatePermits: [TEST_PERMIT_3]
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_GENERAL);
    createGeneralProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_CREATE);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_1);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_2);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_3);
    upsertPermitTrackingSpy.mockResolvedValue([]);

    await createGeneralProjectController(
      req as unknown as Request<never, never, GeneralProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createGeneralProjectSpy).toHaveBeenCalledTimes(1);

    expect(upsertPermitSpy).toHaveBeenCalledTimes(3);
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(1, prismaTxMock, {
      ...permit1NoTracking,
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      stage: 'Application submission',
      state: 'In progress',
      needed: 'Yes',
      statusLastChanged: null,
      statusLastVerified: null,
      issuedPermitId: null,
      decisionDate: null,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId,
      deletedAt: null,
      deletedBy: null
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(2, prismaTxMock, {
      ...permit2NoTracking,
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      stage: 'Application submission',
      state: 'In progress',
      needed: 'Yes',
      statusLastChanged: null,
      statusLastVerified: null,
      issuedPermitId: null,
      decisionDate: null,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId,
      deletedAt: null,
      deletedBy: null
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(3, prismaTxMock, {
      ...permit3NoTracking,
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      stage: 'Pre-submission',
      state: 'None',
      needed: 'Under investigation',
      statusLastChanged: null,
      statusLastVerified: null,
      issuedPermitId: null,
      submittedDate: null,
      decisionDate: null,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId,
      deletedAt: null,
      deletedBy: null
    });
    expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(0);
  });
});

describe('deleteGeneralProjectController', () => {
  const getGeneralProjectSpy = jest.spyOn(generalProjectService, 'getGeneralProject');
  const deleteGeneralProjectSpy = jest.spyOn(generalProjectService, 'deleteGeneralProject');
  const deleteActivitySpy = jest.spyOn(activityService, 'deleteActivity');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { generalProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getGeneralProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1);
    deleteActivitySpy.mockResolvedValue();

    await deleteGeneralProjectController(
      req as unknown as Request<{ generalProjectId: string }>,
      res as unknown as Response
    );

    expect(getGeneralProjectSpy).toHaveBeenCalledTimes(1);
    expect(getGeneralProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.generalProjectId);
    expect(deleteGeneralProjectSpy).toHaveBeenCalledTimes(1);
    expect(deleteGeneralProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.generalProjectId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(deleteActivitySpy).toHaveBeenCalledTimes(1);
    expect(deleteActivitySpy).toHaveBeenCalledWith(prismaTxMock, TEST_GENERAL_PROJECT_1.activityId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('deleteGeneralProjectDraftController', () => {
  const getDraftSpy = jest.spyOn(draftService, 'getDraft');
  const deleteActivityHardSpy = jest.spyOn(activityService, 'deleteActivityHard');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftSpy.mockResolvedValue(TEST_GENERAL_DRAFT);
    deleteActivityHardSpy.mockResolvedValue();

    await deleteGeneralProjectDraftController(
      req as unknown as Request<{ draftId: string }>,
      res as unknown as Response
    );

    expect(getDraftSpy).toHaveBeenCalledTimes(1);
    expect(getDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(deleteActivityHardSpy).toHaveBeenCalledTimes(1);
    expect(deleteActivityHardSpy).toHaveBeenCalledWith(prismaTxMock, TEST_GENERAL_DRAFT.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('emailGeneralProjectConfirmationController', () => {
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

    emailSpy.mockResolvedValue(TEST_EMAIL_RESPONSE);

    await emailGeneralProjectConfirmationController(
      req as unknown as Request<never, never, Email>,
      res as unknown as Response
    );

    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_EMAIL_RESPONSE.data);
  });
});

describe('getGeneralProjectActivityIdsController', () => {
  const getGeneralProjectsSpy = jest.spyOn(generalProjectService, 'getGeneralProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    getGeneralProjectsSpy.mockResolvedValue([TEST_GENERAL_PROJECT_1]);

    await getGeneralProjectActivityIdsController(req as unknown as Request, res as unknown as Response);

    expect(getGeneralProjectsSpy).toHaveBeenCalledTimes(1);
    expect(getGeneralProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_PROJECT_1.activityId]);
  });
});

describe('getGeneralProjectDraftController', () => {
  const getDraftSpy = jest.spyOn(draftService, 'getDraft');

  it('should call services and respond with 200', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftSpy.mockResolvedValue(TEST_GENERAL_DRAFT);

    await getGeneralProjectDraftController(req as unknown as Request<{ draftId: string }>, res as unknown as Response);

    expect(getDraftSpy).toHaveBeenCalledTimes(1);
    expect(getDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_DRAFT);
  });
});

describe('getGeneralProjectDraftsController', () => {
  const getDraftsSpy = jest.spyOn(draftService, 'getDrafts');

  it('should call services and respond with 200', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftsSpy.mockResolvedValue([TEST_GENERAL_DRAFT]);

    await getGeneralProjectDraftsController(req as unknown as Request, res as unknown as Response);

    expect(getDraftsSpy).toHaveBeenCalledTimes(1);
    expect(getDraftsSpy).toHaveBeenCalledWith(prismaTxMock, DraftCode.GENERAL_PROJECT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_DRAFT]);
  });
});

describe('getGeneralProjectStatisticsController', () => {
  const statisticsSpy = jest.spyOn(generalProjectService, 'getGeneralProjectStatistics');

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

    const statistics: GeneralProjectStatistics[] = [
      {
        total_submissions: 0,
        total_submissions_between: 0,
        total_submissions_monthyear: 0,
        total_submissions_assignedto: 0,
        state_new: 0,
        state_inprogress: 0,
        state_delayed: 0,
        state_completed: 0,
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

    await getGeneralProjectStatisticsController(
      req as unknown as Request<never, never, never, StatisticsFilters>,
      res as unknown as Response
    );

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(prismaTxMock, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(statistics[0]);
  });
});

describe('getGeneralProjectController', () => {
  const generalProjectSpy = jest.spyOn(generalProjectService, 'getGeneralProject');
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { generalProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    generalProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1);
    getRelatedEnquiriesSpy.mockResolvedValue([]);

    await getGeneralProjectController(
      req as unknown as Request<{ generalProjectId: string }>,
      res as unknown as Response
    );

    expect(generalProjectSpy).toHaveBeenCalledTimes(1);
    expect(generalProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.generalProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_1);
  });
});

describe('getGeneralProjectsController', () => {
  const generalProjectsSpy = jest.spyOn(generalProjectService, 'getGeneralProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      query: {}
    };

    generalProjectsSpy.mockResolvedValue([TEST_GENERAL_PROJECT_1]);

    await getGeneralProjectsController(req as unknown as Request, res as unknown as Response);

    expect(generalProjectsSpy).toHaveBeenCalledTimes(1);
    expect(generalProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_PROJECT_1]);
  });
});

describe('searchGeneralProjectsController', () => {
  const searchGeneralProjectsSpy = jest.spyOn(generalProjectService, 'searchGeneralProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { activityId: ['ACTI1234', 'ACTI5678'], includeUser: false },
      currentContext: TEST_CURRENT_CONTEXT
    };

    searchGeneralProjectsSpy.mockResolvedValue([TEST_GENERAL_PROJECT_1]);

    await searchGeneralProjectsController(
      req as unknown as Request<never, never, GeneralProjectSearchParameters, never>,
      res as unknown as Response
    );

    expect(searchGeneralProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchGeneralProjectsSpy).toHaveBeenCalledWith(prismaTxMock, {
      activityId: ['ACTI1234', 'ACTI5678'],
      includeUser: false
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_PROJECT_1]);
  });
});

describe('submitGeneralProjectDraftController', () => {
  const upsertPermitSpy = jest.spyOn(permitService, 'upsertPermit');
  const createGeneralProjectSpy = jest.spyOn(generalProjectService, 'createGeneralProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = jest.spyOn(activityContactService, 'createActivityContact');
  const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
  const deleteDraftSpy = jest.spyOn(draftService, 'deleteDraft');
  const upsertPermitTrackingSpy = jest.spyOn(permitTrackingService, 'upsertPermitTracking');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_GENERAL_PROJECT_INTAKE },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_GENERAL);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    createGeneralProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1);
    upsertContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

    await submitGeneralProjectDraftController(
      req as unknown as Request<never, never, GeneralProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.GENERAL, {
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: [TEST_CURRENT_CONTEXT.userId]
    });
    expect(createActivityContactSpy).toHaveBeenCalledTimes(1);
    expect(createActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      TEST_ACTIVITY_GENERAL.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(createGeneralProjectSpy).toHaveBeenCalledTimes(1);
    expect(createGeneralProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_GENERAL_PROJECT_1,
      generalProjectId: expect.stringMatching(uuidv4Pattern) as string,
      submittedAt: expect.any(Date) as Date,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_GENERAL_PROJECT_1,
      contact: TEST_CONTACT_1
    });
  });

  it('should delete associated draft if it exists', async () => {
    const req = {
      body: { ...TEST_GENERAL_PROJECT_INTAKE, draftId: '44dc87a5-a441-4904-8a27-11f8a41c8d87' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_GENERAL);
    createGeneralProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1);
    deleteDraftSpy.mockResolvedValue();

    await submitGeneralProjectDraftController(
      req as unknown as Request<never, never, GeneralProjectIntake>,
      res as unknown as Response
    );

    expect(deleteDraftSpy).toHaveBeenCalledTimes(1);
    expect(deleteDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.body.draftId);
  });

  it('creates permits if they exist', async () => {
    const permit1NoTracking = { ...TEST_PERMIT_1 };
    delete permit1NoTracking.permitTracking;
    const permit2NoTracking = { ...TEST_PERMIT_2 };
    delete permit2NoTracking.permitTracking;
    const permit3NoTracking = { ...TEST_PERMIT_3 };
    delete permit3NoTracking.permitTracking;

    const req = {
      body: {
        appliedPermits: [permit1NoTracking, permit2NoTracking],
        investigatePermits: [TEST_PERMIT_3]
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_GENERAL);
    createGeneralProjectSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_1);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_2);
    upsertPermitSpy.mockResolvedValueOnce(TEST_PERMIT_3);
    upsertPermitTrackingSpy.mockResolvedValue([]);
    upsertContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

    await submitGeneralProjectDraftController(
      req as unknown as Request<never, never, GeneralProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
    expect(createGeneralProjectSpy).toHaveBeenCalledTimes(1);
    expect(upsertPermitSpy).toHaveBeenCalledTimes(3);
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(1, prismaTxMock, {
      ...permit1NoTracking,
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      stage: 'Application submission',
      state: 'In progress',
      needed: 'Yes',
      statusLastChanged: null,
      statusLastVerified: null,
      issuedPermitId: null,
      decisionDate: null,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId,
      deletedAt: null,
      deletedBy: null
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(2, prismaTxMock, {
      ...permit2NoTracking,
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      stage: 'Application submission',
      state: 'In progress',
      needed: 'Yes',
      statusLastChanged: null,
      statusLastVerified: null,
      issuedPermitId: null,
      decisionDate: null,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId,
      deletedAt: null,
      deletedBy: null
    });
    expect(upsertPermitSpy).toHaveBeenNthCalledWith(3, prismaTxMock, {
      ...permit3NoTracking,
      activityId: TEST_ACTIVITY_GENERAL.activityId,
      stage: 'Pre-submission',
      state: 'None',
      needed: 'Under investigation',
      statusLastChanged: null,
      statusLastVerified: null,
      issuedPermitId: null,
      submittedDate: null,
      decisionDate: null,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId,
      deletedAt: null,
      deletedBy: null
    });
    expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(0);
  });
});

describe('updateGeneralProjectDraftController', () => {
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
          general: {
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

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_GENERAL);
    createDraftSpy.mockResolvedValue(TEST_GENERAL_DRAFT);

    await upsertGeneralProjectDraftController(
      req as unknown as Request<never, never, Draft>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledWith(prismaTxMock, {
      draftId: expect.stringMatching(uuidv4Pattern) as string,
      activityId: 'ACTI1234',
      draftCode: DraftCode.GENERAL_PROJECT,
      data: req.body.data,
      createdAt: expect.any(Date) as Date,
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
        general: {
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

    updateDraftSpy.mockResolvedValue(TEST_GENERAL_DRAFT);

    await upsertGeneralProjectDraftController(
      req as unknown as Request<never, never, Draft>,
      res as unknown as Response
    );

    expect(updateDraftSpy).toHaveBeenCalledTimes(1);
    expect(updateDraftSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
      activityId: 'ACTI1234'
    });
  });
});

describe('updateGeneralProjectController', () => {
  const updateSpy = jest.spyOn(generalProjectService, 'updateGeneralProject');

  const UPDATED_PROJECT: GeneralProject = { ...TEST_GENERAL_PROJECT_1, projectName: 'NEW NAME' };

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: UPDATED_PROJECT,
      currentContext: TEST_CURRENT_CONTEXT
    };

    updateSpy.mockResolvedValue(UPDATED_PROJECT);

    await updateGeneralProjectController(
      req as unknown as Request<never, never, GeneralProject>,
      res as unknown as Response
    );

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...UPDATED_PROJECT,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(UPDATED_PROJECT);
  });
});
