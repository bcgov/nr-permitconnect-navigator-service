import config from 'config';
import { NIL } from 'uuid';

import { APPLICATION_STATUS_LIST } from '../../../src/components/constants';
import submissionController from '../../../src/controllers/submission';
import { permitService, submissionService, userService } from '../../../src/services';
import * as utils from '../../../src/components/utils';

import type { Permit, Submission } from '../../../src/types';

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

const CURRENT_USER = { authType: 'BEARER', tokenPayload: null };

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
  isBCHousingSupported: true,
  isIndigenousHousingProviderSupported: true,
  isNonProfitSupported: true,
  isHousingCooperativeSupported: true,
  parcelID: '132',
  latitude: -48,
  longitude: 160,
  naturalDisasterInd: true,
  projectName: 'PROJ',
  companyNameRegistered: 'COMPANY',
  queuePriority: '3',
  singleFamilyUnits: '1-49',
  multiFamilyUnits: '',
  multiFamilyUnits1: '',
  isRentalUnit: 'unsureunsure',
  streetAddress: '123 Some Street',
  guidance: true,
  statusRequest: true,
  inquiry: true,
  emergencyAssist: true,
  inapplicable: true,
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
  isBCHousingSupported: true,
  isIndigenousHousingProviderSupported: true,
  isNonProfitSupported: true,
  isHousingCooperativeSupported: true,
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
  guidance: true,
  statusRequest: true,
  inquiry: true,
  emergencyAssist: true,
  inapplicable: true,
  createdAt: new Date().toISOString(),
  createdBy: 'USERABC',

  permitGrid: [
    { previousPermitType: 'landsCrownLandTenure', previousTrackingNumber2: 'tracking2', previousTrackingNumber: '' }
  ],
  dataGrid: null
};

const FORM_SUBMISSION_1: Partial<Submission & { activityId: string; formId: string; permits: Array<Permit> }> = {
  formId: '88f5d0de-8bf9-48f6-9e03-38ae3cde5aaa',
  submissionId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
  activityId: '5183f223',
  applicationStatus: APPLICATION_STATUS_LIST.NEW,
  companyNameRegistered: 'COMPANY',
  contactEmail: 'abc@dot.com',
  contactPhoneNumber: '1234567890',
  contactName: 'ABC DEF',
  contactPreference: 'Phone Call',
  contactApplicantRelationship: 'Agent',
  financiallySupported: true,
  financiallySupportedBC: true,
  financiallySupportedIndigenous: true,
  financiallySupportedNonProfit: true,
  financiallySupportedHousingCoop: true,
  intakeStatus: 'Submitted',
  locationPIDs: '132',
  latitude: -48,
  longitude: 160,
  naturalDisaster: true,
  projectName: 'PROJ',
  queuePriority: 3,
  singleFamilyUnits: '1-49',
  isRentalUnit: 'Unsure',
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
    applicationStatus: APPLICATION_STATUS_LIST.NEW,
    companyNameRegistered: 'BIGBUILD',
    contactEmail: 'joe@dot.com',
    contactPhoneNumber: '1114448888',
    contactName: 'Joe Smith',
    contactPreference: 'Email',
    contactApplicantRelationship: 'Agent',
    financiallySupported: true,
    financiallySupportedBC: true,
    financiallySupportedIndigenous: true,
    financiallySupportedNonProfit: true,
    financiallySupportedHousingCoop: true,
    intakeStatus: 'Submitted',
    locationPIDs: '132',
    latitude: -59,
    longitude: 178,
    naturalDisaster: true,
    projectName: 'BIG',
    projectDescription: 'some project description here',
    queuePriority: 3,
    singleFamilyUnits: '>500',
    isRentalUnit: 'Yes',
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
  contactName: null,
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
  financiallySupportedBC: true,
  financiallySupportedIndigenous: false,
  financiallySupportedNonProfit: false,
  financiallySupportedHousingCoop: false,
  aaiUpdated: true,
  waitingOn: null,
  bringForwardDate: null,
  submissions: null,
  intakeStatus: null,
  applicationStatus: null,
  guidance: false,
  statusRequest: false,
  inquiry: false,
  emergencyAssist: false,
  inapplicable: false,
  user: null
};

