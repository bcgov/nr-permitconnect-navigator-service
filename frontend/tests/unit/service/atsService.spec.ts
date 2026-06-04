import { atsService, createAtsClient, createAtsEnquiry, searchAtsUsers } from '@/services/atsService';
import { appAxios } from '@/services/interceptors';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('ats service', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet,
      post: mockPost
    } as never);
  });

  describe('searchAtsUsers', () => {
    it('returns ATS users and status', async () => {
      const request = {
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const response = {
        '@type': 'Clients',
        links: [],
        pageNumber: 1,
        pageRowCount: 1,
        totalRowCount: 1,
        totalPageCount: 1,
        clients: []
      };

      mockGet.mockResolvedValue({
        status: 200,
        data: response
      });

      const result = await searchAtsUsers(request);

      expect(mockGet).toHaveBeenCalledWith('ats/clients', {
        params: request
      });

      expect(result).toEqual({
        status: 200,
        data: response
      });
    });

    it('handles empty search parameters', async () => {
      const response = {
        '@type': 'Clients',
        links: [],
        pageNumber: 1,
        pageRowCount: 0,
        totalRowCount: 0,
        totalPageCount: 0,
        clients: []
      };

      mockGet.mockResolvedValue({
        status: 200,
        data: response
      });

      const result = await searchAtsUsers({});

      expect(mockGet).toHaveBeenCalledWith('ats/clients', {
        params: {}
      });

      expect(result.data.clients).toEqual([]);
    });

    it('propagates errors', async () => {
      const error = new Error('search failed');

      mockGet.mockRejectedValue(error);

      await expect(
        searchAtsUsers({
          firstName: 'Jane'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('createAtsClient', () => {
    it('creates a client and returns status', async () => {
      const request = {
        '@type': 'Client',
        links: [],
        clientId: 123,
        address: {
          '@type': 'Address',
          links: [],
          addressId: 456,
          addressLine1: '123 Example Ave',
          addressLine2: null,
          city: 'Sample City',
          provinceCode: 'BC',
          countryCode: 'CA',
          postalCode: 'A1A1A1',
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
        firstName: 'Jane',
        formattedAddress: '123 Example Ave',
        surName: 'Doe',
        companyName: null,
        organizationNumber: null,
        confirmedIndicator: true,
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        regionName: null,
        optOutOfBCStatSurveyInd: null
      };

      mockPost.mockResolvedValue({
        status: 201,
        data: request
      });

      const result = await createAtsClient(request);

      expect(mockPost).toHaveBeenCalledWith('ats/client', request);

      expect(result).toEqual({
        status: 201,
        data: request
      });
    });

    it('propagates errors', async () => {
      const error = new Error('create client failed');

      mockPost.mockRejectedValue(error);

      await expect(createAtsClient({} as never)).rejects.toThrow(error);
    });
  });

  describe('createAtsEnquiry', () => {
    it('creates an enquiry and returns status', async () => {
      const request = {
        '@type': 'Enquiry',
        clientId: 123,
        contactFirstName: 'Jane',
        contactSurname: 'Doe',
        notes: 'Test enquiry',
        regionName: 'Region A',
        subRegionalOffice: 'Office A',
        enquiryTypeCodes: ['TYPE_1'],
        enquiryMethodCodes: ['PHONE'],
        enquiryPartnerAgencies: [],
        enquiryFileNumbers: []
      };

      mockPost.mockResolvedValue({
        status: 201,
        data: request
      });

      const result = await createAtsEnquiry(request);

      expect(mockPost).toHaveBeenCalledWith('ats/enquiry', request);

      expect(result).toEqual({
        status: 201,
        data: request
      });
    });

    it('propagates errors', async () => {
      const error = new Error('create enquiry failed');

      mockPost.mockRejectedValue(error);

      await expect(createAtsEnquiry({} as never)).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(atsService).toEqual({
      searchAtsUsers,
      createAtsClient,
      createAtsEnquiry
    });
  });
});
