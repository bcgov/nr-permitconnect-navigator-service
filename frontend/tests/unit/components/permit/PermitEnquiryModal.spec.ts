import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import PermitEnquiryModal from '@/components/permit/PermitEnquiryModal.vue';
import { userService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { GroupName } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import type { Permit, PermitType } from '@/types';
import type { AxiosResponse } from 'axios';
import Tooltip from 'primevue/tooltip';
import type { IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute } from '@/types';

const useUserService = vi.spyOn(userService, 'searchUsers');

// Types
type CombinedPermit = Permit & PermitType;

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const currentDate = new Date().toISOString();
const testPermitType = {
  permitTypeId: 1,
  agency: 'Environmental Agency',
  division: 'Water Resources',
  branch: 'Permitting',
  businessDomain: 'Environmental Protection',
  type: 'Water Use Permit',
  name: 'Water Use Permit for Agriculture',
  sourceSystem: 'Permit Management System',
  sourceSystemAcronym: 'PMS',
  family: 'Water Use',
  nameSubtype: 'Agriculture',
  acronym: 'WUPA',
  trackedInATS: true
};
const testPermit: CombinedPermit = {
  permitId: 'permitUUID',
  activityId: 'activityUUID',
  needed: 'yes',
  status: 'status',
  issuedPermitId: 'issued Permit ID',
  trackingId: 'test tracking ID',
  authStatus: 'test auth status',
  submittedDate: currentDate,
  adjudicationDate: currentDate,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  ...testPermitType
};

const testUpdatedBy = 'testUpdatedBy';

// Example IDIRAttribute object
const exampleIDIRAttribute: IDIRAttribute = {
  idirUsername: 'idirUser',
  idirUserGuid: 'idir-guid-123'
};

// Example BasicBCeIDAttribute object
const exampleBasicBCeIDAttribute: BasicBCeIDAttribute = {
  bceidUsername: 'bceidUser',
  bceidUserGuid: 'bceid-guid-123'
};

// Example BusinessBCeIDAttribute object
const exampleBusinessBCeIDAttribute: BusinessBCeIDAttribute = {
  bceidBusinessGuid: 'business-guid-123',
  bceidBusinessName: 'Example Business',
  ...exampleBasicBCeIDAttribute
};

// Example User object
const testNavigator = {
  active: true,
  email: 'john.doe@example.com',
  firstName: 'John',
  fullName: 'John Doe',
  identityId: 'identity-123',
  idp: 'idir',
  lastName: 'Doe',
  groups: [GroupName.NAVIGATOR],
  status: 'active',
  userId: 'user123',
  sub: 'sub-123',
  elevatedRights: true,
  idirAttributes: exampleIDIRAttribute,
  bceidAttributes: exampleBasicBCeIDAttribute,
  businessBceidAttribute: exampleBusinessBCeIDAttribute,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const wrapperSettings = (
  testPermitProp = testPermit,
  testUpdatedByProp = testUpdatedBy,
  testNavigatorProp = testNavigator
) => ({
  props: {
    permit: testPermitProp,
    updatedBy: testUpdatedByProp,
    navigator: testNavigatorProp
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    directives: {
      tooltip: Tooltip
    },
    stubs: ['font-awesome-icon']
  }
});

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();

  useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('PermitEnquiryModal', () => {
  it('renders component', () => {
    const wrapper = mount(PermitEnquiryModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
