import config from 'config';

import submissionController from '../../../src/controllers/submission';
import {
  activityService,
  contactService,
  enquiryService,
  permitService,
  submissionService
} from '../../../src/services';
import type { Permit, Submission } from '../../../src/types';
import { ApplicationStatus, IntakeStatus, PermitNeeded, PermitStatus } from '../../../src/utils/enums/housing';
import { BasicResponse, Initiative } from '../../../src/utils/enums/application';

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

const CURRENT_CONTEXT = { authType: AuthType.BEARER, tokenPayload: undefined, userId: 'abc-123' };

const FORM_EXPORT_1 = {
  form: {
    id: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
    submissionId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    confirmationId: '5183f223',
    createdAt: new Date().toISOString(),
    username: 'USERABC',
    status: 'SUBMITTED'
  },

  submissionId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  confirmationId: '5183f223',
  contactEmail: 'abc@dot.com',
  contactPhoneNumber: '1234567890',
  contactFirstName: 'ABC',
  contactLastName: 'DEF',
  contactPreference: 'phoneCall',
  contactApplicantRelationship: 'Agent',
  financiallySupported: true,
  intakeStatus: 'IN PROGRESS',
  isBCHousingSupported: 'Yes',
  isIndigenousHousingProviderSupported: 'Yes',
  isNonProfitSupported: 'Yes',
  isHousingCooperativeSupported: 'Yes',
  parcelID: '132',
  latitude: -48,
  longitude: 160,
  naturalDisasterInd: true,
  projectName: 'PROJ',
  isDevelopedByCompanyOrOrg: 'Yes',
  companyNameRegistered: 'COMPANY',
  queuePriority: '3',
  singleFamilyUnits: '1-49',
  multiFamilyUnits: '',
  multiFamilyUnits1: '',
  isRentalUnit: 'unsureunsure',
  addressType: 'civicAddress',
  streetAddress: '123 Some Street',
  previousPermits: 'No',
  createdAt: new Date().toISOString(),
  createdBy: 'USERABC',

  permitGrid: null,
  dataGrid: null
};

const FORM_EXPORT_2 = {
  form: {
    id: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
    submissionId: 'c8b7d976-3d05-4e67-a813-b10888585b59',
    confirmationId: 'c8b7d976',
    createdAt: new Date().toISOString(),
    username: 'USERABC',
    status: 'SUBMITTED'
  },

  submissionId: 'c8b7d976-3d05-4e67-a813-b10888585b59',
  confirmationId: 'c8b7d976',
  contactEmail: 'joe@dot.com',
  contactPhoneNumber: '1114448888',
  contactFirstName: 'Joe',
  contactLastName: 'Smith',
  contactPreference: 'Email',
  contactApplicantRelationship: 'Agent',

  financiallySupported: true,
  intakeStatus: 'IN PROGRESS',
  isBCHousingSupported: 'Yes',
  isIndigenousHousingProviderSupported: 'Yes',
  isNonProfitSupported: 'Yes',
  isHousingCooperativeSupported: 'Yes',
  parcelID: '132',
  latitude: -59,
  longitude: 178,
  naturalDisasterInd: true,
  projectName: 'BIG',
  projectDescription: 'some project description here',
  companyNameRegistered: 'BIGBUILD',
  queuePriority: '3',
  singleFamilyUnits: '>500',
  multiFamilyUnits: '',
  multiFamilyUnits1: '',
  isRentalUnit: 'yes',
  streetAddress: '112 Other Road',
  createdAt: new Date().toISOString(),
  createdBy: 'USERABC',

  permitGrid: [
    {
      previousPermitType: 'landsCrownLandTenure',
      previousTrackingNumber2: 'tracking2',
      previousTrackingNumber: '',
      status: '',
      statusLastVerifiedDate: ''
    }
  ],
  dataGrid: null
};

