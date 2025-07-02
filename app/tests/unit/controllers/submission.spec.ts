import housingProjectController from '../../../src/controllers/housingProject';
import {
  activityService,
  contactService,
  draftService,
  enquiryService,
  housingProjectService,
  permitService
} from '../../../src/services';
import { PermitNeeded, PermitStatus } from '../../../src/utils/enums/permit';
import { ApplicationStatus, IntakeStatus } from '../../../src/utils/enums/projectCommon';
import { AuthType, Initiative } from '../../../src/utils/enums/application';

import type { Draft, HousingProject, Permit } from '../../../src/types';

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

const HOUSING_PROJECT_1 = {
  housingProjectId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: '5183f223',
  assignedUserId: null,
  submittedAt: new Date().toISOString(),
  submittedBy: '100-100',
  locationPIDs: null,
  companyNameRegistered: null,
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
  projectName: null,
  projectDescription: null,
  singleFamilyUnits: null,
  isRentalUnit: 'Unsure',
  streetAddress: null,
  latitude: null,
  longitude: null,
  queuePriority: null,
  relatedPermits: null,
  astsubmissions: null,
  astNotes: null,
  astUpdated: true,
  addedToATS: true,
  atsClientId: null,
  ltsaCompleted: false,
  bcOnlineCompleted: true,
  naturalDisaster: false,
  financiallySupported: true,
  financiallySupportedBC: 'Yes',
  financiallySupportedIndigenous: 'Yes',
  financiallySupportedNonProfit: 'Yes',
  financiallySupportedHousingCoop: 'Yes',
  aaiUpdated: true,
  waitingOn: null,
  bringForwardDate: null,
  submissions: null,
  intakeStatus: null,
  applicationStatus: null,
  createdAt: new Date().toISOString(),
  createdBy: 'abc-123',
  updatedAt: new Date().toISOString(),
  updatedBy: 'abc-123',
  user: null
};

