import {
  getElectrificationProjectPermitDataController,
  getGeneralProjectPermitDataController,
  getHousingProjectPermitDataController
} from '#src/controllers/reporting';
import * as reportingService from '#src/services/reporting';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

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
  res = mockResponse();
  vi.clearAllMocks();
});

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
    state: null,
    needed: null,
    stage: 'APPLIED',
    submitted_date: '2023-01-01',
    submitted_time: null,
    decision_date: null,
    decision_time: null,
    status_last_verified: null,
    status_last_verified_time: null,
    status_last_changed: null,
    status_last_changed_time: null,
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

describe('getElectrificationProjectPermitDataController', () => {
  it('should call service and respond with 200 and result', async () => {
    vi.spyOn(reportingService, 'getElectrificationProjectPermitDataService').mockResolvedValueOnce(mockData);

    await getElectrificationProjectPermitDataController({} as Request, res as unknown as Response);

    expect(reportingService.getElectrificationProjectPermitDataService).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

describe('getGeneralProjectPermitDataController', () => {
  it('should call service and respond with 200 and result', async () => {
    vi.spyOn(reportingService, 'getGeneralProjectPermitDataService').mockResolvedValueOnce(mockData);

    await getGeneralProjectPermitDataController({} as Request, res as unknown as Response);

    expect(reportingService.getGeneralProjectPermitDataService).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

describe('getHousingProjectPermitDataController', () => {
  it('should call service and respond with 200 and result', async () => {
    vi.spyOn(reportingService, 'getHousingProjectPermitDataService').mockResolvedValueOnce(mockData);

    await getHousingProjectPermitDataController({} as Request, res as unknown as Response);

    expect(reportingService.getHousingProjectPermitDataService).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});