const FORM_SUBMISSION_1: Partial<Submission & { activityId: string; formId: string; permits: Array<Permit> }> = {
  formId: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
  submissionId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: '5183f223',
  applicationStatus: ApplicationStatus.NEW,
  companyNameRegistered: 'COMPANY',
  financiallySupported: true,
  financiallySupportedBC: 'Yes',
  financiallySupportedIndigenous: 'Yes',
  financiallySupportedNonProfit: 'Yes',
  financiallySupportedHousingCoop: 'Yes',
  intakeStatus: 'Submitted',
  locationPIDs: '132',
  latitude: -48,
  longitude: 160,
  naturalDisaster: BasicResponse.YES,
  multiFamilyUnits: '',
  otherUnits: '',
  otherUnitsDescription: undefined,
  projectDescription: undefined,
  projectName: 'PROJ',
  queuePriority: 3,
  singleFamilyUnits: '1-49',
  hasRentalUnits: 'Unsure',
  streetAddress: '123 Some Street',
  submittedAt: FORM_EXPORT_1.form.createdAt,
  submittedBy: 'USERABC',
  permits: []
};

const FORM_SUBMISSION_2: Partial<Submission & { activityId: string; formId: string; permits: Array<Partial<Permit>> }> =
  {
    formId: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
    submissionId: 'c8b7d976-3d05-4e67-a813-b10888585b59',
    activityId: 'c8b7d976',
    applicationStatus: ApplicationStatus.NEW,
    companyNameRegistered: 'BIGBUILD',
    financiallySupported: true,
    financiallySupportedBC: 'Yes',
    financiallySupportedIndigenous: 'Yes',
    financiallySupportedNonProfit: 'Yes',
    financiallySupportedHousingCoop: 'Yes',
    intakeStatus: 'Submitted',
    locationPIDs: '132',
    latitude: -59,
    longitude: 178,
    naturalDisaster: BasicResponse.YES,
    projectName: 'BIG',
    projectDescription: 'some project description here',
    queuePriority: 3,
    singleFamilyUnits: '>500',
    hasRentalUnits: 'Yes',
    streetAddress: '112 Other Road',
    submittedAt: FORM_EXPORT_2.form.createdAt,
    submittedBy: 'USERABC',
    permits: [{ permitTypeId: 123, activityId: 'c8b7d976', trackingId: 'tracking2' }]
  };

const PERMIT_TYPES = [
  {
    permitTypeId: 123,
    agency: 'Water, Land and Resource Stewardship',
    division: 'Integrated Resource Operations',
    branch: 'Lands Program',
    businessDomain: 'Lands',
    type: 'Commercial General',
    family: null,
    name: 'Commercial General',
    nameSubtype: null,
    acronym: null,
    trackedInATS: true,
    sourceSystem: null,
    sourceSystemAcronym: 'SRC'
  }
];

