import atsService from '@/services/atsService';
import { appAxios } from '@/services/interceptors';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testObj = {
  firstName: 'John'
};

const testRelLink = {
  '@type': 'LinkType',
  rel: 'self',
  href: 'http://example.com',
  method: 'GET'
};

const testAddressResource = {
  '@type': 'AddressType',
  links: [testRelLink],
  addressId: 1,
  addressLine1: '123 Main St',
  addressLine2: 'Apt 4B',
  city: 'Anytown',
  provinceCode: 'CA',
  countryCode: 'US',
  postalCode: '12345',
  primaryPhone: '123-456-7890',
  secondaryPhone: '098-765-4321',
  fax: '123-456-7890',
  email: 'address@example.com',
  createdBy: 'creator',
  createdDateTime: Date.now(),
  updatedBy: 'updater',
  updatedDateTime: Date.now()
};

const testATSClientResource = {
  '@type': 'ClientType',
  links: [testRelLink],
  clientId: 123,
  address: testAddressResource,
  businessOrgCode: 'BUS123',
  firstName: 'John',
  formattedAddress: '123 Main St, Apt 4B, Anytown, BC, V6H1T4',
  surName: 'Doe',
  companyName: 'Example Company',
  organizationNumber: 'ORG456',
  confirmedIndicator: true,
  createdBy: 'creator',
  createdDateTime: Date.now(),
  updatedBy: 'updater',
  updatedDateTime: Date.now(),
  regionName: 'RegionName',
  optOutOfBCStatSurveyInd: 'N'
};

const getSpy = vi.fn();
const postSpy = vi.fn();

vi.mock('@/services/interceptors');
vi.mocked(appAxios).mockReturnValue({
  get: getSpy,
  post: postSpy
} as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('atsService', () => {
  describe('searchATSUsers', () => {
    it('calls with given data', () => {
      atsService.searchATSUsers(testObj);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('ats/clients', { params: testObj });
    });
  });

  describe('createATSClient', () => {
    it('calls with given data', () => {
      atsService.createATSClient(testATSClientResource);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('ats/client', testATSClientResource);
    });
  });
});
