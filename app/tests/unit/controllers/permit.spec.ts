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
import {
  deletePermitController,
  getPermitController,
  getPermitTypesController,
  listPermitsController,
  upsertPermitController,
  sendPermitUpdateNotification,
  sendPermitUpdateEmail
} from '../../../src/controllers/permit.ts';
import * as permitController from '../../../src/controllers/permit.ts';
import * as permitService from '../../../src/services/permit.ts';
import * as projectService from '../../../src/services/project.ts';
import * as userService from '../../../src/services/user.ts';
import * as permitNoteService from '../../../src/services/permitNote.ts';
import * as emailService from '../../../src/services/email.ts';
import * as sourceSystemKindService from '../../../src/services/sourceSystemKind.ts';
import * as txWrapper from '../../../src/db/utils/transactionWrapper.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';
import { PermitNeeded, PermitStage, PermitState } from '../../../src/utils/enums/permit.ts';
import { permitNoteUpdateTemplate, navPermitStatusUpdateTemplate } from '../../../src/utils/templates.ts';

import type { Request, Response } from 'express';
import type { ListPermitsOptions, Permit, PermitUpdateEmailParams } from '../../../src/types/index.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
let txWrapperSpy: jest.SpyInstance;

beforeEach(() => {
  res = mockResponse();
  txWrapperSpy = jest.spyOn(txWrapper, 'transactionWrapper').mockImplementation(async (fn) => fn(prismaTxMock));
});

afterEach(() => {
  txWrapperSpy.mockRestore();
  jest.clearAllMocks();
});

