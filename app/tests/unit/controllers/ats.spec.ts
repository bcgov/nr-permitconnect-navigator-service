import { TEST_CURRENT_CONTEXT } from '../data';
import {
  createATSClientController,
  createATSEnquiryController,
  searchATSUsersController
} from '../../../src/controllers/ats';
import * as atsService from '../../../src/services/ats';

import type { Request, Response } from 'express';
import type { ATSClientResource, ATSEnquiryResource } from '../../../src/types';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('createATSClientController', () => {
  const createSpy = jest.spyOn(atsService, 'createATSClient');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        '@type': 'ClientResource',
        address: {
          '@type': 'AddressResource',
          addressLine1: null,
          city: null,
          provinceCode: null,
          primaryPhone: '(213) 213-2132',
          email: 's@s.com'
        },
        firstName: 'Gill',
        surName: 'Bates',
        regionName: 'HOUSING',
        optOutOfBCStatSurveyInd: 'NO'
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const created = {
      data: {
        '@type': 'ClientResource',
        address: {
          '@type': 'AddressResource',
          addressLine1: null,
          city: null,
          provinceCode: null,
          primaryPhone: '(213) 213-2132',
          email: 's@s.com'
        },
        firstName: 'Gill',
        surName: 'Bates',
        regionName: 'HOUSING',
        optOutOfBCStatSurveyInd: 'NO'
      },
      status: 201
    };

    createSpy.mockResolvedValue(created);

    await createATSClientController(
      req as unknown as Request<never, never, ATSClientResource, never>,
      res as unknown as Response
    );

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('createATSEnquiryController', () => {
  const createSpy = jest.spyOn(atsService, 'createATSEnquiry');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        '@type': 'EnquiryResource',
        clientId: 256432,
        contactFirstName: 'PCNS BusinessTester',
        contactSurname: 'k12',
        regionName: 'Navigator',
        subRegionalOffice: 'Navigator',
        enquiryFileNumbers: ['B8D4B783'],
        enquiryPartnerAgencies: ['Housing'],
        enquiryMethodCodes: ['PCNS'],
        notes: 'dsdsa',
        enquiryTypeCodes: ['Project Intake'],
        createdBy: 'IDIR\\DONNY'
      },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const created = {
      data: {
        '@type': 'EnquiryResource',
        clientId: 256432,
        contactFirstName: 'PCNS BusinessTester',
        contactSurname: 'k12',
        regionName: 'Navigator',
        subRegionalOffice: 'Navigator',
        enquiryFileNumbers: ['B8D4B783'],
        enquiryPartnerAgencies: ['Housing'],
        enquiryMethodCodes: ['PCNS'],
        notes: 'dsdsa',
        enquiryTypeCodes: ['Project Intake'],
        createdBy: 'IDIR\\DONNY'
      },
      status: 201
    };

    createSpy.mockResolvedValue(created);

    await createATSEnquiryController(
      req as unknown as Request<never, never, ATSEnquiryResource, never>,
      res as unknown as Response
    );

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('searchATSUsersController', () => {
  const searchATSUsersSpy = jest.spyOn(atsService, 'searchATSUsers');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { firstName: 'John' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    const atsUsers = {
      data: {
        '@type': 'ClientsResource',
        links: [
          {
            '@type': 'RelLink',
            rel: 'self',
            href: 'https://t1api.nrs.gov.bc.ca/ats-api/clients?firstName=John',
            method: 'GET'
          },
          {
            '@type': 'RelLink',
            rel: 'next',
            href: 'https://t1api.nrs.gov.bc.ca/ats-api/clients?firstName=John',
            method: 'GET'
          }
        ],
        pageNumber: 0,
        pageRowCount: 956,
        totalRowCount: 956,
        totalPageCount: 1,
        clients: [
          {
            '@type': 'ClientResource',
            links: [
              {
                '@type': 'RelLink',
                rel: 'self',
                href: 'https://t1api.nrs.gov.bc.ca/ats-api/clients',
                method: 'GET'
              }
            ],
            clientId: 96,
            address: {
              '@type': 'AddressResource',
              links: [],
              addressId: 443,
              addressLine1: null,
              addressLine2: null,
              city: 'Fqmrpml',
              provinceCode: 'Alberta',
              countryCode: 'Canada',
              postalCode: null,
              primaryPhone: null,
              secondaryPhone: null,
              fax: null,
              email: null,
              createdBy: null,
              createdDateTime: null,
              updatedBy: null,
              updatedDateTime: null
            },
            businessOrgCode: null,
            firstName: 'John',
            surName: 'Nike',
            companyName: null,
            organizationNumber: null,
            confirmedIndicator: false,
            createdBy: 'IDIR\\JNNIKE',
            createdDateTime: 1166734440000,
            updatedBy: 'ATS',
            updatedDateTime: 1166734440000,
            regionName: 'Skeena',
            optOutOfBCStatSurveyInd: 'NO'
          }
        ]
      },
      status: 200
    };

    searchATSUsersSpy.mockResolvedValue(atsUsers);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await searchATSUsersController(req as any, res as unknown as Response);

    expect(searchATSUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchATSUsersSpy).toHaveBeenCalledWith({ firstName: 'John' });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
