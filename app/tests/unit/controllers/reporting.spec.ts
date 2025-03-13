import reportingController from '../../../src/controllers/reporting';
import reportingService from '../../../src/services/reporting';
import { AuthType } from '../../../src/utils/enums/application';

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

const CURRENT_CONTEXT = { authType: AuthType.BEARER, tokenPayload: undefined, userId: 'abc-123' };

describe('getHousingProjectPermitData', () => {
  const next = jest.fn();

  // Mock service call
  const getHousingProjectPermitDataSpy = jest.spyOn(reportingService, 'getHousingProjectPermitData');

  it('should return 200 if all good', async () => {
    const req = {
      query: {},
      currentContext: CURRENT_CONTEXT
    };

    const mockData = [
      {
        project_name: 'Project A',
        consent_to_feedback: 'Yes',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '555-555-5555',
        email: 'john@example.com',
        contact_preference: 'email',
        contact_applicant_relationship: 'Owner',
        activity_id: 'abc-123',
        street_address: '123 Main St',
        locality: 'Exampleville',
        latitude: 48.4284,
        longitude: -123.3656,
        location_pids: null,
        issued_permit_id: 'ISS-12345',
        tracking_id: 'TRACK-0001',
        auth_status: null,
        needed: null,
        status: 'APPLIED',
        submitted_date: '2023-01-01T00:00:00.000Z',
        adjudication_date: null,
        status_last_verified: null,
        agency: 'Ministry of Test',
        division: 'Permits Division',
        branch: null,
        permit_type: 'SomePermitType',
        family: null,
        name: 'Testing Permit',
        acronym: 'TP',
        tracked_in_ats: false,
        source_system: 'TestSystem',
        source_system_acronym: 'TS'
      }
    ];

    getHousingProjectPermitDataSpy.mockResolvedValue(mockData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await reportingController.getHousingProjectPermitData(req as any, res as any, next);

    expect(getHousingProjectPermitDataSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('calls next if the submission service fails to get permit data', async () => {
    const req = {
      query: {},
      currentContext: CURRENT_CONTEXT
    };

    getHousingProjectPermitDataSpy.mockImplementationOnce(() => {
      throw new Error('Service error');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await reportingController.getHousingProjectPermitData(req as any, res as any, next);

    expect(getHousingProjectPermitDataSpy).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
