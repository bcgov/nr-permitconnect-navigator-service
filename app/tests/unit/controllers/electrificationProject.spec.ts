import electrificationProjectController from '../../../src/controllers/electrificationProject';
import {
  activityContactService,
  activityService,
  contactService,
  draftService,
  enquiryService,
  electrificationProjectService
} from '../../../src/services';
import { AuthType, Initiative } from '../../../src/utils/enums/application';
import { ProjectType } from '../../../src/utils/enums/electrification';
import { SubmissionType } from '../../../src/utils/enums/projectCommon';

import type { Draft, ElectrificationProject } from '../../../src/types';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

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

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const uuidv4Pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

const CURRENT_CONTEXT = { authType: AuthType.BEARER, tokenPayload: undefined, userId: 'abc-123' };

const ELECTRIFICATION_INTAKE = {
  project: {
    projectName: 'Test',
    projectDescription: 'Test description',
    companyNameRegistered: 'Company name',
    projectType: ProjectType.IPP_WIND,
    bcHydroNumber: '123',
    submissionType: SubmissionType.GUIDANCE
  },
  contacts: [
    {
      contactId: undefined,
      firstName: 'Test',
      lastName: 'Person',
      phoneNumber: null,
      email: null,
      contactPreference: null,
      contactApplicantRelationship: 'Property owner'
    }
  ],
  createdAt: new Date().toISOString(),
  createdBy: 'abc-123',
  updatedAt: new Date().toISOString(),
  updatedBy: 'abc-123'
};

const ELECTRIFICATION_PROJECT_1 = {
  project: {
    electrificationProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    activityId: '5183f223',
    assignedUserId: null,
    submittedAt: new Date().toISOString()
  },
  contacts: [
    {
      contactId: undefined,
      firstName: 'Test',
      lastName: 'Person',
      phoneNumber: null,
      email: null,
      contactPreference: null,
      contactApplicantRelationship: 'Property owner'
    }
  ],
  createdAt: new Date().toISOString(),
  createdBy: 'abc-123',
  updatedAt: new Date().toISOString(),
  updatedBy: 'abc-123'
};

describe('createElectrificationProject', () => {
  // Mock service calls
  const upsertContacts = jest.spyOn(contactService, 'upsertContacts');
  const createElectrificationProjectSpy = jest.spyOn(electrificationProjectService, 'createElectrificationProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');

  it('creates submission with unique activity ID', async () => {
    const req = {
      body: { ...ELECTRIFICATION_INTAKE },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    upsertContacts.mockResolvedValue();
    createActivitySpy.mockResolvedValue({
      activityId: '00000000',
      initiativeId: Initiative.ELECTRIFICATION,
      isDeleted: false
    });
    createElectrificationProjectSpy.mockResolvedValue({
      activityId: '00000000',
      electrificationProjectId: '11111111'
    } as ElectrificationProject);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.createElectrificationProject(req as any, res as any, next);

    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ activityId: '00000000', electrificationProjectId: '11111111' });
  });

  it('populates data from body if it exists', async () => {
    const req = {
      body: { ...ELECTRIFICATION_INTAKE },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    upsertContacts.mockResolvedValue();
    createActivitySpy.mockResolvedValue({
      activityId: '00000000',
      initiativeId: Initiative.ELECTRIFICATION,
      isDeleted: false
    });
    createElectrificationProjectSpy.mockResolvedValue({ activityId: '00000000' } as ElectrificationProject);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.createElectrificationProject(req as any, res as any, next);

    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...ELECTRIFICATION_INTAKE.project,
        electrificationProjectId: expect.stringMatching(uuidv4Pattern),
        activityId: '00000000',
        submittedAt: expect.stringMatching(isoPattern),
        submissionType: SubmissionType.GUIDANCE
      })
    );
  });
});

