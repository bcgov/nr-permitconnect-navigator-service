import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import {
  activityContactService,
  documentService,
  enquiryService,
  noteHistoryService,
  permitService,
  housingProjectService
} from '@/services';
import ProjectView from '@/views/internal/ProjectView.vue';

import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

const getProjectSpy = vi.spyOn(housingProjectService, 'getProject');
const listActivityContactsSpy = vi.spyOn(activityContactService, 'listActivityContacts');
const listDocumentsSpy = vi.spyOn(documentService, 'listDocuments');
const listNotesSpy = vi.spyOn(noteHistoryService, 'listNoteHistories');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const listRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'listRelatedEnquiries');

getProjectSpy.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
listActivityContactsSpy.mockResolvedValue({
  data: []
} as AxiosResponse);
listDocumentsSpy.mockResolvedValue({
  data: [{ filename: 'foo', activityId: 'activity456' }]
} as AxiosResponse);
listNotesSpy.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
listPermitsSpy.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
getPermitTypesSpy.mockResolvedValue({
  data: { enquiryId: 'enquiry123', activityId: 'activity456' }
} as AxiosResponse);
listRelatedEnquiriesSpy.mockResolvedValue({
  data: [{ enquiryId: 'enquiry123', activityId: 'activity456' }]
} as AxiosResponse);

const testHousingProjectId = 'project123';

const wrapperSettings = (testHousingProjectIdProp = testHousingProjectId) => ({
  props: {
    projectId: testHousingProjectIdProp
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

describe('ProjectView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(ProjectView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
