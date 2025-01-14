import { atsController } from '../../../src/controllers/index.ts';
import { atsService } from '../../../src/services/index.ts';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
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

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null, userId: 'abc-123' };

describe('createATSClient', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(atsService, 'createATSClient');

  it('should return 201 if all good', async () => {
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
      currentContext: CURRENT_CONTEXT
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await atsController.createATSClient(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('calls next if the ats service fails to create', async () => {
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
        optOutOfBCStatSurveyInd: 'NO'
      },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await atsController.createATSClient(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('searchATSUsers', () => {
  const next = jest.fn();

  // Mock service calls
  const searchATSUsersSpy = jest.spyOn(atsService, 'searchATSUsers');

  it('should return 200 if all good', async () => {
    const req = {
      query: { firstName: 'John' },
      currentContext: CURRENT_CONTEXT
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
    await atsController.searchATSUsers(req as any, res as any, next);

    expect(searchATSUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchATSUsersSpy).toHaveBeenCalledWith({ firstName: 'John' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('calls next if the ats service fails to get ats users', async () => {
    const req = {
      query: { firstName: 'John' },
      currentContext: CURRENT_CONTEXT
    };

    searchATSUsersSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await atsController.searchATSUsers(req as any, res as any, next);

    expect(searchATSUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchATSUsersSpy).toHaveBeenCalledWith({ firstName: 'John' });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
