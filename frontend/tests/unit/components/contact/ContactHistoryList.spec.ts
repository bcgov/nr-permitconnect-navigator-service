import PrimeVue from 'primevue/config';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ContactHistoryList from '@/components/contact/ContactHistoryList.vue';
import { ApplicationStatus, EnquirySubmittedMethod } from '@/utils/enums/projectCommon';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ replace: vi.fn() }))
}));

const testEnquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  addedToATS: false,
  assignedUserId: 'user123',
  atsClientId: null,
  submissionType: 'General Inquiry',
  submittedMethod: EnquirySubmittedMethod.EMAIL,
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.NEW,
  contacts: []
};

const testSubmission = {
  activityId: 'activity789',
  housingProjectId: 'submission123',
  projectId: 'submission123',
  queuePriority: 1,
  submissionType: 'TypeA',
  submittedAt: '2023-02-01T12:00:00Z',
  relatedEnquiries: 'none',
  hasRelatedEnquiry: false,
  companyNameRegistered: 'Company Inc.',
  isDevelopedInBC: 'Yes',
  projectName: 'Test Project',
  projectDescription: 'Test Description',
  projectLocationDescription: 'Location Description',
  singleFamilyUnits: '1',
  multiFamilyUnits: '0',
  multiPermitsNeeded: 'No',
  otherUnitsDescription: 'None',
  otherUnits: '0',
  hasRentalUnits: 'No',
  rentalUnits: '0',
  financiallySupportedBC: 'No',
  financiallySupportedIndigenous: 'No',
  indigenousDescription: '',
  financiallySupportedNonProfit: 'No',
  nonProfitDescription: '',
  financiallySupportedHousingCoop: 'No',
  housingCoopDescription: '',
  streetAddress: '123 Test St',
  locality: 'Test City',
  province: 'Test Province',
  locationPIDs: 'PID123',
  latitude: 0,
  longitude: 0,
  geomarkUrl: 'http://test.com',
  naturalDisaster: 'None',
  addedToATS: false,
  atsClientId: null,
  ltsaCompleted: false,
  bcOnlineCompleted: false,
  aaiUpdated: false,
  astNotes: '',
  intakeStatus: 'Pending',
  assignedUserId: 'user123',
  applicationStatus: ApplicationStatus.NEW,
  contacts: []
};

const testHistory = [testEnquiry, testSubmission];

const testAssignedUsers = {
  user123: 'John Doe'
};

const wrapperSettings = (loading = false, contactsHistory = testHistory, assignedUsers = testAssignedUsers) => ({
  props: {
    loading,
    contactsHistory,
    assignedUsers
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: { user: {} }
          }
        }),
      PrimeVue
    ],
    stubs: ['Spinner', 'DataTable', 'Column', 'router-link']
  }
});

describe('ContactHistoryList.vue', () => {
  it('renders the component with provided props', () => {
    const wrapper = mount(ContactHistoryList, wrapperSettings());
    expect(wrapper.exists()).toBe(true);
  });
});