describe('checkAndStoreNewSubmissions', () => {
  // Mock service calls
  const createPermitSpy = jest.spyOn(permitService, 'createPermit');
  const permitTypesSpy = jest.spyOn(permitService, 'getPermitTypes');
  const formExportSpy = jest.spyOn(submissionService, 'getFormExport');
  const searchSubmissionsSpy = jest.spyOn(submissionService, 'searchSubmissions');
  const createSubmissionsFromExportSpy = jest.spyOn(submissionService, 'createSubmissionsFromExport');
  const createSubmissionSpy = jest.spyOn(submissionService, 'createSubmission');
  const getSubmissionSpy = jest.spyOn(submissionService, 'getSubmission');

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

    permitTypesSpy.mockResolvedValue(PERMIT_TYPES);
    formExportSpy.mockResolvedValueOnce([FORM_EXPORT_1]).mockResolvedValueOnce([]);
    searchSubmissionsSpy.mockResolvedValue([]);
    createSubmissionsFromExportSpy.mockResolvedValue();
    createPermitSpy.mockResolvedValue(null);

    await submissionController.checkAndStoreNewSubmissions();

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

    permitTypesSpy.mockResolvedValue(PERMIT_TYPES);
    formExportSpy.mockResolvedValueOnce([FORM_EXPORT_1, FORM_EXPORT_2]).mockResolvedValueOnce([]);
    searchSubmissionsSpy.mockResolvedValue([SUBMISSION_1]);
    createSubmissionsFromExportSpy.mockResolvedValue();
    createPermitSpy.mockResolvedValue(null);

    await submissionController.checkAndStoreNewSubmissions();

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

  it.skip('creates submission with no UUID collision', async () => {
    const req = {
      body: SUBMISSION_1,
      currentUser: CURRENT_USER
    };
    const next = jest.fn();

    createSubmissionSpy.mockResolvedValue({ activityId: '00000000' } as Submission);
    getSubmissionSpy.mockResolvedValue(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.createSubmission(req as any, res as any, next);

    expect(createSubmissionSpy).toHaveBeenCalledTimes(1);
    expect(getSubmissionSpy).toHaveBeenCalledTimes(1);
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

    permitTypesSpy.mockResolvedValue(PERMIT_TYPES);
    formExportSpy.mockResolvedValueOnce([FORM_EXPORT_2]).mockResolvedValueOnce([]);
    searchSubmissionsSpy.mockResolvedValue([]);
    createSubmissionsFromExportSpy.mockResolvedValue();
    createPermitSpy.mockResolvedValue(null);

    await submissionController.checkAndStoreNewSubmissions();

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
      currentUser: CURRENT_USER
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
      currentUser: CURRENT_USER
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

  it('should return 200 if all good', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentUser: CURRENT_USER
    };

    submissionSpy.mockResolvedValue(SUBMISSION_1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmission(req as any, res as any, next);

    expect(submissionSpy).toHaveBeenCalledTimes(1);
    expect(submissionSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(SUBMISSION_1);
  });

  it('calls next if the submission service fails to get submission', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentUser: CURRENT_USER
    };

    submissionSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmission(req as any, res as any, next);

    expect(submissionSpy).toHaveBeenCalledTimes(1);
    expect(submissionSpy).toHaveBeenCalledWith(req.params.activityId);
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
      currentUser: CURRENT_USER
    };

    checkAndStoreSpy.mockResolvedValue();
    submissionsSpy.mockResolvedValue([SUBMISSION_1]);

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
      currentUser: CURRENT_USER
    };

    checkAndStoreSpy.mockResolvedValue();
    submissionsSpy.mockResolvedValue([SUBMISSION_1]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.getSubmissions(req as any, res as any, next);

    expect(checkAndStoreSpy).toHaveBeenCalledTimes(1);
    expect(submissionsSpy).toHaveBeenCalledTimes(1);
  });

  it('calls next if the submission controller fails to check/create submissions', async () => {
    const req = {
      currentUser: CURRENT_USER
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
      currentUser: CURRENT_USER
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

describe('updateSubmission', () => {
  const next = jest.fn();

  // Mock service calls
  const updateSpy = jest.spyOn(submissionService, 'updateSubmission');
  const getCurrentIdentitySpy = jest.spyOn(utils, 'getCurrentIdentity');
  const getCurrentUserIdSpy = jest.spyOn(userService, 'getCurrentUserId');

  it('should return 200 if all good', async () => {
    const req = {
      body: SUBMISSION_1,
      currentUser: CURRENT_USER
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    const updated = SUBMISSION_1;

    updateSpy.mockResolvedValue(updated);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateSubmission(req as any, res as any, next);

    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_USER, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({ ...req.body, updatedBy: USR_ID });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next if the submission service fails to update', async () => {
    const req = {
      body: SUBMISSION_1,
      currentUser: CURRENT_USER
    };

    const USR_ID = 'abc-123';

    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    updateSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await submissionController.updateSubmission(req as any, res as any, next);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith({ ...(req.body as Submission), updatedBy: USR_ID });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
