import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import {
  getElectrificationProjectPermitDataController,
  getHousingProjectPermitDataController
} from '../../../src/controllers/reporting.ts';
import * as reportingService from '../../../src/services/reporting.ts';

import type { Request, Response } from 'express';

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

describe('getElectrificationProjectPermitDataController', () => {
  const getElectrificationProjectPermitDataSpy = jest.spyOn(reportingService, 'getElectrificationProjectPermitData');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: {},
      currentContext: TEST_CURRENT_CONTEXT
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

    getElectrificationProjectPermitDataSpy.mockResolvedValue(mockData);

    await getElectrificationProjectPermitDataController(req as unknown as Request, res as unknown as Response);

    expect(getElectrificationProjectPermitDataSpy).toHaveBeenCalledTimes(1);
    expect(getElectrificationProjectPermitDataSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

describe('getHousingProjectPermitDataController', () => {
  const getHousingProjectPermitDataSpy = jest.spyOn(reportingService, 'getHousingProjectPermitData');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: {},
      currentContext: TEST_CURRENT_CONTEXT
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

    getHousingProjectPermitDataSpy.mockResolvedValue(mockData);

    await getHousingProjectPermitDataController(req as unknown as Request, res as unknown as Response);

    expect(getHousingProjectPermitDataSpy).toHaveBeenCalledTimes(1);
    expect(getHousingProjectPermitDataSpy).toHaveBeenCalledWith(prismaTxMock);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});
