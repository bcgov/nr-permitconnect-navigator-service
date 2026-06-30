import { Prisma } from '@prisma/client';

import {
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_INTAKE,
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_ELECTRIFICATION_PROJECT_1,
  TEST_ELECTRIFICATION_PROJECT_CREATE,
  TEST_ELECTRIFICATION_DRAFT,
  TEST_CONTACT_1,
  TEST_ELECTRIFICATION_PROJECT_UPDATE
} from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  createElectrificationProjectController,
  deleteElectrificationProjectController,
  deleteElectrificationProjectDraftController,
  getElectrificationProjectActivityIdsController,
  getElectrificationProjectController,
  getElectrificationProjectDraftController,
  getElectrificationProjectDraftsController,
  getElectrificationProjectsController,
  getElectrificationProjectStatisticsController,
  searchElectrificationProjectsController,
  submitElectrificationProjectDraftController,
  updateElectrificationProjectController,
  upsertElectrificationProjectDraftController
} from '../../../src/controllers/electrificationProject.ts';
import * as resposeFiltering from '../../../src/parsers/responseFiltering.ts';
import * as activityService from '../../../src/services/activity.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import * as contactService from '../../../src/services/contact.ts';
import * as draftService from '../../../src/services/draft.ts';
import * as enquiryService from '../../../src/services/enquiry.ts';
import * as electrificationProjectService from '../../../src/services/electrificationProject.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { ActivityContactRole, DraftCode } from '../../../src/utils/enums/projectCommon.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  ActivityContact,
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics,
  LocalContext,
  StatisticsFilters
} from '../../../src/types/index.ts';

vi.mock('config');

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
});

afterEach(() => {
  /*
   * Must use clearAllMocks when using the mocked config
   * resetAllMocks seems to cause strange issues such as
   * functions not calling as expected
   */
  vi.clearAllMocks();
});

describe('createElectrificationProjectController', () => {
  const createActivitySpy = vi.spyOn(activityService, 'createActivity');
  const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = vi.spyOn(activityContactService, 'createActivityContact');
  const createElectrificationProjectSpy = vi.spyOn(electrificationProjectService, 'createElectrificationProject');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        basic: {
          projectName: null,
          projectDescription: null,
          registeredId: null,
          registeredName: null
        },
        project: {
          projectType: null,
          bcHydroNumber: null
        }
      }
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_ACTIVITY_ELECTRIFICATION.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    createElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_CREATE);

    await createElectrificationProjectController(
      req as unknown as Request<never, never, ElectrificationProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {
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
      TEST_ACTIVITY_ELECTRIFICATION.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...TEST_ELECTRIFICATION_PROJECT_CREATE,
      electrificationProjectId: expect.stringMatching(uuidv4Pattern) as string,
      submittedAt: expect.any(Date) as Date,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_ELECTRIFICATION_PROJECT_CREATE,
      electrificationProjectId: expect.stringMatching(uuidv4Pattern) as string,
      submittedAt: expect.any(Date) as Date,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId
    });
  });
});

