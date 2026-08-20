import {
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_DRAFT,
  TEST_ELECTRIFICATION_INTAKE,
  TEST_ELECTRIFICATION_PROJECT_1,
  TEST_ELECTRIFICATION_PROJECT_CREATE
} from '#tests/unit/data/index';
import {
  createElectrificationProjectController,
  deleteElectrificationProjectController,
  deleteElectrificationProjectDraftController,
  getElectrificationProjectController,
  getElectrificationProjectDraftController,
  getElectrificationProjectDraftsController,
  getElectrificationProjectStatisticsController,
  listElectrificationProjectActivityIdsController,
  listElectrificationProjectsController,
  searchElectrificationProjectsController,
  submitElectrificationProjectDraftController,
  updateElectrificationProjectController,
  upsertElectrificationProjectDraftController
} from '#src/controllers/electrificationProject';
import * as activityService from '#src/services/activity';
import * as draftService from '#src/services/draft';
import * as electrificationProjectService from '#src/services/electrificationProject';
import { Initiative } from '#src/utils/enums/application';
import { DraftCode } from '#src/utils/enums/projectCommon';

import type { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  Draft,
  ElectrificationProject,
  ElectrificationProjectIntake,
  ElectrificationProjectSearchParameters,
  ElectrificationProjectStatistics,
  LocalContext,
  StatisticsFilters
} from '#types';

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
  vi.clearAllMocks();
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  res.locals.currentAuthorization = TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR;
});

describe('createElectrificationProjectController', () => {
  const createSpy = vi.spyOn(electrificationProjectService, 'createElectrificationProjectService');

  it('calls the service with body and context then responds 201', async () => {
    const req = {
      body: TEST_ELECTRIFICATION_INTAKE
    } as unknown as Request<never, never, ElectrificationProjectIntake>;

    createSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_CREATE);

    await createElectrificationProjectController(req, res as unknown as Response<ElectrificationProject, LocalContext>);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(TEST_ELECTRIFICATION_INTAKE, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_CREATE);
  });

  it('provides empty body when POST body is undefined', async () => {
    const req = {
      body: undefined
    } as unknown as Request<never, never, ElectrificationProjectIntake>;

    createSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_CREATE);

    await createElectrificationProjectController(req, res as unknown as Response<ElectrificationProject, LocalContext>);

    expect(createSpy).toHaveBeenCalledWith({}, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('deleteElectrificationProjectController', () => {
  const getSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProjectService');
  const deleteSpy = vi.spyOn(activityService, 'deleteActivityService');

  it('fetches project and deletes activity then responds 204', async () => {
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    } as unknown as Request<{ electrificationProjectId: string }>;

    getSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1 as ElectrificationProject);
    deleteSpy.mockResolvedValue(undefined);

    await deleteElectrificationProjectController(req, res as unknown as Response);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.electrificationProjectId);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_1.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getElectrificationProjectController', () => {
  const getSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProjectService');

  it('calls the service with projectId then responds 200', async () => {
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    } as unknown as Request<{ electrificationProjectId: string }>;

    getSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1 as ElectrificationProject);

    await getElectrificationProjectController(req, res as unknown as Response<ElectrificationProject>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.electrificationProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_1);
  });
});

describe('getElectrificationProjectStatisticsController', () => {
  const statsSpy = vi.spyOn(electrificationProjectService, 'getElectrificationProjectStatisticsService');

  it('calls the service with query filters then responds 200', async () => {
    const mockStats = {
      count: 5,
      new: 2,
      inProgress: 2,
      submitted: 1
    } as unknown as ElectrificationProjectStatistics;

    const req = {
      query: { applicationsStatus: 'NEW' }
    } as unknown as Request<never, never, never, StatisticsFilters>;

    statsSpy.mockResolvedValue([mockStats]);

    await getElectrificationProjectStatisticsController(
      req,
      res as unknown as Response<ElectrificationProjectStatistics>
    );

    expect(statsSpy).toHaveBeenCalledTimes(1);
    expect(statsSpy).toHaveBeenCalledWith({ applicationsStatus: 'NEW' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStats);
  });
});

describe('listElectrificationProjectActivityIdsController', () => {
  const listIdsSpy = vi.spyOn(electrificationProjectService, 'listElectrificationProjectActivityIdsService');

  it('calls the service and responds 200', async () => {
    const mockIds = ['ACTI1234', 'ACTI5678'];
    const req = {} as unknown as Request;

    listIdsSpy.mockResolvedValue(mockIds);

    await listElectrificationProjectActivityIdsController(req, res as unknown as Response);

    expect(listIdsSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockIds);
  });
});

describe('listElectrificationProjectsController', () => {
  const listSpy = vi.spyOn(electrificationProjectService, 'listElectrificationProjectsService');

  it('calls the service with authorization and context then responds 200', async () => {
    const req = {} as unknown as Request;

    listSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1 as ElectrificationProject]);

    await listElectrificationProjectsController(
      req,
      res as unknown as Response<ElectrificationProject[], LocalContext>
    );

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1]);
  });
});

