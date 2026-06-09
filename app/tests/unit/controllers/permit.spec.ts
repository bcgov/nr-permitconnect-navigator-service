import config from 'config';

import {
  TEST_ACTIVITY_CONTACT_1,
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_ACTIVITY_HOUSING,
  TEST_ELECTRIFICATION_PROJECT_1,
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_HOUSING_PROJECT_1,
  TEST_IDIR_USER_1,
  TEST_INITIATIVE_HOUSING,
  TEST_INITIATIVE_ELECTRIFICATION,
  TEST_PERMIT_1,
  TEST_PERMIT_LIST,
  TEST_PERMIT_TYPE_1,
  TEST_PERMIT_TYPE_LIST,
  TEST_EMAIL_RESPONSE,
  TEST_PERMIT_NOTE_UPDATE
} from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { codeTable } from '../../../src/db/codes/cache';
import { PermitStage, PermitState } from '../../../src/db/codes/enums.ts';
import {
  deletePermitController,
  getPermitController,
  getPermitTypesController,
  listPermitsController,
  searchPermitsController,
  upsertPermitController,
  sendPermitUpdateEmail,
  sendPermitUpdateNotifications
} from '../../../src/controllers/permit.ts';
import * as emailService from '../../../src/services/email.ts';
import * as permitService from '../../../src/services/permit.ts';
import * as permitNoteService from '../../../src/services/permitNote.ts';
import * as projectService from '../../../src/services/project.ts';
import * as sourceSystemKindService from '../../../src/services/sourceSystemKind.ts';
import * as userService from '../../../src/services/user.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { PermitNeeded } from '../../../src/utils/enums/permit.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';
import { permitNoteUpdateTemplate, navPermitStatusUpdateTemplate } from '../../../src/utils/templates.ts';

import type { Request, Response } from 'express';
import type { Mock, MockInstance } from 'vitest';
import type {
  ListPermitsOptions,
  Permit,
  PermitUpdateEmailParams,
  SearchPermitsOptions
} from '../../../src/types/index.ts';

vi.mock('config');

vi.mock('../../../src/utils/templates.ts', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>; // nosonar
  return {
    ...actual,
    navPermitStatusUpdateTemplate: vi.fn(() => 'NAV_TEMPLATE_BODY'),
    permitNoteUpdateTemplate: vi.fn(() => 'NOTE_TEMPLATE_BODY'),
    initialPeachPermitUpdateTemplate: vi.fn(() => 'PEACH_TEMPLATE_BODY')
  };
});

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock; end?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();

beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('deletePermitController', () => {
  const deleteSpy = vi.spyOn(permitService, 'deletePermit');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    deleteSpy.mockResolvedValue();

    await deletePermitController(req as unknown as Request<{ permitId: string }>, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(prismaTxMock, req.params.permitId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('getPermitController', () => {
  const getSpy = vi.spyOn(permitService, 'getPermit');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      params: { permitId: '1381438d-0c7a-46bf-8ae2-d1febbf27066' }
    };

    getSpy.mockResolvedValue(TEST_PERMIT_1);

    await getPermitController(req as unknown as Request<{ permitId: string }>, res as unknown as Response);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(prismaTxMock, '1381438d-0c7a-46bf-8ae2-d1febbf27066');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_1);
  });
});

describe('getPermitTypesController', () => {
  const permitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT,
      query: { initiative: Initiative.HOUSING }
    };

    permitTypesSpy.mockResolvedValue(TEST_PERMIT_TYPE_LIST);

    await getPermitTypesController(
      req as unknown as Request<never, never, never, { initiative: Initiative }>,
      res as unknown as Response
    );

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(permitTypesSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_TYPE_LIST);
  });
});

