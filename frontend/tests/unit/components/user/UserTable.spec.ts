import { mount } from '@vue/test-utils';
import { AccessRequestStatus, GroupName } from '@/utils/enums/application';
import UserTable from '@/components/user/UserTable.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import type { IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute, User, UserAccessRequest } from '@/types';

const currentDate = new Date().toISOString();

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

const exampleAccessRequest = {
  accessRequestId: 'accessRequest123',
  grant: true,
  group: GroupName.ADMIN,
  status: AccessRequestStatus.PENDING,
  userId: 'user123',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

// Example User object
const exampleUser: User = {
  active: true,
  email: 'john.doe@example.com',
  firstName: 'John',
  fullName: 'John Doe',
  identityId: 'identity-123',
  idp: 'idir',
  lastName: 'Doe',
  groups: [GroupName.ADMIN],
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

// Example UserAccessRequest object
const testUserAndAccessRequests: UserAccessRequest = {
  accessRequest: exampleAccessRequest,
  user: exampleUser
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = (testUserAndAccessRequestsProp = testUserAndAccessRequests) => ({
  props: {
    usersAndAccessRequests: [testUserAndAccessRequestsProp]
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
      PrimeVue
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('UserTable.vue', () => {
  it('renders', () => {
    const wrapper = mount(UserTable, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });
});
