import {
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_GENERAL_DRAFT,
  TEST_GENERAL_PROJECT_1,
  TEST_GENERAL_PROJECT_CREATE,
  TEST_GENERAL_PROJECT_INTAKE
} from '../data/index.ts';
import {
  createGeneralProjectController,
  deleteGeneralProjectController,
  deleteGeneralProjectDraftController,
  getGeneralProjectController,
  getGeneralProjectDraftController,
  getGeneralProjectDraftsController,
  getGeneralProjectStatisticsController,
  listGeneralProjectActivityIdsController,
  listGeneralProjectsController,
  patchGeneralProjectController,
  searchGeneralProjectsController,
  submitGeneralProjectDraftController,
  upsertGeneralProjectDraftController
} from '../../../src/controllers/generalProject.ts';
import * as activityService from '../../../src/services/activity.ts';
import * as draftService from '../../../src/services/draft.ts';
import * as generalProjectService from '../../../src/services/generalProject.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { DraftCode } from '../../../src/utils/enums/projectCommon.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  Draft,
  GeneralProject,
  GeneralProjectIntake,
  SearchGeneralProjectRequest,
  GeneralProjectStatistics,
  LocalContext,
  PatchGeneralProjectRequest,
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
  vi.clearAllMocks();
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  res.locals.currentAuthorization = TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR;
});