describe('deleteElectrificationProjectController', () => {
  const deleteElectrificationProjectSpy = vi.spyOn(electrificationProjectService, 'deleteElectrificationProject');
  const deleteActivitySpy = vi.spyOn(activityService, 'deleteActivity');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    };

    deleteElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1);
    deleteActivitySpy.mockResolvedValue();

    await deleteElectrificationProjectController(
      req as unknown as Request<{ electrificationProjectId: string }>,
      res as unknown as Response
    );

    expect(deleteElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(deleteElectrificationProjectSpy).toHaveBeenCalledWith(prismaTxMock, req.params.electrificationProjectId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(deleteActivitySpy).toHaveBeenCalledTimes(1);
    expect(deleteActivitySpy).toHaveBeenCalledWith(prismaTxMock, TEST_ELECTRIFICATION_PROJECT_1.activityId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('deleteElectrificationProjectDraftController', () => {
  const getDraftSpy = vi.spyOn(draftService, 'getDraft');
  const deleteActivityHardSpy = vi.spyOn(activityService, 'deleteActivityHard');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' }
    };

    getDraftSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);
    deleteActivityHardSpy.mockResolvedValue();

    await deleteElectrificationProjectDraftController(
      req as unknown as Request<{ draftId: string }>,
      res as unknown as Response
    );

    expect(getDraftSpy).toHaveBeenCalledTimes(1);
    expect(getDraftSpy).toHaveBeenCalledWith(prismaTxMock, req.params.draftId);
    expect(deleteActivityHardSpy).toHaveBeenCalledTimes(1);
    expect(deleteActivityHardSpy).toHaveBeenCalledWith(prismaTxMock, TEST_ELECTRIFICATION_DRAFT.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getElectrificationProjectActivityIdsController', () => {
  const getElectrificationProjectsSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProjects');

  it('should call services and respond with 200 and result', async () => {
    const req = {};

    getElectrificationProjectsSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);

    await getElectrificationProjectActivityIdsController(req as unknown as Request, res as unknown as Response);

    expect(getElectrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(getElectrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1.activityId]);
  });
});

describe('getElectrificationProjectDraftController', () => {
  const getDraftSpy = vi.spyOn(draftService, 'getDraft');

  it('should call services and respond with 200', async () => {
    const req = {
      params: { draftId: 'ee25619b-4145-4fc6-aa47-c79f1213eaa6' }
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
  const getDraftsSpy = vi.spyOn(draftService, 'getDrafts');
  const filterSpy = vi.spyOn(resposeFiltering, 'filterActivityResponseByScope');

  it('should call services and respond with 200', async () => {
    const req = {};

    getDraftsSpy.mockResolvedValue([TEST_ELECTRIFICATION_DRAFT]);
    filterSpy.mockResolvedValue([TEST_ELECTRIFICATION_DRAFT]);

    await getElectrificationProjectDraftsController(
      req as unknown as Request,
      res as unknown as Response<Draft[], LocalContext>
    );

    expect(getDraftsSpy).toHaveBeenCalledTimes(1);
    expect(getDraftsSpy).toHaveBeenCalledWith(prismaTxMock, DraftCode.ELECTRIFICATION_PROJECT);
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(filterSpy).toHaveBeenCalledWith(prismaTxMock, res.locals, [TEST_ELECTRIFICATION_DRAFT]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_DRAFT]);
  });
});

describe('getElectrificationProjectStatistics', () => {
  const statisticsSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProjectStatistics');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: {
        dateFrom: '',
        dateTo: '',
        monthYear: '',
        userId: ''
      }
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
  const getElectrificationProjectSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProject');
  const getRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
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
  const electrificationProjectsSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProjects');
  const filterSpy = vi.spyOn(resposeFiltering, 'filterActivityResponseByScope');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: {}
    };

    electrificationProjectsSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);
    filterSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);

    await getElectrificationProjectsController(
      req as unknown as Request,
      res as unknown as Response<ElectrificationProject[], LocalContext>
    );

    expect(electrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(electrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1]);
  });
});

describe('searchElectrificationProjectsController', () => {
  const searchElectrificationProjectsSpy = vi.spyOn(electrificationProjectService, 'searchElectrificationProjects');
  const filterSpy = vi.spyOn(resposeFiltering, 'filterActivityResponseByScope');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { activityId: ['ACTI1234', 'ACTI5678'], includeUser: false }
    };

    searchElectrificationProjectsSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);
    filterSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1]);

    await searchElectrificationProjectsController(
      req as unknown as Request<never, never, ElectrificationProjectSearchParameters, never>,
      res as unknown as Response<ElectrificationProject[], LocalContext>
    );

    expect(searchElectrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(searchElectrificationProjectsSpy).toHaveBeenCalledWith(prismaTxMock, {
      activityId: ['ACTI1234', 'ACTI5678'],
      includeUser: false
    });
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(filterSpy).toHaveBeenCalledWith(prismaTxMock, res.locals, [TEST_ELECTRIFICATION_PROJECT_1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1]);
  });
});

