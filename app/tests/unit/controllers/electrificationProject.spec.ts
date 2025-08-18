import {
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_INTAKE,
  TEST_ELECTRIFICATION_ACTIVITY,
  TEST_ELECTRIFICATION_PROJECT_1,
  TEST_ELECTRIFICATION_PROJECT_CREATE,
  TEST_ELECTRIFICATION_DRAFT
} from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  createElectrificationProjectController,
  deleteElectrificationProjectDraftController,
  emailElectrificationProjectConfirmationController,
  getElectrificationProjectActivityIdsController,
  getElectrificationProjectController,
  getElectrificationProjectDraftController,
  getElectrificationProjectDraftsController,
  getElectrificationProjectsController,
  getElectrificationProjectStatisticsController,
  searchElectrificationProjectsController,
  submitElectrificationProjectDraftController,
  updateElectrificationProjectController,
  updateElectrificationProjectDraftController,
  updateElectrificationProjectIsDeletedFlagController
} from '../../../src/controllers/electrificationProject';
import * as activityService from '../../../src/services/activity';
import * as emailService from '../../../src/services/email';
import * as draftService from '../../../src/services/draft';
import * as enquiryService from '../../../src/services/enquiry';
import * as electrificationProjectService from '../../../src/services/electrificationProject';
import { Initiative } from '../../../src/utils/enums/application';
import { DraftCode } from '../../../src/utils/enums/projectCommon';
import { uuidv4Pattern } from '../../../src/utils/regexp';

import type { Request, Response } from 'express';
import type {
  Contact,
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics,
  Email,
  StatisticsFilters
} from '../../../src/types';

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

describe('createElectrificationProjectController', () => {
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const createElectrificationProjectSpy = jest.spyOn(electrificationProjectService, 'createElectrificationProject');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        project: {
          projectName: null,
          projectDescription: null,
          companyNameRegistered: null,
          projectType: null,
          bcHydroNumber: null
        }
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ELECTRIFICATION_ACTIVITY);
    createElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_CREATE);

    await createElectrificationProjectController(
      req as unknown as Request<never, never, ElectrificationProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_ELECTRIFICATION_PROJECT_CREATE,
      electrificationProjectId: expect.stringMatching(uuidv4Pattern),
      submittedAt: expect.any(Date),
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_ELECTRIFICATION_PROJECT_CREATE,
      electrificationProjectId: expect.stringMatching(uuidv4Pattern),
      submittedAt: expect.any(Date),
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
  });
});

describe('deleteElectrificationProjectDraftController', () => {
  const deleteDraftSpy = jest.spyOn(draftService, 'deleteDraft');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    deleteDraftSpy.mockResolvedValue();

    await deleteElectrificationProjectDraftController(
      req as unknown as Request<{ draftId: string }>,
      res as unknown as Response
    );

    expect(deleteDraftSpy).toHaveBeenCalledTimes(1);
    expect(deleteDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('emailElectrificationProjectConfirmationController', () => {
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

    await emailElectrificationProjectConfirmationController(
      req as unknown as Request<never, never, Email>,
      res as unknown as Response
    );

    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: '1234' });
  });
});

describe('getElectrificationProjectActivityIdsController', () => {
  const getElectrificationProjectsSpy = jest.spyOn(electrificationProjectService, 'getElectrificationProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    getElectrificationProjectsSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);

    await getElectrificationProjectActivityIdsController(req as unknown as Request, res as unknown as Response);

    expect(getElectrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(getElectrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1.activityId]);
  });
});

describe('getElectrificationProjectDraftController', () => {
  const getDraftSpy = jest.spyOn(draftService, 'getDraft');

  it('should call services and respond with 200', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await getElectrificationProjectDraftController(
      req as unknown as Request<{ draftId: string }>,
      res as unknown as Response
    );

    expect(getDraftSpy).toHaveBeenCalledTimes(1);
    expect(getDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_DRAFT);
  });
});

describe('getElectrificationProjectDraftsController', () => {
  const getDraftsSpy = jest.spyOn(draftService, 'getDrafts');

  it('should call services and respond with 200', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    getDraftsSpy.mockResolvedValue([TEST_ELECTRIFICATION_DRAFT]);

    await getElectrificationProjectDraftsController(req as unknown as Request, res as unknown as Response);

    expect(getDraftsSpy).toHaveBeenCalledTimes(1);
    expect(getDraftsSpy).toHaveBeenCalledWith(prismaTxMock, DraftCode.ELECTRIFICATION_PROJECT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_DRAFT]);
  });
});

describe('getElectrificationProjectStatistics', () => {
  const statisticsSpy = jest.spyOn(electrificationProjectService, 'getElectrificationProjectStatistics');

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

    const statistics: ElectrificationProjectStatistics[] = [
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

    await getElectrificationProjectStatisticsController(
      req as unknown as Request<never, never, never, StatisticsFilters>,
      res as unknown as Response
    );

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(prismaTxMock, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(statistics[0]);
  });
});

