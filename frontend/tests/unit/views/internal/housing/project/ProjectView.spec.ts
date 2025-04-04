import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';

import { documentService, enquiryService, noteService, permitService, housingProjectService } from '@/services';
import ProjectView from '@/views/internal/housing/project/ProjectView.vue';

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
const listDocumentsSpy = vi.spyOn(documentService, 'listDocuments');
const listNotesSpy = vi.spyOn(noteService, 'listNotes');
const listPermitsSpy = vi.spyOn(permitService, 'listPermits');
const getPermitTypesSpy = vi.spyOn(permitService, 'getPermitTypes');
const listRelatedEnquiriesSpy = vi.spyOn(enquiryService, 'listRelatedEnquiries');

getProjectSpy.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
listDocumentsSpy.mockResolvedValue({
  data: [{ filename: 'foo', activityId: 'activity456' }]
} as AxiosResponse);
listNotesSpy.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
listPermitsSpy.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);
getPermitTypesSpy.mockResolvedValue({
  data: { enquiryId: 'enquiry123', activityId: 'activity456' }
} as AxiosResponse);
listRelatedEnquiriesSpy.mockResolvedValue({
  data: { enquiryId: 'enquiry123', activityId: 'activity456' }
} as AxiosResponse);

const testHousingProjectId = 'submission123';
const testActivityId = 'activity123';

const wrapperSettings = (testHousingProjectIdProp = testHousingProjectId, testActivityIdProp = testActivityId) => ({
  props: {
    housingProjectId: testHousingProjectIdProp,
    activityId: testActivityIdProp
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