const SUBMISSION_1 = {
  submissionId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: '5183f223',
  assignedUserId: null,
  submittedAt: new Date().toISOString(),
  submittedBy: '100-100',
  locationPIDs: null,
  companyNameRegistered: null,
  contactPhoneNumber: null,
  contactEmail: null,
  contactPreference: null,
  contactApplicantRelationship: null,
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
  atsClientNumber: null,
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

describe.skip('checkAndStoreNewSubmissions', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const permitTypesSpy = jest.spyOn(permitService, 'getPermitTypes');
  const formExportSpy = jest.spyOn(submissionService, 'getFormExport');
  const searchSubmissionsSpy = jest.spyOn(submissionService, 'searchSubmissions');
  const createSubmissionsFromExportSpy = jest.spyOn(submissionService, 'createSubmissionsFromExport');

  it('creates submissions', async () => {
    (config.get as jest.Mock).mockReturnValueOnce({
      form1: {
        id: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
        apiKey: 'db85c1f7-a345-481f-ada0-f6f7a25c0899'
      },
      form2: {
        id: '4b9fd5c1-3f26-459e-8862-3b422f72c8ed',
        apiKey: 'e4550917-c93a-4890-b230-346f5375f41d'
      }
    });

    const req = {
      currentContext: CURRENT_CONTEXT
    };

    permitTypesSpy.mockResolvedValue(PERMIT_TYPES);
    formExportSpy.mockResolvedValueOnce([FORM_EXPORT_1]).mockResolvedValueOnce([]);
    searchSubmissionsSpy.mockResolvedValue([]);
    createSubmissionsFromExportSpy.mockResolvedValue();

    await submissionController.checkAndStoreNewSubmissions(req.currentContext);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(formExportSpy).toHaveBeenCalledTimes(2);
    expect(searchSubmissionsSpy).toHaveBeenCalledTimes(1);
    expect(createSubmissionsFromExportSpy).toHaveBeenCalledWith([FORM_SUBMISSION_1]);
    expect(createPermitSpy).toHaveBeenCalledTimes(0);
  });

  it('only creates new submissions', async () => {
    (config.get as jest.Mock).mockReturnValueOnce({
      form1: {
        id: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
        apiKey: 'db85c1f7-a345-481f-ada0-f6f7a25c0899'
      },
      form2: {
        id: '4b9fd5c1-3f26-459e-8862-3b422f72c8ed',
        apiKey: 'e4550917-c93a-4890-b230-346f5375f41d'
      }
    });

    const req = {
      currentContext: CURRENT_CONTEXT
    };

    permitTypesSpy.mockResolvedValue(PERMIT_TYPES);
    formExportSpy.mockResolvedValueOnce([FORM_EXPORT_1, FORM_EXPORT_2]).mockResolvedValueOnce([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchSubmissionsSpy.mockResolvedValue([SUBMISSION_1 as any]);
    createSubmissionsFromExportSpy.mockResolvedValue();
    createPermitSpy.mockResolvedValue({} as Permit);

    await submissionController.checkAndStoreNewSubmissions(req.currentContext);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(formExportSpy).toHaveBeenCalledTimes(2);
    expect(searchSubmissionsSpy).toHaveBeenCalledTimes(1);
    expect(createSubmissionsFromExportSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          ...FORM_SUBMISSION_2,
          permits: expect.arrayContaining([
            expect.objectContaining({
              activityId: expect.any(String),
              permitTypeId: expect.any(Number),
              trackingId: expect.any(String),
              permitId: expect.any(String)
            })
          ])
        })
      ])
    );
    expect(createPermitSpy).toHaveBeenCalledTimes(1);
  });

  it('creates permits', async () => {
    (config.get as jest.Mock).mockReturnValueOnce({
      form1: {
        id: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
        apiKey: 'db85c1f7-a345-481f-ada0-f6f7a25c0899'
      },
      form2: {
        id: '4b9fd5c1-3f26-459e-8862-3b422f72c8ed',
        apiKey: 'e4550917-c93a-4890-b230-346f5375f41d'
      }
    });

    const req = {
      currentContext: CURRENT_CONTEXT
    };

    permitTypesSpy.mockResolvedValue(PERMIT_TYPES);
    formExportSpy.mockResolvedValueOnce([FORM_EXPORT_2]).mockResolvedValueOnce([]);
    searchSubmissionsSpy.mockResolvedValue([]);
    createSubmissionsFromExportSpy.mockResolvedValue();
    createPermitSpy.mockResolvedValue({} as Permit);

    await submissionController.checkAndStoreNewSubmissions(req.currentContext);

    expect(permitTypesSpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        permitId: expect.any(String),
        permitTypeId: 123,
        activityId: 'c8b7d976',
        trackingId: 'tracking2'
      })
    );
  });
});

