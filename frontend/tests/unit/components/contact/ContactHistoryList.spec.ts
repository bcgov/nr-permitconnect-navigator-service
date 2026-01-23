import PrimeVue from 'primevue/config';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ContactHistoryList from '@/components/contact/ContactHistoryList.vue';
import { ApplicationStatus, EnquirySubmittedMethod, SubmissionType } from '@/utils/enums/projectCommon';
import type { Enquiry, HousingProject } from '@/types';
import { BasicResponse } from '@/utils/enums/application';
import { NumResidentialUnits } from '@/utils/enums/housing';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ replace: vi.fn() }))
}));

const testEnquiry: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  addedToAts: false,
  assignedUserId: 'user123',
  atsClientId: null,
  atsEnquiryId: '654321',
  submissionType: SubmissionType.ASSISTANCE,
  submittedMethod: EnquirySubmittedMethod.EMAIL,
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  enquiryStatus: ApplicationStatus.NEW,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined
};

const testSubmission: HousingProject = {
  activityId: 'activity789',
  housingProjectId: 'submission123',
  projectId: 'submission123',
  queuePriority: 1,
  submissionType: SubmissionType.ASSISTANCE,
  submittedAt: '2023-02-01T12:00:00Z',
  relatedEnquiries: 'none',
  hasRelatedEnquiry: false,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Company Inc.',
  projectName: 'Test Project',
  projectDescription: 'Test Description',
  projectLocationDescription: 'Location Description',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  multiFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  multiPermitsNeeded: 'No',
  otherUnitsDescription: 'None',
  otherUnits: NumResidentialUnits.UNSURE,
  hasRentalUnits: BasicResponse.NO,
  rentalUnits: NumResidentialUnits.UNSURE,
  financiallySupportedBc: BasicResponse.NO,
  financiallySupportedIndigenous: BasicResponse.NO,
  indigenousDescription: '',
  financiallySupportedNonProfit: BasicResponse.NO,
  nonProfitDescription: '',
  financiallySupportedHousingCoop: BasicResponse.NO,
  housingCoopDescription: '',
  streetAddress: '123 Test St',
  locality: 'Test City',
  province: 'Test Province',
  locationPids: 'PID123',
  latitude: 0,
  longitude: 0,
  geomarkUrl: 'http://test.com',
  naturalDisaster: false,
  addedToAts: false,
  atsClientId: null,
  atsEnquiryId: '654321',
  ltsaCompleted: false,
  bcOnlineCompleted: false,
  aaiUpdated: false,
  astNotes: '',
  assignedUserId: 'user123',
  applicationStatus: ApplicationStatus.NEW,
  contacts: [],
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined
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
