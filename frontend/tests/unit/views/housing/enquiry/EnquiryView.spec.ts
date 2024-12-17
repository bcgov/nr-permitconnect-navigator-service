import EnquiryView from '@/views/housing/enquiry/EnquiryView.vue';
import { enquiryService, noteService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { shallowMount } from '@vue/test-utils';
import type { AxiosResponse } from 'axios';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

const useEnquiryService = vi.spyOn(enquiryService, 'getEnquiry');
const useNoteService = vi.spyOn(noteService, 'listNotes');

useNoteService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
useEnquiryService.mockResolvedValue({ data: { enquiryId: 'enquiry123', activityId: 'activity456' } } as AxiosResponse);

const testEnquiryId = 'enquiry123';
const testActivityId = 'activity123';

const wrapperSettings = (testEnquiryIdProp = testEnquiryId, testActivityIdProp = testActivityId) => ({
  props: {
    enquiryId: testEnquiryIdProp,
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

describe('EnquiryView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(EnquiryView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