describe('getStatistics', () => {
  const next = jest.fn();

  // Mock service calls
  const statisticsSpy = jest.spyOn(electrificationProjectService, 'getStatistics');

  it('should return 200 if all good', async () => {
    const req = {
      query: {
        dateFrom: '',
        dateTo: '',
        monthYear: '',
        userId: ''
      },
      currentContext: CURRENT_CONTEXT
    };

    const statistics = [
      {
        stat_0: '0',
        stat_1: '1',
        stat_2: '2',
        stat_3: '3'
      }
    ];

    statisticsSpy.mockResolvedValue(statistics);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.getStatistics(req as any, res as any, next);

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(statistics[0]);
  });

  it('calls next if the submission service fails to get statistics', async () => {
    const req = {
      query: {
        dateFrom: '',
        dateTo: '',
        monthYear: '',
        userId: ''
      },
      currentContext: CURRENT_CONTEXT
    };

    statisticsSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.getStatistics(req as any, res as any, next);

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getElectrificationProject', () => {
  const next = jest.fn();

  // Mock service calls
  const electrificationProjectSpy = jest.spyOn(electrificationProjectService, 'getElectrificationProject');
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should return 200 if all good', async () => {
    const req = {
      params: { electrificationProjectId: 'SOMEID' },
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    electrificationProjectSpy.mockResolvedValue(ELECTRIFICATION_PROJECT_1 as any);
    getRelatedEnquiriesSpy.mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.getElectrificationProject(req as any, res as any, next);

    expect(electrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(electrificationProjectSpy).toHaveBeenCalledWith(req.params.electrificationProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(ELECTRIFICATION_PROJECT_1);
  });

  it('calls next if the submission service fails to get submission', async () => {
    const req = {
      params: { electrificationProjectId: 'SOMEID' },
      currentContext: CURRENT_CONTEXT
    };

    electrificationProjectSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.getElectrificationProject(req as any, res as any, next);

    expect(electrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(electrificationProjectSpy).toHaveBeenCalledWith(req.params.electrificationProjectId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getElectrificationProjects', () => {
  const next = jest.fn();

  // Mock service calls
  const electrificationProjectsSpy = jest.spyOn(electrificationProjectService, 'getElectrificationProjects');

  it('should return 200 if all good', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT,
      query: {}
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    electrificationProjectsSpy.mockResolvedValue([ELECTRIFICATION_PROJECT_1 as any]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.getElectrificationProjects(req as any, res as any, next);

    expect(electrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(electrificationProjectsSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([ELECTRIFICATION_PROJECT_1]);
  });

  it('calls next if the electrification service fails to get projects', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT
    };

    electrificationProjectsSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.getElectrificationProjects(req as any, res as any, next);

    expect(electrificationProjectsSpy).toHaveBeenCalledTimes(1);
    expect(electrificationProjectsSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('submitDraft', () => {
  // Mock service calls
  const upsertContacts = jest.spyOn(contactService, 'upsertContacts');
  const createElectrificationProjectSpy = jest.spyOn(electrificationProjectService, 'createElectrificationProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');

  it('populates data from body if it exists', async () => {
    const req = {
      body: { ...ELECTRIFICATION_INTAKE },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    upsertContacts.mockResolvedValue();
    createActivitySpy.mockResolvedValue({
      activityId: '00000000',
      initiativeId: Initiative.ELECTRIFICATION,
      isDeleted: false
    });
    createElectrificationProjectSpy.mockResolvedValue({ activityId: '00000000' } as ElectrificationProject);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.submitDraft(req as any, res as any, next);

    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledTimes(1);
    expect(createElectrificationProjectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...ELECTRIFICATION_INTAKE.project,
        electrificationProjectId: expect.stringMatching(uuidv4Pattern),
        activityId: '00000000',
        submittedAt: expect.stringMatching(isoPattern),
        submissionType: SubmissionType.GUIDANCE
      })
    );
  });
});

describe('updateDraft', () => {
  // Mock service calls
  const createDraftSpy = jest.spyOn(draftService, 'createDraft');
  const updateDraftSpy = jest.spyOn(draftService, 'updateDraft');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');

  it('creates a new draft', async () => {
    const req = {
      body: {
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
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({
      activityId: '00000000',
      initiativeId: Initiative.ELECTRIFICATION,
      isDeleted: false
    });
    createDraftSpy.mockResolvedValue({ draftId: '11111111', activityId: '00000000' } as Draft);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.updateDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledTimes(1);
    expect(createDraftSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        draftId: expect.stringMatching(uuidv4Pattern),
        activityId: '00000000'
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ draftId: '11111111', activityId: '00000000' });
  });

  it('updates draft with the given draftId and activityId', async () => {
    const req = {
      body: {
        draftId: '11111111',
        activityId: '00000000',
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
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({
      activityId: '00000000',
      initiativeId: Initiative.ELECTRIFICATION,
      isDeleted: false
    });
    updateDraftSpy.mockResolvedValue({ draftId: '11111111', activityId: '00000000' } as Draft);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.updateDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateDraftSpy).toHaveBeenCalledTimes(1);
    expect(updateDraftSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        draftId: '11111111'
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ draftId: '11111111', activityId: '00000000' });
  });
});

describe('updateElectrificationProject', () => {
  const next = jest.fn();

  // Mock service calls
  const insertContacts = jest.spyOn(contactService, 'insertContacts');
  const deleteUnmatchedActivityContacts = jest.spyOn(activityContactService, 'deleteUnmatchedActivityContacts');
  const upsertActivityContacts = jest.spyOn(activityContactService, 'upsertActivityContacts');
  const updateSpy = jest.spyOn(electrificationProjectService, 'updateElectrificationProject');

  it('should return 200 if all good', async () => {
    const req = {
      body: ELECTRIFICATION_PROJECT_1,
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = ELECTRIFICATION_PROJECT_1;

    insertContacts.mockResolvedValue();
    deleteUnmatchedActivityContacts.mockResolvedValue();
    upsertActivityContacts.mockResolvedValue();
    updateSpy.mockResolvedValue(updated);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.updateElectrificationProject(req as any, res as any, next);

    expect(insertContacts).toHaveBeenCalledTimes(1);
    expect(deleteUnmatchedActivityContacts).toHaveBeenCalledTimes(1);
    expect(upsertActivityContacts).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body.project,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next if the electrificationProject service fails to update', async () => {
    const req = {
      body: ELECTRIFICATION_PROJECT_1,
      currentContext: CURRENT_CONTEXT
    };

    insertContacts.mockResolvedValue();
    deleteUnmatchedActivityContacts.mockResolvedValue();
    upsertActivityContacts.mockResolvedValue();
    updateSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await electrificationProjectController.updateElectrificationProject(req as any, res as any, next);

    expect(insertContacts).toHaveBeenCalledTimes(1);
    expect(deleteUnmatchedActivityContacts).toHaveBeenCalledTimes(1);
    expect(upsertActivityContacts).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body.project,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