describe('deletePermitController', () => {
  const deleteSpy = jest.spyOn(permitService, 'deletePermit');

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
  const getSpy = jest.spyOn(permitService, 'getPermit');

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
  const permitTypesSpy = jest.spyOn(permitService, 'getPermitTypes');

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
  const listSpy = jest.spyOn(permitService, 'listPermits');

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

describe('upsertPermitController', () => {
  const upsertSpy = jest.spyOn(permitService, 'upsertPermit');
  const getSourceSystemKindsSpy = jest.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

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
  const emailSpy = jest.spyOn(emailService, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE);

  it('builds the template context and sends an email', async () => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'frontend.ches.submission.cc') return 'noreply@example.com';
      return '';
    });

    const templateMock = jest.fn().mockReturnValue('<html>email body</html>');

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

describe('sendPermitUpdateNotification', () => {
  const getProjectSpy = jest.spyOn(projectService, 'getProjectByActivityId');
  const readUserSpy = jest.spyOn(userService, 'readUser').mockResolvedValue(TEST_IDIR_USER_1);
  const createNoteSpy = jest.spyOn(permitNoteService, 'createPermitNote').mockResolvedValue(TEST_PERMIT_NOTE_UPDATE);
  const sendEmailJobSpy = jest.spyOn(permitController, 'sendPermitUpdateEmail');

  beforeEach(() => {
    (config.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'server.pcns.navEmail') return 'navteam@example.com';
      if (key === 'frontend.ches.submission.cc') return 'noreply@example.com';
      return '';
    });

    getProjectSpy.mockResolvedValue({
      ...TEST_ELECTRIFICATION_PROJECT_1,
      assignedUserId: TEST_IDIR_USER_1.userId,
      activity: {
        ...TEST_ACTIVITY_ELECTRIFICATION,
        activityContact: [{ ...TEST_ACTIVITY_CONTACT_1, contact: TEST_CONTACT_1 }],
        initiative: TEST_INITIATIVE_ELECTRIFICATION
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates notes and enqueues both navigator and proponent emails when contact email exists', async () => {
    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-01-01'
    };

    await sendPermitUpdateNotification(permit, true);

    expect(getProjectSpy).toHaveBeenCalledWith(prismaTxMock, permit.activityId);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(
      prismaTxMock,
      expect.objectContaining({
        permitId: permit.permitId,
        note: `This application is ${permit.state.toLocaleLowerCase()} in the ${permit.stage.toLocaleLowerCase()}.`
      })
    );

    expect(sendEmailJobSpy).toHaveBeenCalledTimes(2);

    const firstJob: PermitUpdateEmailParams = sendEmailJobSpy.mock.calls[0][0];
    const secondJob: PermitUpdateEmailParams = sendEmailJobSpy.mock.calls[1][0];

    expect(firstJob).toMatchObject({
      permit,
      initiative: Initiative.ELECTRIFICATION,
      dearName: `${TEST_IDIR_USER_1.firstName} ${TEST_IDIR_USER_1.lastName}`,
      projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
      toEmails: ['navteam@example.com'],
      emailTemplate: navPermitStatusUpdateTemplate
    });

    expect(secondJob).toMatchObject({
      permit,
      initiative: Initiative.ELECTRIFICATION,
      dearName: TEST_CONTACT_1.firstName,
      projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
      toEmails: [TEST_CONTACT_1.email],
      emailTemplate: permitNoteUpdateTemplate
    });
  });

  it('skips proponent email when contact email is missing but still sends navigator email', async () => {
    getProjectSpy.mockResolvedValueOnce({
      ...TEST_ELECTRIFICATION_PROJECT_1,
      assignedUserId: 'user-2',
      activity: {
        ...TEST_ACTIVITY_ELECTRIFICATION,
        activityContact: [
          { ...TEST_ACTIVITY_CONTACT_1, contact: { ...TEST_CONTACT_1, firstName: 'NoEmail', email: null } }
        ],
        initiative: TEST_INITIATIVE_ELECTRIFICATION
      }
    });

    (readUserSpy as jest.Mock).mockResolvedValueOnce({
      ...TEST_IDIR_USER_1,
      firstName: 'Another',
      lastName: 'Navigator'
    });

    const permit: Permit = {
      ...TEST_PERMIT_1,
      permitType: TEST_PERMIT_TYPE_1,
      submittedDate: '2024-02-01'
    };

    await sendPermitUpdateNotification(permit, true);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);

    expect(sendEmailJobSpy).toHaveBeenCalledTimes(1);
    const job: PermitUpdateEmailParams = sendEmailJobSpy.mock.calls[0][0];

    expect(job).toMatchObject({
      permit,
      dearName: 'Another Navigator',
      projectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
      toEmails: ['navteam@example.com'],
      emailTemplate: navPermitStatusUpdateTemplate
    });
  });

  it('creates notes and email jobs for HOUSING initiative', async () => {
    getProjectSpy.mockResolvedValueOnce({
      ...TEST_HOUSING_PROJECT_1,
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

    await sendPermitUpdateNotification(permit, true);

    expect(getProjectSpy).toHaveBeenCalledWith(prismaTxMock, permit.activityId);

    expect(readUserSpy).toHaveBeenCalledWith(prismaTxMock, TEST_IDIR_USER_1.userId);

    expect(createNoteSpy).toHaveBeenCalledTimes(1);

    expect(sendEmailJobSpy).toHaveBeenCalledTimes(2);

    const firstJob: PermitUpdateEmailParams = sendEmailJobSpy.mock.calls[0][0];
    const secondJob: PermitUpdateEmailParams = sendEmailJobSpy.mock.calls[1][0];

    expect(firstJob).toMatchObject({
      permit,
      initiative: Initiative.HOUSING,
      dearName: `${TEST_IDIR_USER_1.firstName} ${TEST_IDIR_USER_1.lastName}`,
      projectId: TEST_HOUSING_PROJECT_1.housingProjectId,
      toEmails: ['navteam@example.com'],
      emailTemplate: navPermitStatusUpdateTemplate
    });

    expect(secondJob).toMatchObject({
      permit,
      initiative: Initiative.HOUSING,
      dearName: TEST_CONTACT_1.firstName,
      projectId: TEST_HOUSING_PROJECT_1.housingProjectId,
      toEmails: [TEST_CONTACT_1.email],
      emailTemplate: permitNoteUpdateTemplate
    });
  });
});