describe('createHousingProject', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const createHousingProjectSpy = jest.spyOn(housingProjectService, 'createHousingProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');

  it('creates submission with unique activity ID', async () => {
    const req = {
      body: { ...HOUSING_PROJECT_1, activityId: undefined, housingProjectId: undefined },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createHousingProjectSpy.mockResolvedValue({
      activityId: '00000000',
      housingProjectId: '11111111'
    } as HousingProject);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.createHousingProject(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ activityId: '00000000', housingProjectId: '11111111' });
  });

  it('populates data from body if it exists', async () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    const req = {
      body: {
        applicant: {},
        basic: {
          projectApplicantType: 'Individual'
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
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createHousingProjectSpy.mockResolvedValue({ activityId: '00000000' } as HousingProject);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.createHousingProject(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        projectApplicantType: 'Individual',
        projectName: 'TheProject',
        projectLocation: 'Some place',
        hasAppliedProvincialPermits: true,
        housingProjectId: expect.any(String),
        activityId: '00000000',
        submittedAt: expect.stringMatching(isoPattern),
        intakeStatus: IntakeStatus.SUBMITTED,
        applicationStatus: ApplicationStatus.NEW
      })
    );
  });

  it('creates permits if they exist', async () => {
    const now = new Date().toISOString();

    const req = {
      body: {
        appliedPermits: [
          {
            permitTypeId: 1,
            permitTracking: [{ trackingId: '123' }],
            status: PermitStatus.APPLIED,
            submittedDate: now
          },
          {
            permitTypeId: 3,
            permitTracking: [{ trackingId: '456' }],
            status: PermitStatus.APPLIED,
            submittedDate: now
          }
        ],
        investigatePermits: [
          {
            permitTypeId: 12,
            needed: PermitNeeded.UNDER_INVESTIGATION
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createHousingProjectSpy.mockResolvedValue({ activityId: '00000000' } as HousingProject);
    createPermitSpy.mockResolvedValue({} as Permit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.createHousingProject(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);

    expect(createPermitSpy).toHaveBeenCalledTimes(3);
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        permitTracking: [{ trackingId: '123' }],
        status: PermitStatus.APPLIED,
        submittedDate: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        permitTypeId: 3,
        activityId: '00000000',
        permitTracking: [{ trackingId: '456' }],
        status: PermitStatus.APPLIED,
        submittedDate: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        permitTypeId: 12,
        activityId: '00000000',
        needed: PermitNeeded.UNDER_INVESTIGATION
      })
    );
  });
});

describe('getStatistics', () => {
  const next = jest.fn();

  // Mock service calls
  const statisticsSpy = jest.spyOn(housingProjectService, 'getStatistics');

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
    await housingProjectController.getStatistics(req as any, res as any, next);

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
    await housingProjectController.getStatistics(req as any, res as any, next);

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getHousingProject', () => {
  const next = jest.fn();

  // Mock service calls
  const housingProjectSpy = jest.spyOn(housingProjectService, 'getHousingProject');
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should return 200 if all good', async () => {
    const req = {
      params: { housingProjectId: 'SOMEID' },
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    housingProjectSpy.mockResolvedValue(HOUSING_PROJECT_1 as any);
    getRelatedEnquiriesSpy.mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.getHousingProject(req as any, res as any, next);

    expect(housingProjectSpy).toHaveBeenCalledTimes(1);
    expect(housingProjectSpy).toHaveBeenCalledWith(req.params.housingProjectId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(HOUSING_PROJECT_1);
  });

  it('calls next if the submission service fails to get submission', async () => {
    const req = {
      params: { housingProjectId: 'SOMEID' },
      currentContext: CURRENT_CONTEXT
    };

    housingProjectSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.getHousingProject(req as any, res as any, next);

    expect(housingProjectSpy).toHaveBeenCalledTimes(1);
    expect(housingProjectSpy).toHaveBeenCalledWith(req.params.housingProjectId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getHousingProjects', () => {
  const next = jest.fn();

  // Mock service calls
  const housingProjectsSpy = jest.spyOn(housingProjectService, 'getHousingProjects');

  it('should return 200 if all good', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT,
      query: {}
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    housingProjectsSpy.mockResolvedValue([HOUSING_PROJECT_1 as any]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.getHousingProjects(req as any, res as any, next);

    expect(housingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(housingProjectsSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([HOUSING_PROJECT_1]);
  });

  it('calls checkAndStoreNewSubmissions', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    housingProjectsSpy.mockResolvedValue([HOUSING_PROJECT_1 as any]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.getHousingProjects(req as any, res as any, next);

    expect(housingProjectsSpy).toHaveBeenCalledTimes(1);
  });

  it('calls next if the submission service fails to get submissions', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT
    };

    housingProjectsSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.getHousingProjects(req as any, res as any, next);

    expect(housingProjectsSpy).toHaveBeenCalledTimes(1);
    expect(housingProjectsSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('submitDraft', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const createHousingProjectSpy = jest.spyOn(housingProjectService, 'createHousingProject');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const upsertContacts = jest.spyOn(contactService, 'upsertContacts');

  it('populates data from body if it exists', async () => {
    const req = {
      body: {
        contacts: [{ firstName: 'test', lastName: 'person' }],
        basic: {
          projectApplicantType: 'Individual'
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
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createHousingProjectSpy.mockResolvedValue({ activityId: '00000000' } as HousingProject);
    upsertContacts.mockResolvedValue();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        projectApplicantType: 'Individual',
        projectName: 'TheProject',
        projectLocation: 'Some place',
        hasAppliedProvincialPermits: true,
        housingProjectId: expect.stringMatching(uuidv4Pattern),
        activityId: '00000000',
        submittedAt: expect.stringMatching(isoPattern),
        intakeStatus: IntakeStatus.SUBMITTED,
        applicationStatus: ApplicationStatus.NEW
      })
    );
  });

  it('sets intake status to Submitted', async () => {
    const req = {
      body: {},
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createHousingProjectSpy.mockResolvedValue({ activityId: '00000000' } as HousingProject);
    upsertContacts.mockResolvedValue();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(upsertContacts).toHaveBeenCalledTimes(0);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        intakeStatus: IntakeStatus.SUBMITTED
      })
    );
  });

  it('creates permits if they exist', async () => {
    const now = new Date().toISOString();

    const req = {
      body: {
        appliedPermits: [
          {
            permitTypeId: 1,
            trackingId: '123',
            status: PermitStatus.APPLIED,
            submittedDate: now
          },
          {
            permitTypeId: 3,
            trackingId: '456',
            status: PermitStatus.APPLIED,
            submittedDate: now
          }
        ],
        investigatePermits: [
          {
            permitTypeId: 12,
            needed: PermitNeeded.UNDER_INVESTIGATION
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createHousingProjectSpy.mockResolvedValue({ activityId: '00000000' } as HousingProject);
    createPermitSpy.mockResolvedValue({} as Permit);
    upsertContacts.mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(upsertContacts).toHaveBeenCalledTimes(0);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createHousingProjectSpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledTimes(3);
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        status: PermitStatus.APPLIED,
        submittedDate: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        permitTypeId: 3,
        activityId: '00000000',
        status: PermitStatus.APPLIED,
        submittedDate: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        permitTypeId: 12,
        activityId: '00000000',
        needed: PermitNeeded.UNDER_INVESTIGATION
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
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createDraftSpy.mockResolvedValue({ draftId: '11111111', activityId: '00000000' } as Draft);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.updateDraft(req as any, res as any, next);

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
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    updateDraftSpy.mockResolvedValue({ draftId: '11111111', activityId: '00000000' } as Draft);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.updateDraft(req as any, res as any, next);

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

describe('updateHousingProject', () => {
  const next = jest.fn();

  // Mock service calls
  const updateSpy = jest.spyOn(housingProjectService, 'updateHousingProject');

  it('should return 200 if all good', async () => {
    const req = {
      body: HOUSING_PROJECT_1,
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = HOUSING_PROJECT_1;

    updateSpy.mockResolvedValue(updated);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.updateHousingProject(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next if the housingProject service fails to update', async () => {
    const req = {
      body: HOUSING_PROJECT_1,
      currentContext: CURRENT_CONTEXT
    };

    updateSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await housingProjectController.updateHousingProject(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);

    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('assignPriority', () => {
  it('assigns priority 1 when housing project matches priority 1 criteria - 50 to 500 units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '50-500',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - over 500 units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '>500',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - Has Rental Units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'Yes',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - Social Housing', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'Yes',
      financiallySupportedIndigenous: 'No'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 criteria - Indigenous Led', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'Yes'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 1 when housing project matches priority 1 and priority 2 criteria', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '10-49',
      hasRentalUnits: 'Yes',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'Yes',
      multiFamilyUnits: '1-9',
      otherUnits: ''
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(1);
  });

  it('assigns priority 2 when housing project matches priority 2 criteria - 10-49 single family units', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '10-49'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(2);
  });

  it('assigns priority 2 if only multiFamilyUnits is provided', () => {
    const housingProject: Partial<HousingProject> = {
      multiFamilyUnits: '1-9'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(2);
  });

  it('assigns priority 2 if only otherUnits is provided', () => {
    const housingProject: Partial<HousingProject> = {
      otherUnits: '1-9'
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(2);
  });

  it('assigns priority 3 when housing project matches neither priority 1 nor priority 2 criteria', () => {
    const housingProject: Partial<HousingProject> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No',
      multiFamilyUnits: '',
      otherUnits: ''
    };

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(3);
  });

  it('assigns priority 3 if no criteria are met/given', () => {
    const housingProject: Partial<HousingProject> = {};

    housingProjectController.assignPriority(housingProject);

    expect(housingProject.queuePriority).toBe(3);
  });
});
