import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import ProjectListNavigator from '@/components/projectCommon/ProjectListNavigator.vue';
import { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { BasicResponse, GroupName } from '@/utils/enums/application';
import { NumResidentialUnits } from '@/utils/enums/housing';

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
  bceidBusinessName: '',
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

// Example Project object
const testProject: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'project789',
  projectId: 'project789',
  queuePriority: 1,
  submissionType: SubmissionType.ASSISTANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  projectName: 'Project Alpha',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  multiFamilyUnits: NumResidentialUnits.UNSURE,
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: NumResidentialUnits.UNSURE,
  hasRentalUnits: BasicResponse.YES,
  rentalUnits: '15',
  financiallySupportedBc: BasicResponse.YES,
  financiallySupportedIndigenous: BasicResponse.YES,
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: BasicResponse.YES,
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: BasicResponse.YES,
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPids: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: false,
  addedToAts: true,
  atsClientId: 654321,
  atsEnquiryId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  applicationStatus: ApplicationStatus.COMPLETED,
  contacts: [exampleContact],
  user: testUser,
  roadmapNote: 'Roadmap note.',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const testProjects = [testProject];

const wrapperSettings = (testProjectsProp = testProjects) => ({
  props: {
    projects: testProjectsProp,
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

describe('ProjectListNavigator.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(ProjectListNavigator, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