describe('createGeneralProjectController', () => {
  const createSpy = vi.spyOn(generalProjectService, 'createGeneralProjectService');

  it('calls the service with body and context then responds 201', async () => {
    const req = {
      body: TEST_GENERAL_PROJECT_INTAKE
    } as unknown as Request<never, never, GeneralProjectIntake>;

    createSpy.mockResolvedValue(TEST_GENERAL_PROJECT_CREATE);

    await createGeneralProjectController(req, res as unknown as Response<GeneralProject, LocalContext>);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_INTAKE, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_CREATE);
  });

  it('provides empty body when POST body is undefined', async () => {
    const req = {
      body: undefined
    } as unknown as Request<never, never, GeneralProjectIntake>;

    createSpy.mockResolvedValue(TEST_GENERAL_PROJECT_CREATE);

    await createGeneralProjectController(req, res as unknown as Response<GeneralProject, LocalContext>);

    expect(createSpy).toHaveBeenCalledWith({}, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('deleteGeneralProjectController', () => {
  const getSpy = vi.spyOn(generalProjectService, 'getGeneralProjectService');
  const deleteSpy = vi.spyOn(activityService, 'deleteActivityService');

  it('fetches project and deletes activity then responds 204', async () => {
    const req = {
      params: { generalProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    } as unknown as Request<{ generalProjectId: string }>;

    getSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1 as GeneralProject);
    deleteSpy.mockResolvedValue(undefined);

    await deleteGeneralProjectController(req, res as unknown as Response);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.generalProjectId);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_1.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getGeneralProjectController', () => {
  const getSpy = vi.spyOn(generalProjectService, 'getGeneralProjectService');

  it('calls the service with projectId then responds 200', async () => {
    const req = {
      params: { generalProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    } as unknown as Request<{ generalProjectId: string }>;

    getSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1 as GeneralProject);

    await getGeneralProjectController(req, res as unknown as Response<GeneralProject>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.generalProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_1);
  });
});

describe('getGeneralProjectStatisticsController', () => {
  const statsSpy = vi.spyOn(generalProjectService, 'getGeneralProjectStatisticsService');

  it('calls the service with query filters then responds 200', async () => {
    const mockStats = {
      count: 5,
      new: 2,
      inProgress: 2,
      submitted: 1
    } as unknown as GeneralProjectStatistics;

    const req = {
      query: { applicationsStatus: 'NEW' }
    } as unknown as Request<never, never, never, StatisticsFilters>;

    statsSpy.mockResolvedValue([mockStats]);

    await getGeneralProjectStatisticsController(req, res as unknown as Response<GeneralProjectStatistics>);

    expect(statsSpy).toHaveBeenCalledTimes(1);
    expect(statsSpy).toHaveBeenCalledWith({ applicationsStatus: 'NEW' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStats);
  });
});

describe('listGeneralProjectActivityIdsController', () => {
  const listIdsSpy = vi.spyOn(generalProjectService, 'listGeneralProjectActivityIdsService');

  it('calls the service and responds 200', async () => {
    const mockIds = ['ACTI1234', 'ACTI5678'];
    const req = {} as unknown as Request;

    listIdsSpy.mockResolvedValue(mockIds);

    await listGeneralProjectActivityIdsController(req, res as unknown as Response);

    expect(listIdsSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockIds);
  });
});

describe('listGeneralProjectsController', () => {
  const listSpy = vi.spyOn(generalProjectService, 'listGeneralProjectsService');

  it('calls the service with authorization and context then responds 200', async () => {
    const req = {} as unknown as Request;

    listSpy.mockResolvedValue([TEST_GENERAL_PROJECT_1 as GeneralProject]);

    await listGeneralProjectsController(req, res as unknown as Response<GeneralProject[], LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_PROJECT_1]);
  });
});

describe('searchGeneralProjectsController', () => {
  const searchSpy = vi.spyOn(generalProjectService, 'searchGeneralProjects');

  it('calls the service with search params and context then responds 200', async () => {
    const req = {
      body: { projectName: 'test' }
    } as unknown as Request<never, never, SearchGeneralProjectRequest | undefined, never>;

    searchSpy.mockResolvedValue([TEST_GENERAL_PROJECT_1 as GeneralProject]);

    await searchGeneralProjectsController(req, res as unknown as Response<GeneralProject[], LocalContext>);

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
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_PROJECT_1]);
  });

  it('coerces includeUser query parameter to boolean', async () => {
    const req = {
      body: { includeUser: 'true' }
    } as unknown as Request<never, never, SearchGeneralProjectRequest | undefined, never>;

    searchSpy.mockResolvedValue([TEST_GENERAL_PROJECT_1 as GeneralProject]);

    await searchGeneralProjectsController(req, res as unknown as Response<GeneralProject[], LocalContext>);

    expect(searchSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      expect.objectContaining({
        includeUser: true
      })
    );
  });
});

describe('patchGeneralProjectController', () => {
  const updateSpy = vi.spyOn(generalProjectService, 'patchGeneralProjectService');

  it('calls the service with update data and projectId then responds 200', async () => {
    const updateData = { projectName: 'Updated Name' };
    const req = {
      params: { generalProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      body: updateData
    } as unknown as Request<{ generalProjectId: string }, never, PatchGeneralProjectRequest>;

    updateSpy.mockResolvedValue(TEST_GENERAL_PROJECT_1 as GeneralProject);

    await patchGeneralProjectController(req, res as unknown as Response);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(req.params.generalProjectId, updateData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_1);
  });
});

describe('deleteGeneralProjectDraftController', () => {
  const deleteSpy = vi.spyOn(draftService, 'deleteDraftService');

  it('calls the service with draftId then responds 204', async () => {
    const req = {
      params: { draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102' }
    } as unknown as Request<{ draftId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteGeneralProjectDraftController(req, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getGeneralProjectDraftController', () => {
  const getSpy = vi.spyOn(draftService, 'getDraftService');

  it('calls the service with draftId then responds 200', async () => {
    const req = {
      params: { draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102' }
    } as unknown as Request<{ draftId: string }>;

    getSpy.mockResolvedValue(TEST_GENERAL_DRAFT);

    await getGeneralProjectDraftController(req, res as unknown as Response<Draft>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_DRAFT);
  });
});

describe('getGeneralProjectDraftsController', () => {
  const listSpy = vi.spyOn(draftService, 'listDraftsService');

  it('calls the service with authorization, context and draft code then responds 200', async () => {
    const req = {} as unknown as Request;

    listSpy.mockResolvedValue([TEST_GENERAL_DRAFT]);

    await getGeneralProjectDraftsController(req, res as unknown as Response<Draft[], LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      DraftCode.GENERAL_PROJECT
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_GENERAL_DRAFT]);
  });
});

describe('submitGeneralProjectDraftController', () => {
  const submitSpy = vi.spyOn(generalProjectService, 'submitGeneralProjectDraftService');

  it('calls the service with draft and context then responds 201', async () => {
    const req = {
      body: {
        ...TEST_GENERAL_PROJECT_INTAKE,
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102'
      }
    } as unknown as Request<never, never, GeneralProjectIntake>;

    submitSpy.mockResolvedValue(TEST_GENERAL_PROJECT_CREATE);

    await submitGeneralProjectDraftController(req, res as unknown as Response<GeneralProject, LocalContext>);

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith(
      req.body.draftId,
      req.body,
      TEST_GENERAL_PROJECT_INTAKE.contact,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_PROJECT_CREATE);
  });
});

describe('upsertGeneralProjectDraftController', () => {
  const upsertSpy = vi.spyOn(draftService, 'upsertDraftService');

  it('calls the service with draft data and draft code, responds 201 when creating', async () => {
    const req = {
      body: {
        ...TEST_GENERAL_DRAFT,
        draftId: undefined
      }
    } as unknown as Request<never, never, Draft>;

    upsertSpy.mockResolvedValue(TEST_GENERAL_DRAFT);

    await upsertGeneralProjectDraftController(req, res as unknown as Response<Draft, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        draftId: undefined
      }),
      Initiative.GENERAL,
      DraftCode.GENERAL_PROJECT,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_DRAFT);
  });

  it('calls the service and responds 200 when updating', async () => {
    const req = {
      body: TEST_GENERAL_DRAFT
    } as unknown as Request<never, never, Draft>;

    upsertSpy.mockResolvedValue(TEST_GENERAL_DRAFT);

    await upsertGeneralProjectDraftController(req, res as unknown as Response<Draft, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      TEST_GENERAL_DRAFT.draftId,
      TEST_GENERAL_DRAFT,
      Initiative.GENERAL,
      DraftCode.GENERAL_PROJECT,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_GENERAL_DRAFT);
  });
});
