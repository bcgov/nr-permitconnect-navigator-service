import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import SubmissionListNavigator from '@/components/housing/submission/SubmissionListNavigator.vue';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { GroupName } from '@/utils/enums/application';

import type { HousingProject, IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute, Group } from '@/types';

const currentDate = new Date().toISOString();
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

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
const testUser = {
  active: true,
  email: 'john.doe@example.com',
  firstName: 'John',
  fullName: 'John Doe',
  idp: 'idir',
  lastName: 'Doe',
  groups: [{ groupId: 1, name: GroupName.DEVELOPER } as Group],
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

// Example Contact object
const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

// Example Submission object
const testSubmission: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'submission789',
  projectId: 'submission789',
  queuePriority: 1,
  submissionType: 'Type A',
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  isDevelopedInBC: 'Yes',
  projectName: 'Project Alpha',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: '10',
  multiFamilyUnits: '20',
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: '5',
  hasRentalUnits: 'Yes',
  rentalUnits: '15',
  financiallySupportedBC: 'Yes',
  financiallySupportedIndigenous: 'Yes',
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: 'Yes',
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: 'Yes',
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPIDs: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: 'None',
  addedToATS: true,
  atsClientId: 654321,
  atsEnquiryId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  intakeStatus: 'Pending',
  applicationStatus: ApplicationStatus.COMPLETED,
  contacts: [exampleContact],
  user: testUser,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const testSubmissions = [testSubmission];

const wrapperSettings = (testSubmissionsProp = testSubmissions) => ({
  props: {
    submissions: testSubmissionsProp,
    loading: false
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
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('SubmissionListNavigator.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(SubmissionListNavigator, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
