import {
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_HOUSING_DRAFT,
  TEST_HOUSING_PROJECT_1,
  TEST_HOUSING_PROJECT_CREATE,
  TEST_HOUSING_PROJECT_INTAKE
} from '#tests/unit/data/index';
import {
  createHousingProjectController,
  deleteHousingProjectController,
  deleteHousingProjectDraftController,
  getHousingProjectController,
  getHousingProjectDraftController,
  getHousingProjectDraftsController,
  getHousingProjectStatisticsController,
  listHousingProjectActivityIdsController,
  listHousingProjectsController,
  patchHousingProjectController,
  searchHousingProjectsController,
  submitHousingProjectDraftController,
  upsertHousingProjectDraftController
} from '#src/controllers/housingProject';
import * as activityService from '#src/services/activity';
import * as draftService from '#src/services/draft';
import * as housingProjectService from '#src/services/housingProject';
import { Initiative } from '#src/utils/enums/application';
import { DraftCode } from '#src/utils/enums/projectCommon';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type {
  Draft,
  HousingProject,
  HousingProjectStatistics,
  SearchHousingProjectRequest,
  LocalContext,
  PatchHousingProjectRequest,
  GetHousingProjectStatisticsRequest,
  SubmitHousingProjectDraftRequest,
  UpsertHousingProjectDraftRequest
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

describe('createHousingProjectController', () => {
  const createSpy = vi.spyOn(housingProjectService, 'createHousingProjectService');

  it('calls the service with context (body is always empty and ignored) then responds 201', async () => {
    const req = {} as unknown as Request;

    createSpy.mockResolvedValue(TEST_HOUSING_PROJECT_CREATE);

    await createHousingProjectController(req, res as unknown as Response<HousingProject, LocalContext>);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_PROJECT_CREATE);
  });
});

describe('deleteHousingProjectController', () => {
  const getSpy = vi.spyOn(housingProjectService, 'getHousingProjectService');
  const deleteSpy = vi.spyOn(activityService, 'deleteActivityService');

  it('fetches project and deletes activity then responds 204', async () => {
    const req = {
      params: { housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    } as unknown as Request<{ housingProjectId: string }>;

    getSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1 as HousingProject);
    deleteSpy.mockResolvedValue(undefined);

    await deleteHousingProjectController(req, res as unknown as Response);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.housingProjectId);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(TEST_HOUSING_PROJECT_1.activityId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getHousingProjectController', () => {
  const getSpy = vi.spyOn(housingProjectService, 'getHousingProjectService');

  it('calls the service with projectId then responds 200', async () => {
    const req = {
      params: { housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' }
    } as unknown as Request<{ housingProjectId: string }>;

    getSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1 as HousingProject);

    await getHousingProjectController(req, res as unknown as Response<HousingProject>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.housingProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_PROJECT_1);
  });
});

describe('getHousingProjectStatisticsController', () => {
  const statsSpy = vi.spyOn(housingProjectService, 'getHousingProjectStatisticsService');

  it('calls the service with query filters then responds 200', async () => {
    const mockStats = {
      count: 5,
      new: 2,
      inProgress: 2,
      submitted: 1
    } as unknown as HousingProjectStatistics;

    const req = {
      query: { applicationsStatus: 'NEW' }
    } as unknown as Request<never, never, never, GetHousingProjectStatisticsRequest>;

    statsSpy.mockResolvedValue([mockStats]);

    await getHousingProjectStatisticsController(req, res as unknown as Response<HousingProjectStatistics>);

    expect(statsSpy).toHaveBeenCalledTimes(1);
    expect(statsSpy).toHaveBeenCalledWith({ applicationsStatus: 'NEW' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStats);
  });
});

describe('listHousingProjectActivityIdsController', () => {
  const listIdsSpy = vi.spyOn(housingProjectService, 'listHousingProjectActivityIdsService');

  it('calls the service and responds 200', async () => {
    const mockIds = ['ACTI1234', 'ACTI5678'];
    const req = {} as unknown as Request;

    listIdsSpy.mockResolvedValue(mockIds);

    await listHousingProjectActivityIdsController(req, res as unknown as Response);

    expect(listIdsSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockIds);
  });
});

describe('listHousingProjectsController', () => {
  const listSpy = vi.spyOn(housingProjectService, 'listHousingProjectsService');

  it('calls the service with authorization and context then responds 200', async () => {
    const req = {} as unknown as Request;

    listSpy.mockResolvedValue([TEST_HOUSING_PROJECT_1 as HousingProject]);

    await listHousingProjectsController(req, res as unknown as Response<HousingProject[], LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_PROJECT_1]);
  });
});

describe('searchHousingProjectsController', () => {
  const searchSpy = vi.spyOn(housingProjectService, 'searchHousingProjects');

  it('calls the service with search params and context then responds 200', async () => {
    const req = {
      body: { projectName: 'test' }
    } as unknown as Request<never, never, SearchHousingProjectRequest, never>;

    searchSpy.mockResolvedValue([TEST_HOUSING_PROJECT_1 as HousingProject]);

    await searchHousingProjectsController(req, res as unknown as Response<HousingProject[], LocalContext>);

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
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_PROJECT_1]);
  });

  it('coerces includeUser query parameter to boolean', async () => {
    const req = {
      body: { includeUser: 'true' }
    } as unknown as Request<never, never, SearchHousingProjectRequest, never>;

    searchSpy.mockResolvedValue([TEST_HOUSING_PROJECT_1 as HousingProject]);

    await searchHousingProjectsController(req, res as unknown as Response<HousingProject[], LocalContext>);

    expect(searchSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      expect.objectContaining({
        includeUser: true
      })
    );
  });
});