describe('createSubmission', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const createSubmissionSpy = jest.spyOn(submissionService, 'createSubmission');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');

  it('creates submission with unique activity ID', async () => {
    const req = {
      body: { ...SUBMISSION_1, activityId: undefined, submissionId: undefined },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createSubmissionSpy.mockResolvedValue({ activityId: '00000000', submissionId: '11111111' } as Submission);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.createSubmission(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ activityId: '00000000', submissionId: '11111111' });
  });

  it('populates data from body if it exists', async () => {
    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    const req = {
      body: {
        applicant: {},
        basic: {
          isDevelopedByCompanyOrOrg: true
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
    createSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.createSubmission(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(createSubmissionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isDevelopedByCompanyOrOrg: true,
        projectName: 'TheProject',
        projectLocation: 'Some place',
        hasAppliedProvincialPermits: true,
        submissionId: expect.any(String),
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
            trackingId: '123',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          },
          {
            permitTypeId: 3,
            trackingId: '456',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          }
        ],
        investigatePermits: [
          {
            permitTypeId: 12,
            needed: PermitNeeded.UNDER_INVESTIGATION,
            statusLastVerified: now
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    createActivitySpy.mockResolvedValue({ activityId: '00000000', initiativeId: Initiative.HOUSING, isDeleted: false });
    createSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    createPermitSpy.mockResolvedValue({} as Permit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.createSubmission(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(1);
    expect(createSubmissionSpy).toHaveBeenCalledTimes(1);

    expect(createPermitSpy).toHaveBeenCalledTimes(3);
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        trackingId: '123',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        permitTypeId: 3,
        activityId: '00000000',
        trackingId: '456',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        permitTypeId: 12,
        activityId: '00000000',
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastVerified: now
      })
    );
  });
});

describe('getStatistics', () => {
  const next = jest.fn();

  // Mock service calls
  const statisticsSpy = jest.spyOn(submissionService, 'getStatistics');

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
    await submissionController.getStatistics(req as any, res as any, next);

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
    await submissionController.getStatistics(req as any, res as any, next);

    expect(statisticsSpy).toHaveBeenCalledTimes(1);
    expect(statisticsSpy).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getSubmission', () => {
  const next = jest.fn();

  // Mock service calls
  const submissionSpy = jest.spyOn(submissionService, 'getSubmission');
  const getRelatedEnquiriesSpy = jest.spyOn(enquiryService, 'getRelatedEnquiries');

  it('should return 200 if all good', async () => {
    const req = {
      params: { submissionId: 'SOMEID' },
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submissionSpy.mockResolvedValue(SUBMISSION_1 as any);
    getRelatedEnquiriesSpy.mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmission(req as any, res as any, next);

    expect(submissionSpy).toHaveBeenCalledTimes(1);
    expect(submissionSpy).toHaveBeenCalledWith(req.params.submissionId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(SUBMISSION_1);
  });

  it('calls next if the submission service fails to get submission', async () => {
    const req = {
      params: { submissionId: 'SOMEID' },
      currentContext: CURRENT_CONTEXT
    };

    submissionSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmission(req as any, res as any, next);

    expect(submissionSpy).toHaveBeenCalledTimes(1);
    expect(submissionSpy).toHaveBeenCalledWith(req.params.submissionId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('getSubmissions', () => {
  const next = jest.fn();

  // Mock controller calls
  const checkAndStoreSpy = jest.spyOn(submissionController, 'checkAndStoreNewSubmissions');

  // Mock service calls
  const submissionsSpy = jest.spyOn(submissionService, 'getSubmissions');

  it('should return 200 if all good', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT,
      query: {}
    };

    checkAndStoreSpy.mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submissionsSpy.mockResolvedValue([SUBMISSION_1 as any]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmissions(req as any, res as any, next);

    expect(checkAndStoreSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([SUBMISSION_1]);
  });

  it('calls checkAndStoreNewSubmissions', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT
    };

    checkAndStoreSpy.mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submissionsSpy.mockResolvedValue([SUBMISSION_1 as any]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmissions(req as any, res as any, next);

    expect(checkAndStoreSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledTimes(1);
  });

  it('calls next if the submission controller fails to check/create submissions', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT
    };

    checkAndStoreSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmissions(req as any, res as any, next);

    expect(checkAndStoreSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('calls next if the submission service fails to get submissions', async () => {
    const req = {
      currentContext: CURRENT_CONTEXT
    };

    submissionsSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmissions(req as any, res as any, next);

    expect(checkAndStoreSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('submitDraft', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const updateSubmissionSpy = jest.spyOn(submissionService, 'updateSubmission');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const deletePermitsByActivitySpy = jest.spyOn(permitService, 'deletePermitsByActivity');
  const upsertContacts = jest.spyOn(contactService, 'upsertContacts');

  it('updates submission with the given activity ID', async () => {
    const req = {
      body: { activityId: '000000000', submissionId: '11111111' },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000', submissionId: '11111111' } as Submission);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    upsertContacts.mockResolvedValue();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ activityId: '00000000', submissionId: '11111111' });
  });

  it('populates data from body if it exists', async () => {
    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        basic: {
          isDevelopedByCompanyOrOrg: true
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

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    upsertContacts.mockResolvedValue();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isDevelopedByCompanyOrOrg: true,
        projectName: 'TheProject',
        projectLocation: 'Some place',
        hasAppliedProvincialPermits: true,
        submissionId: '11111111',
        activityId: '00000000',
        submittedAt: expect.stringMatching(isoPattern),
        intakeStatus: IntakeStatus.SUBMITTED,
        applicationStatus: ApplicationStatus.NEW
      })
    );
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
  });

  it('sets intake status to Submitted', async () => {
    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111'
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    upsertContacts.mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        intakeStatus: IntakeStatus.SUBMITTED
      })
    );
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
  });

  it('deletes all existing permits before creating new ones', async () => {
    const now = new Date().toISOString();

    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        appliedPermits: [
          {
            permitTypeId: 1,
            trackingId: '123',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000', submissionId: '11111111' } as Submission);
    createPermitSpy.mockResolvedValue({} as Permit);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    upsertContacts.mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.submitDraft(req as any, res as any, next);

    const deleteOrder = deletePermitsByActivitySpy.mock.invocationCallOrder[0];
    const createOrder = createPermitSpy.mock.invocationCallOrder[0];

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(upsertContacts).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        trackingId: '123',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(deleteOrder).toBeLessThan(createOrder);
  });

  it('creates permits if they exist', async () => {
    const now = new Date().toISOString();

    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        appliedPermits: [
          {
            permitTypeId: 1,
            trackingId: '123',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          },
          {
            permitTypeId: 3,
            trackingId: '456',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          }
        ],
        investigatePermits: [
          {
            permitTypeId: 12,
            needed: PermitNeeded.UNDER_INVESTIGATION,
            statusLastVerified: now
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    createPermitSpy.mockResolvedValue({} as Permit);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    upsertContacts.mockResolvedValue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.submitDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledTimes(3);
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        trackingId: '123',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        permitTypeId: 3,
        activityId: '00000000',
        trackingId: '456',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        permitTypeId: 12,
        activityId: '00000000',
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastVerified: now
      })
    );
  });
});

describe('updateDraft', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const updateSubmissionSpy = jest.spyOn(submissionService, 'updateSubmission');
  const createActivitySpy = jest.spyOn(activityService, 'createActivity');
  const deletePermitsByActivitySpy = jest.spyOn(permitService, 'deletePermitsByActivity');

  it('updates submission with the given activity ID', async () => {
    const req = {
      body: { activityId: '000000000', submissionId: '11111111' },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000', submissionId: '11111111' } as Submission);
    deletePermitsByActivitySpy.mockResolvedValue(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ activityId: '00000000', submissionId: '11111111' });
  });

  it('populates data from body if it exists', async () => {
    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        applicant: {},
        basic: {
          isDevelopedByCompanyOrOrg: true
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

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    deletePermitsByActivitySpy.mockResolvedValue(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isDevelopedByCompanyOrOrg: true,
        projectName: 'TheProject',
        projectLocation: 'Some place',
        hasAppliedProvincialPermits: true,
        submissionId: '11111111',
        activityId: '00000000',
        submittedAt: expect.stringMatching(isoPattern),
        intakeStatus: IntakeStatus.DRAFT,
        applicationStatus: ApplicationStatus.NEW
      })
    );
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
  });

  it('sets intake status to Draft', async () => {
    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        submit: true
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(updateSubmissionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        intakeStatus: IntakeStatus.DRAFT
      })
    );
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
  });

  it('deletes all existing permits before creating new ones', async () => {
    const now = new Date().toISOString();

    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        appliedPermits: [
          {
            permitTypeId: 1,
            trackingId: '123',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000', submissionId: '11111111' } as Submission);
    createPermitSpy.mockResolvedValue({} as Permit);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateDraft(req as any, res as any, next);

    const deleteOrder = deletePermitsByActivitySpy.mock.invocationCallOrder[0];
    const createOrder = createPermitSpy.mock.invocationCallOrder[0];

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        trackingId: '123',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(deleteOrder).toBeLessThan(createOrder);
  });

  it('creates permits if they exist', async () => {
    const now = new Date().toISOString();

    const req = {
      body: {
        activityId: '00000000',
        submissionId: '11111111',
        appliedPermits: [
          {
            permitTypeId: 1,
            trackingId: '123',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          },
          {
            permitTypeId: 3,
            trackingId: '456',
            status: PermitStatus.APPLIED,
            statusLastVerified: now
          }
        ],
        investigatePermits: [
          {
            permitTypeId: 12,
            needed: PermitNeeded.UNDER_INVESTIGATION,
            statusLastVerified: now
          }
        ]
      },
      currentContext: CURRENT_CONTEXT
    };
    const next = jest.fn();

    updateSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    createPermitSpy.mockResolvedValue({} as Permit);
    deletePermitsByActivitySpy.mockResolvedValue(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateDraft(req as any, res as any, next);

    expect(createActivitySpy).toHaveBeenCalledTimes(0);
    expect(updateSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(deletePermitsByActivitySpy).toHaveBeenCalledTimes(1);
    expect(createPermitSpy).toHaveBeenCalledTimes(3);
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        permitTypeId: 1,
        activityId: '00000000',
        trackingId: '123',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        permitTypeId: 3,
        activityId: '00000000',
        trackingId: '456',
        status: PermitStatus.APPLIED,
        statusLastVerified: now
      })
    );
    expect(createPermitSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        permitTypeId: 12,
        activityId: '00000000',
        needed: PermitNeeded.UNDER_INVESTIGATION,
        statusLastVerified: now
      })
    );
  });
});

describe('updateSubmission', () => {
  const next = jest.fn();

  // Mock service calls
  const updateSpy = jest.spyOn(submissionService, 'updateSubmission');

  it('should return 200 if all good', async () => {
    const req = {
      body: SUBMISSION_1,
      currentContext: CURRENT_CONTEXT
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = SUBMISSION_1;

    updateSpy.mockResolvedValue(updated);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateSubmission(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({
      ...req.body,
      updatedAt: expect.stringMatching(isoPattern),
      updatedBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next if the submission service fails to update', async () => {
    const req = {
      body: SUBMISSION_1,
      currentContext: CURRENT_CONTEXT
    };

    updateSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateSubmission(req as any, res as any, next);

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
  it('assigns priority 1 when submission matches priority 1 criteria - 50 to 500 units', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '50-500',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(1);
  });

  it('assigns priority 1 when submission matches priority 1 criteria - over 500 units', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '>500',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(1);
  });

  it('assigns priority 1 when submission matches priority 1 criteria - Has Rental Units', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'Yes',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(1);
  });

  it('assigns priority 1 when submission matches priority 1 criteria - Social Housing', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'Yes',
      financiallySupportedIndigenous: 'No'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(1);
  });

  it('assigns priority 1 when submission matches priority 1 criteria - Indigenous Led', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'Yes'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(1);
  });

  it('assigns priority 1 when submission matches priority 1 and priority 2 criteria', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '10-49',
      hasRentalUnits: 'Yes',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'Yes',
      multiFamilyUnits: '1-9',
      otherUnits: ''
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(1);
  });

  it('assigns priority 2 when submission matches priority 2 criteria - 10-49 single family units', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '10-49'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(2);
  });

  it('assigns priority 2 if only multiFamilyUnits is provided', () => {
    const submission: Partial<Submission> = {
      multiFamilyUnits: '1-9'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(2);
  });

  it('assigns priority 2 if only otherUnits is provided', () => {
    const submission: Partial<Submission> = {
      otherUnits: '1-9'
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(2);
  });

  it('assigns priority 3 when submission matches neither priority 1 nor priority 2 criteria', () => {
    const submission: Partial<Submission> = {
      singleFamilyUnits: '1-9',
      hasRentalUnits: 'No',
      financiallySupportedBC: 'No',
      financiallySupportedIndigenous: 'No',
      multiFamilyUnits: '',
      otherUnits: ''
    };

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(3);
  });

  it('assigns priority 3 if no criteria are met/given', () => {
    const submission: Partial<Submission> = {};

    submissionController.assignPriority(submission);

    expect(submission.queuePriority).toBe(3);
  });
});