describe('getElectrificationProjectController', () => {
  const getElectrificationProjectSpy = jest.spyOn(electrificationProjectService, 'getElectrificationProject');
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    getElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1);
    getRelatedEnquiriesSpy.mockResolvedValue([]);

    await getElectrificationProjectController(
      req as unknown as Request<{ electrificationProjectId: string }>,
      res as unknown as Response
    );

    expect(getElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(getElectrificationProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.electrificationProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_1);
  });
});

describe('getElectrificationProjectsController', () => {
  const electrificationProjectsSpy = jest.spyOn(electrificationProjectService, 'getElectrificationProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      query: {}
    };

    electrificationProjectsSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);

    await getElectrificationProjectsController(req as unknown as Request, res as unknown as Response);

    expect(electrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(electrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1]);
  });
});

describe('searchElectrificationProjectsController', () => {
  const searchElectrificationProjectsSpy = jest.spyOn(electrificationProjectService, 'searchElectrificationProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { activityId: ['ACTI1234', 'ACTI5678'], includeUser: false },
      currentContext: TEST_CURRENT_CONTEXT
    };

    searchElectrificationProjectsSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);

    await searchElectrificationProjectsController(
      req as unknown as Request<never, never, never, ElectrificationProjectSearchParameters>,
      res as unknown as Response
    );

    expect(searchElectrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchElectrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock, {
      activityId: ['ACTI1234', 'ACTI5678'],
      includeUser: false
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1]);
  });
});

describe('submitElectrificationProjectDraftController', () => {
  const createElectrificationProjectSpy = jest.spyOn(electrificationProjectService, 'createElectrificationProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const deleteDraftSpy = jest.spyOn(draftService, 'deleteDraft');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_ELECTRIFICATION_INTAKE },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ELECTRIFICATION_ACTIVITY);
    createElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1);

    await submitElectrificationProjectDraftController(
      req as unknown as Request<never, never, ElectrificationProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_ELECTRIFICATION_PROJECT_1,
      electrificationProjectId: expect.stringMatching(uuidv4Pattern),
      submittedAt: expect.any(Date),
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      activityId: TEST_ELECTRIFICATION_PROJECT_1.activityId,
      electrificationProjectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
    });
  });

  it('should delete associated draft if it exists', async () => {
    const req = {
      body: { ...TEST_ELECTRIFICATION_INTAKE, draftId: '44dc87a5-a441-4904-8a27-11f8a41c8d87' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    createActivitySpy.mockResolvedValue(TEST_ELECTRIFICATION_ACTIVITY);
    createElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1);
    deleteDraftSpy.mockResolvedValue();

    await submitElectrificationProjectDraftController(
      req as unknown as Request<never, never, ElectrificationProjectIntake>,
      res as unknown as Response
    );

    expect(deleteDraftSpy).toHaveBeenCalledTimes(1);
    expect(deleteDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.body.draftId);
  });
});

describe('updateElectrificationProjectDraftController', () => {
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
          electrification: {
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

    createActivitySpy.mockResolvedValue(TEST_ELECTRIFICATION_ACTIVITY);
    createDraftSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await updateElectrificationProjectDraftController(
      req as unknown as Request<never, never, Draft>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledWith(prismaTxMock, {
      draftId: expect.stringMatching(uuidv4Pattern),
      activityId: 'ACTI1234',
      draftCode: DraftCode.ELECTRIFICATION_PROJECT,
      data: req.body.data,
      createdAt: expect.any(Date),
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: null,
      updatedBy: null
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
        electrification: {
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

    updateDraftSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await updateElectrificationProjectDraftController(
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

describe('updateElectrificationProjectController', () => {
  const updateSpy = jest.spyOn(electrificationProjectService, 'updateElectrificationProject');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { project: TEST_ELECTRIFICATION_PROJECT_1 },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const updated: ElectrificationProject = { ...TEST_ELECTRIFICATION_PROJECT_1, projectName: 'NEW NAME' };

    updateSpy.mockResolvedValue(updated);

    await updateElectrificationProjectController(
      req as unknown as Request<never, never, { project: ElectrificationProject; contacts: Array<Contact> }>,
      res as unknown as Response
    );

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body.project,
      updatedAt: expect.any(Date),
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

describe('updateElectrificationProjectIsDeletedFlagController', () => {
  const updateElectrificationProjectIsDeletedFlagSpy = jest.spyOn(
    electrificationProjectService,
    'updateElectrificationProjectIsDeletedFlag'
  );

  it('should call services and respond with 204', async () => {
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      body: { isDeleted: true },
      currentContext: TEST_CURRENT_CONTEXT
    };

    updateElectrificationProjectIsDeletedFlagSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1);

    await updateElectrificationProjectIsDeletedFlagController(
      req as unknown as Request<{ electrificationProjectId: string }, never, { isDeleted: boolean }>,
      res as unknown as Response
    );

    expect(updateElectrificationProjectIsDeletedFlagSpy).toHaveBeenCalledTimes(1);
    expect(updateElectrificationProjectIsDeletedFlagSpy).toHaveBeenCalledWith(
      prismaTxMock,
      req.params.electrificationProjectId,
      req.body.isDeleted,
      {
        updatedAt: expect.any(Date),
        updatedBy: TEST_CURRENT_CONTEXT.userId
      }
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});
