import ATSUserCreateModal from '@/components/user/ATSUserCreateModal.vue';
import { ApplicationStatus } from '@/utils/enums/housing';
import { GroupName } from '@/utils/enums/application';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';
import type { Enquiry, Submission, IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute } from '@/types';

const currentDate = new Date().toISOString();

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
  identityId: 'identity-123',
  idp: 'idir',
  lastName: 'Doe',
  groups: [GroupName.DEVELOPER],
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
const testSubmission: Submission = {
  activityId: 'activity456',
  submissionId: 'submission789',
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
  atsClientNumber: 'ATS123',
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

// Example Enquiry object
const testEnquiryProp: Enquiry = {
  enquiryId: 'c2a0677e-5598-48a7-a867-59bd2b94af52',
  activityId: '85C6700B',
  addedToATS: true,
  assignedUserId: 'someId',
  atsClientNumber: 'ATS123',
  enquiryType: 'General enquiry',
  submittedAt: '2025-02-04T18:38:39.497Z',
  submittedBy: 'testUser',
  relatedActivityId: '',
  enquiryDescription: 'gshsrthsftfgjdfjdyjyj',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.COMPLETED,
  waitingOn: '',
  contacts: [
    {
      contactId: '49a61520-110e-48ad-a7be-c951fbd3ea9c',
      userId: '40ba3d41-871a-4939-a177-605face624bc',
      firstName: 'testFirst',
      lastName: 'testFirst',
      phoneNumber: '(123) 456-7890',
      email: 'test.1.test@gov.bc.ca',
      contactPreference: 'Phone call',
      contactApplicantRelationship: 'Property owner'
    }
  ]
};

const wrapperSettings = (testSubmissionProp: Enquiry | Submission = testSubmission) => ({
  props: {
    submissionOrEnquiry: testSubmissionProp
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

describe('ATSUserCreateModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props, a submission', () => {
    const wrapper = mount(ATSUserCreateModal, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('renders the component with the provided props, an enquiry', () => {
    const wrapper = mount(ATSUserCreateModal, wrapperSettings(testEnquiryProp));
    expect(wrapper).toBeTruthy();
  });
});