describe('patchHousingProjectController', () => {
  const updateSpy = vi.spyOn(housingProjectService, 'patchHousingProjectService');

  it('calls the service with update data and projectId then responds 200', async () => {
    const updateData = { projectName: 'Updated Name' };
    const req = {
      params: { housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b' },
      body: updateData
    } as unknown as Request<{ housingProjectId: string }, never, PatchHousingProjectRequest>;

    updateSpy.mockResolvedValue(TEST_HOUSING_PROJECT_1 as HousingProject);

    await patchHousingProjectController(req, res as unknown as Response);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(req.params.housingProjectId, updateData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_PROJECT_1);
  });
});

describe('deleteHousingProjectDraftController', () => {
  const deleteSpy = vi.spyOn(draftService, 'deleteDraftService');

  it('calls the service with draftId then responds 204', async () => {
    const req = {
      params: { draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102' }
    } as unknown as Request<{ draftId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteHousingProjectDraftController(req, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getHousingProjectDraftController', () => {
  const getSpy = vi.spyOn(draftService, 'getDraftService');

  it('calls the service with draftId then responds 200', async () => {
    const req = {
      params: { draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102' }
    } as unknown as Request<{ draftId: string }>;

    getSpy.mockResolvedValue(TEST_HOUSING_DRAFT);

    await getHousingProjectDraftController(req, res as unknown as Response<Draft>);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(req.params.draftId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_DRAFT);
  });
});

describe('getHousingProjectDraftsController', () => {
  const listSpy = vi.spyOn(draftService, 'listDraftsService');

  it('calls the service with authorization, context and draft code then responds 200', async () => {
    const req = {} as unknown as Request;

    listSpy.mockResolvedValue([TEST_HOUSING_DRAFT]);

    await getHousingProjectDraftsController(req, res as unknown as Response<Draft[], LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      DraftCode.HOUSING_PROJECT
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_HOUSING_DRAFT]);
  });
});

describe('submitHousingProjectDraftController', () => {
  const submitSpy = vi.spyOn(housingProjectService, 'submitHousingProjectDraftService');

  it('calls the service with draft and context then responds 201', async () => {
    const req = {
      body: {
        ...TEST_HOUSING_PROJECT_INTAKE,
        draftId: '0a339ab8-4a87-42d9-8d83-5f169de4a102'
      }
    } as unknown as Request<never, never, SubmitHousingProjectDraftRequest>;

    submitSpy.mockResolvedValue(TEST_HOUSING_PROJECT_CREATE);

    await submitHousingProjectDraftController(req, res as unknown as Response<HousingProject, LocalContext>);

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith(
      req.body.draftId,
      req.body,
      TEST_HOUSING_PROJECT_INTAKE.contact,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_PROJECT_CREATE);
  });
});

describe('upsertHousingProjectDraftController', () => {
  const upsertSpy = vi.spyOn(draftService, 'upsertDraftService');

  it('calls the service with draft data and draft code, responds 201 when creating', async () => {
    const req = {
      body: {
        data: TEST_HOUSING_DRAFT.data,
        draftId: undefined
      }
    } as unknown as Request<never, never, UpsertHousingProjectDraftRequest>;

    upsertSpy.mockResolvedValue(TEST_HOUSING_DRAFT);

    await upsertHousingProjectDraftController(req, res as unknown as Response<Draft, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      undefined,
      { data: TEST_HOUSING_DRAFT.data },
      Initiative.HOUSING,
      DraftCode.HOUSING_PROJECT,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_DRAFT);
  });

  it('calls the service and responds 200 when updating', async () => {
    const req = {
      body: { draftId: TEST_HOUSING_DRAFT.draftId, data: TEST_HOUSING_DRAFT.data }
    } as unknown as Request<never, never, UpsertHousingProjectDraftRequest>;

    upsertSpy.mockResolvedValue(TEST_HOUSING_DRAFT);

    await upsertHousingProjectDraftController(req, res as unknown as Response<Draft, LocalContext>);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(
      TEST_HOUSING_DRAFT.draftId,
      { data: TEST_HOUSING_DRAFT.data },
      Initiative.HOUSING,
      DraftCode.HOUSING_PROJECT,
      TEST_CURRENT_CONTEXT
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_HOUSING_DRAFT);
  });
});