describe('listPermitsController', () => {
  const listSpy = vi.spyOn(permitService, 'listPermits');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { activityId: 'ACTI1234' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    listSpy.mockResolvedValue(TEST_PERMIT_LIST);

    await listPermitsController(
      req as unknown as Request<never, never, never, Partial<ListPermitsOptions>>,
      res as unknown as Response
    );

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_LIST);
  });

  it('should include notes if requested', async () => {
    const now = new Date();
    const req = {
      query: { activityId: 'ACTI1234', includeNotes: 'true' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const permitList = [
      {
        ...TEST_PERMIT_1,
        permitNotes: [
          {
            permitNoteId: 'NOTE123',
            permitId: '12345',
            note: 'A sample note',
            createdAt: now.toISOString(),
            createdBy: 'abc-123'
          }
        ]
      }
    ];

    listSpy.mockResolvedValue(permitList);

    await listPermitsController(
      req as unknown as Request<never, never, never, Partial<ListPermitsOptions>>,
      res as unknown as Response
    );

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, {
      activityId: 'ACTI1234',
      includeNotes: true
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(permitList);
  });
});

describe('searchPermitsController', () => {
  const searchSpy = vi.spyOn(permitService, 'searchPermitsPaginated');

  it('should call services and respond with 200 and paginated results', async () => {
    const req = {
      query: {
        dateRange: ['2024-01-01', '2024-12-31'],
        permitTypeId: '123',
        searchTag: 'test',
        skip: '0',
        take: '10',
        sortField: 'submittedDate',
        sortOrder: 'asc'
      },
      currentContext: {
        ...TEST_CURRENT_CONTEXT,
        initiative: Initiative.HOUSING
      }
    };

    const mockResponse = {
      permits: TEST_PERMIT_LIST,
      totalRecords: 25
    };

    searchSpy.mockResolvedValue(mockResponse);

    await searchPermitsController(
      req as unknown as Request<never, never, never, SearchPermitsOptions>,
      res as unknown as Response
    );

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle empty query parameters', async () => {
    const req = {
      query: {},
      currentContext: {
        ...TEST_CURRENT_CONTEXT,
        initiative: Initiative.ELECTRIFICATION
      }
    };

    const mockResponse = {
      permits: [],
      totalRecords: 0
    };

    searchSpy.mockResolvedValue(mockResponse);

    await searchPermitsController(
      req as unknown as Request<never, never, never, SearchPermitsOptions>,
      res as unknown as Response
    );

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.ELECTRIFICATION, {});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle partial query parameters', async () => {
    const req = {
      query: {
        permitTypeId: '456',
        skip: '10',
        take: '20'
      },
      currentContext: {
        ...TEST_CURRENT_CONTEXT,
        initiative: Initiative.HOUSING
      }
    };

    const mockResponse = {
      permits: [TEST_PERMIT_1],
      totalRecords: 1
    };

    searchSpy.mockResolvedValue(mockResponse);

    await searchPermitsController(
      req as unknown as Request<never, never, never, SearchPermitsOptions>,
      res as unknown as Response
    );

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING, req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it('should throw 400 error when initiative is PCNS', async () => {
    const req = {
      query: {
        permitTypeId: '123'
      },
      currentContext: {
        ...TEST_CURRENT_CONTEXT,
        initiative: Initiative.PCNS
      }
    };

    await expect(
      searchPermitsController(
        req as unknown as Request<never, never, never, SearchPermitsOptions>,
        res as unknown as Response
      )
    ).rejects.toThrow();

    expect(searchSpy).not.toHaveBeenCalled();
  });
});

describe('upsertPermitController', () => {
  const upsertSpy = vi.spyOn(permitService, 'upsertPermit');
  const getSourceSystemKindsSpy = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

  it('should call services and respond with 200 and result', async () => {
    const now = new Date();
    const req = {
      body: {
        permitType: 'ABC',
        permitTypeId: 1,
        activityId: '165E5F7F',
        issuedPermitId: '1',
        trackingId: '2',
        state: PermitState.IN_PROGRESS,
        needed: PermitNeeded.YES,
        stage: PermitStage.PRE_SUBMISSION,
        submittedDate: now,
        decisionDate: now
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    upsertSpy.mockResolvedValue(TEST_PERMIT_1);
    getSourceSystemKindsSpy.mockResolvedValue([]);

    await upsertPermitController(req as unknown as Request<never, never, Permit>, res as unknown as Response);

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith(prismaTxMock, {
      ...req.body,
      permitId: expect.stringMatching(uuidv4Pattern) as string,
      permitNote: undefined,
      permitTracking: undefined,
      permitType: undefined,
      createdAt: expect.any(Date) as Date,
      createdBy: TEST_CURRENT_CONTEXT.userId,
      updatedAt: expect.any(Date) as Date,
      updatedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_1);
  });
});

describe('sendPermitUpdateEmail', () => {
  let emailSpy: MockInstance<typeof emailService.email>;

  beforeEach(() => {
    emailSpy = vi.spyOn(emailService, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE);
  });

  it('builds the template context and sends an email', async () => {
    (config.get as Mock).mockImplementation((key: string) => {
      if (key === 'server.ches.submission.cc') return 'noreply@example.com';
      return '';
    });

    const templateMock = vi.fn().mockReturnValue('<html>email body</html>');

    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-01-01'
    };

    const job: PermitUpdateEmailParams = {
      permit,
      initiative: Initiative.ELECTRIFICATION,
      dearName: 'Jane Navigator',
      projectId: 'proj-123',
      toEmails: ['nav@example.com'],
      emailTemplate: templateMock
    };

    await sendPermitUpdateEmail(job);

    expect(templateMock).toHaveBeenCalledTimes(1);
    const ctxArg = templateMock.mock.calls[0][0];
    expect(ctxArg).toMatchObject({
      activityId: permit.activityId,
      dearName: 'Jane Navigator',
      initiative: 'electrification',
      permitId: permit.permitId,
      permitName: 'PERMIT1',
      projectId: 'proj-123',
      submittedDate: 'January 1, 2024'
    });

    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['nav@example.com'],
        from: 'noreply@example.com',
        cc: ['noreply@example.com'],
        subject: `Updates for project ${permit.activityId}, PERMIT1`,
        bodyType: 'html',
        body: '<html>email body</html>'
      })
    );
  });
});

describe('createNoteAndSendUpdateEmails', () => {
  const getProjectSpy = vi.spyOn(projectService, 'getProjectByActivityId');
  const readUserSpy = vi.spyOn(userService, 'readUser').mockResolvedValue(TEST_IDIR_USER_1);
  const createNoteSpy = vi.spyOn(permitNoteService, 'createPermitNote').mockResolvedValue(TEST_PERMIT_NOTE_UPDATE);
  let emailSpy: MockInstance<typeof emailService.email>;

  beforeEach(() => {
    emailSpy = vi.spyOn(emailService, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE);
    (navPermitStatusUpdateTemplate as Mock).mockClear();
    (permitNoteUpdateTemplate as Mock).mockClear();
    (config.get as Mock).mockImplementation((key: string) => {
      if (key === 'server.pcns.navEmail') return 'navteam@example.com';
      if (key === 'server.ches.submission.cc') return 'noreply@example.com';
      return '';
    });

    getProjectSpy.mockResolvedValue({
      ...TEST_ELECTRIFICATION_PROJECT_1,
      projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
      assignedUserId: TEST_IDIR_USER_1.userId,
      activity: {
        ...TEST_ACTIVITY_ELECTRIFICATION,
        activityContact: [{ ...TEST_ACTIVITY_CONTACT_1, contact: TEST_CONTACT_1 }],
        initiative: TEST_INITIATIVE_ELECTRIFICATION
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates notes and enqueues both navigator and proponent emails when contact email exists', async () => {
    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-01-01'
    };
    const stateDisplay = codeTable.PermitState.displays[permit.state];
    const stageDisplay = codeTable.PermitStage.displays[permit.stage];

    await sendPermitUpdateNotifications(permit, true);

    expect(getProjectSpy).toHaveBeenCalledWith(prismaTxMock, permit.activityId);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permit.permitId,
        note: `This application is ${stateDisplay.toLocaleLowerCase()} in the ${stageDisplay.toLocaleLowerCase()}.`
      })
    );

    expect(emailSpy).toHaveBeenCalledTimes(2);

    expect(navPermitStatusUpdateTemplate).toHaveBeenCalledTimes(1);
    expect(navPermitStatusUpdateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: permit.activityId,
        dearName: `${TEST_IDIR_USER_1.firstName} ${TEST_IDIR_USER_1.lastName}`,
        initiative: Initiative.ELECTRIFICATION.toLowerCase(),
        permitId: permit.permitId,
        projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
      })
    );

    expect(permitNoteUpdateTemplate).toHaveBeenCalledTimes(1);
    expect(permitNoteUpdateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: permit.activityId,
        dearName: TEST_CONTACT_1.firstName,
        initiative: Initiative.ELECTRIFICATION.toLowerCase(),
        permitId: permit.permitId,
        projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
      })
    );

    const firstEmail = emailSpy.mock.calls[0][0];
    const secondEmail = emailSpy.mock.calls[1][0];

    expect(firstEmail).toMatchObject({
      to: ['navteam@example.com'],
      body: 'NAV_TEMPLATE_BODY'
    });

    expect(secondEmail).toMatchObject({
      to: [TEST_CONTACT_1.email],
      body: 'NOTE_TEMPLATE_BODY'
    });
  });

  it('skips proponent email when contact email is missing but still sends navigator email', async () => {
    getProjectSpy.mockResolvedValueOnce({
      ...TEST_ELECTRIFICATION_PROJECT_1,
      projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
      assignedUserId: 'user-2',
      activity: {
        ...TEST_ACTIVITY_ELECTRIFICATION,
        activityContact: [
          { ...TEST_ACTIVITY_CONTACT_1, contact: { ...TEST_CONTACT_1, firstName: 'NoEmail', email: null } }
        ],
        initiative: TEST_INITIATIVE_ELECTRIFICATION
      }
    });

    (readUserSpy as Mock).mockResolvedValueOnce({
      ...TEST_IDIR_USER_1,
      firstName: 'Another',
      lastName: 'Navigator'
    });

    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-02-01'
    };

    await sendPermitUpdateNotifications(permit, true);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);

    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(navPermitStatusUpdateTemplate).toHaveBeenCalledTimes(1);
    expect(navPermitStatusUpdateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        dearName: 'Another Navigator',
        projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
      })
    );
    expect(permitNoteUpdateTemplate).not.toHaveBeenCalled();

    const email = emailSpy.mock.calls[0][0];
    expect(email).toMatchObject({
      to: ['navteam@example.com'],
      body: 'NAV_TEMPLATE_BODY'
    });
  });

  it('creates notes and email jobs for HOUSING initiative', async () => {
    getProjectSpy.mockResolvedValueOnce({
      ...TEST_HOUSING_PROJECT_1,
      projectId: TEST_HOUSING_PROJECT_1.housingProjectId,
      assignedUserId: TEST_IDIR_USER_1.userId,
      activity: {
        ...TEST_ACTIVITY_HOUSING,
        activityContact: [{ ...TEST_ACTIVITY_CONTACT_1, contact: TEST_CONTACT_1 }],
        initiative: TEST_INITIATIVE_HOUSING
      }
    });

    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-03-01'
    };

    await sendPermitUpdateNotifications(permit, true);

    expect(getProjectSpy).toHaveBeenCalledWith(prismaTxMock, permit.activityId);

    expect(readUserSpy).toHaveBeenCalledWith(prismaTxMock, TEST_IDIR_USER_1.userId);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);

    expect(emailSpy).toHaveBeenCalledTimes(2);

    expect(navPermitStatusUpdateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        dearName: `${TEST_IDIR_USER_1.firstName} ${TEST_IDIR_USER_1.lastName}`,
        initiative: Initiative.HOUSING.toLowerCase(),
        projectId: TEST_HOUSING_PROJECT_1.housingProjectId
      })
    );

    expect(permitNoteUpdateTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        dearName: TEST_CONTACT_1.firstName,
        initiative: Initiative.HOUSING.toLowerCase(),
        projectId: TEST_HOUSING_PROJECT_1.housingProjectId
      })
    );

    const firstEmail = emailSpy.mock.calls[0][0];
    const secondEmail = emailSpy.mock.calls[1][0];

    expect(firstEmail).toMatchObject({
      to: ['navteam@example.com'],
      body: 'NAV_TEMPLATE_BODY'
    });

    expect(secondEmail).toMatchObject({
      to: [TEST_CONTACT_1.email],
      body: 'NOTE_TEMPLATE_BODY'
    });
  });

  it('throws an error if permit.state or permit.stage is invalid', async () => {
    getProjectSpy.mockResolvedValueOnce({
      ...TEST_ELECTRIFICATION_PROJECT_1,
      projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
      assignedUserId: TEST_IDIR_USER_1.userId,
      activity: {
        ...TEST_ACTIVITY_ELECTRIFICATION,
        activityContact: [{ ...TEST_ACTIVITY_CONTACT_1, contact: TEST_CONTACT_1 }],
        initiative: TEST_INITIATIVE_ELECTRIFICATION
      }
    });

    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-01-01',

      state: 'INVALID_STATE',
      stage: 'INVALID_STAGE'
    };

    await expect(sendPermitUpdateNotifications(permit, true)).rejects.toThrow(
      /Invalid permit\.state: INVALID_STATE or permit\.stage: INVALID_STAGE/
    );
  });
});