describe('searchElectrificationProjectsController', () => {
  const searchSpy = vi.spyOn(electrificationProjectService, 'searchElectrificationProjects');

  it('calls the service with search params and context then responds 200', async () => {
    const req = {
      body: { projectName: 'test' }
    } as unknown as Request<never, never, ElectrificationProjectSearchParameters | undefined, never>;

    searchSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1 as ElectrificationProject]);

    await searchElectrificationProjectsController(
      req,
      res as unknown as Response<ElectrificationProject[], LocalContext>
    );

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      expect.objectContaining({
        projectName: 'test',
        includeUser: undefined
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_PROJECT_1]);
  });

  it('coerces includeUser query parameter to boolean', async () => {
    const req = {
      body: { includeUser: 'true' }
    } as unknown as Request<never, never, ElectrificationProjectSearchParameters | undefined, never>;

    searchSpy.mockResolvedValue([TEST_ELECTRIFICATION_PROJECT_1 as ElectrificationProject]);

    await searchElectrificationProjectsController(
      req,
      res as unknown as Response<ElectrificationProject[], LocalContext>
    );

    expect(searchSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      expect.objectContaining({
        includeUser: true
      })
    );
  });
});

describe('updateElectrificationProjectController', () => {
  const updateSpy = vi.spyOn(electrificationProjectService, 'updateElectrificationProjectService');

  it('calls the service with update data and projectId then responds 200', async () => {
    const updateData = { projectName: 'Updated Name' };
    const req = {
      params: { electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      body: updateData
    } as unknown as Request<{ electrificationProjectId: string }, never, Prisma.electrification_projectUpdateInput>;

    updateSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_1 as ElectrificationProject);

    await updateElectrificationProjectController(req, res as unknown as Response);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(updateData, req.params.electrificationProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_1);
  });
});

describe('deleteElectrificationProjectDraftController', () => {
  const deleteSpy = vi.spyOn(draftService, 'deleteDraftService');

  it('calls the service with draftId then responds 204', async () => {
    const req = {
      params: { draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102' }
    } as unknown as Request<{ draftId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteElectrificationProjectDraftController(req, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getElectrificationProjectDraftController', () => {
  const getSpy = vi.spyOn(draftService, 'getDraftService');

  it('calls the service with draftId then responds 200', async () => {
    const req = {
      params: { draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102' }
    } as unknown as Request<{ draftId: string }>;

    getSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await getElectrificationProjectDraftController(req, res as unknown as Response<Draft>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_DRAFT);
  });
});

describe('getElectrificationProjectDraftsController', () => {
  const listSpy = vi.spyOn(draftService, 'listDraftsService');

  it('calls the service with authorization, context and draft code then responds 200', async () => {
    const req = {} as unknown as Request;

    listSpy.mockResolvedValue([TEST_ELECTRIFICATION_DRAFT]);

    await getElectrificationProjectDraftsController(req, res as unknown as Response<Draft[], LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      DraftCode.ELECTRIFICATION_PROJECT
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_ELECTRIFICATION_DRAFT]);
  });
});

describe('submitElectrificationProjectDraftController', () => {
  const submitSpy = vi.spyOn(electrificationProjectService, 'submitElectrificationProjectDraftService');

  it('calls the service with draft and context then responds 201', async () => {
    const req = {
      body: {
        ...TEST_ELECTRIFICATION_INTAKE,
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102'
      }
    } as unknown as Request<never, never, ElectrificationProjectIntake>;

    submitSpy.mockResolvedValue(TEST_ELECTRIFICATION_PROJECT_CREATE);

    await submitElectrificationProjectDraftController(
      req,
      res as unknown as Response<ElectrificationProject, LocalContext>
    );

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith(
      req.body.draftId,
      req.body,
      TEST_ELECTRIFICATION_INTAKE.contact,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_CREATE);
  });
});

describe('upsertElectrificationProjectDraftController', () => {
  const upsertSpy = vi.spyOn(draftService, 'upsertDraftService');

  it('calls the service with draft data and draft code, responds 201 when creating', async () => {
    const req = {
      body: {
        ...TEST_ELECTRIFICATION_DRAFT,
        draftId: undefined
      }
    } as unknown as Request<never, never, Draft>;

    upsertSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await upsertElectrificationProjectDraftController(req, res as unknown as Response<Draft, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        draftId: undefined
      }),
      Initiative.ELECTRIFICATION,
      DraftCode.ELECTRIFICATION_PROJECT,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_DRAFT);
  });

  it('calls the service and responds 200 when updating', async () => {
    const req = {
      body: TEST_ELECTRIFICATION_DRAFT
    } as unknown as Request<never, never, Draft>;

    upsertSpy.mockResolvedValue(TEST_ELECTRIFICATION_DRAFT);

    await upsertElectrificationProjectDraftController(req, res as unknown as Response<Draft, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      TEST_ELECTRIFICATION_DRAFT.draftId,
      TEST_ELECTRIFICATION_DRAFT,
      Initiative.ELECTRIFICATION,
      DraftCode.ELECTRIFICATION_PROJECT,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_ELECTRIFICATION_DRAFT);
  });
});