describe('submitElectrificationProjectDraftController', () => {
  const createElectrificationProjectSpy = vi.spyOn(electrificationProjectService, 'createElectrificationProject');
  const createActivitySpy = vi.spyOn(activityService, 'createActivity');
  const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
  const createActivityContactSpy = vi.spyOn(activityContactService, 'createActivityContact');
  const deleteDraftSpy = vi.spyOn(draftService, 'deleteDraft');
  const upsertContactsSpy = vi.spyOn(contactService, 'upsertContacts');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: { ...TEST_ELECTRIFICATION_INTAKE }
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION);
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    createActivityContactSpy.mockResolvedValue({
      activityId: TEST_ACTIVITY_ELECTRIFICATION.activityId,
      contactId: TEST_CONTACT_1.contactId
    } as ActivityContact);
    createElectrificationProjectSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1);
    upsertContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

    await submitElectrificationProjectDraftController(
      req as unknown as Request<never, never, ElectrificationProjectIntake>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {
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
      TEST_ACTIVITY_ELECTRIFICATION.activityId,
      TEST_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        ...TEST_ELECTRIFICATION_PROJECT_1,
        electrificationProjectId: expect.stringMatching(uuidv4Pattern) as string,
        submittedAt: expect.any(Date) as Date,
        createdAt: expect.any(Date) as Date,
        createdBy: TEST_CURRENT_CONTEXT.userId
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      ...TEST_ELECTRIFICATION_PROJECT_1,
      contact: TEST_CONTACT_1
    });
  });

  it('should delete associated draft if it exists', async () => {
    const req = {
      body: { ...TEST_ELECTRIFICATION_INTAKE, draftId: '44dc87a5-a441-4904-8a27-11f8a41c8d87' }
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION);
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
  const createDraftSpy = vi.spyOn(draftService, 'createDraft');
  const updateDraftSpy = vi.spyOn(draftService, 'updateDraft');
  const createActivitySpy = vi.spyOn(activityService, 'createActivity');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        data: {
          basic: {
            projectApplicantType: 'Business',
            projectName: 'TheProject'
          },
          contact: {
            firstName: 'test',
            lastName: 'person'
          }
        }
      }
    };

    createActivitySpy.mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION);
    createDraftSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await upsertElectrificationProjectDraftController(
      req as unknown as Request<never, never, Draft>,
      res as unknown as Response
    );

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledWith(prismaTxMock, {
      draftId: expect.stringMatching(uuidv4Pattern) as string,
      activityId: 'ACTI1234',
      draftCode: DraftCode.ELECTRIFICATION_PROJECT,
      data: req.body.data,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: null,
      updatedBy: null,
      deletedAt: null,
      deletedBy: null
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
        activityId: 'ACTI1234',
        draftCode: DraftCode.ELECTRIFICATION_PROJECT,
        data: expect.any(Object)
      })
    );
  });

  it('updates draft with the given draftId and activityId', async () => {
    const req = {
      body: {
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
        activityId: 'ACTI1234',
        data: {
          basic: {
            projectApplicantType: 'Business',
            projectName: 'TheProject'
          },
          contact: {
            firstName: 'test',
            lastName: 'person'
          }
        }
      }
    };

    updateDraftSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await upsertElectrificationProjectDraftController(
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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102',
        activityId: 'ACTI1234',
        draftCode: DraftCode.ELECTRIFICATION_PROJECT,
        data: expect.any(Object)
      })
    );
  });
});

describe('updateElectrificationProjectController', () => {
  const updateSpy = vi.spyOn(electrificationProjectService, 'updateElectrificationProject');

  const { electrificationProjectId } = TEST_ELECTRIFICATION_PROJECT_1;

  const UPDATED_PROJECT: ElectrificationProject = {
    ...TEST_ELECTRIFICATION_PROJECT_1,
    ...TEST_ELECTRIFICATION_PROJECT_UPDATE
  };

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: TEST_ELECTRIFICATION_PROJECT_UPDATE,

      params: {
        electrificationProjectId
      }
    };

    updateSpy.mockResolvedValue(UPDATED_PROJECT);

    await updateElectrificationProjectController(
      req as unknown as Request<
        { electrificationProjectId: string },
        never,
        Omit<Prisma.electrification_projectUpdateInput, 'electrificationProjectId'>
      >,
      res as unknown as Response
    );

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(
      prismaTxMock,
      {
        ...TEST_ELECTRIFICATION_PROJECT_UPDATE,
        updatedAt: expect.any(Date) as Date,
        updatedBy: TEST_CURRENT_CONTEXT.userId
      },
      electrificationProjectId
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(UPDATED_PROJECT);
  });
});
