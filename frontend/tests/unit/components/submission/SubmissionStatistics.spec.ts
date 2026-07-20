import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';
import { projectServiceKey } from '@/utils/keys';

const testConfirmationId = 'activity123';

const wrapperSettings = (testConfirmationIdProp = testConfirmationId) => ({
  props: {
    confirmationId: testConfirmationIdProp
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
    provide: {
      [projectServiceKey as symbol]: { value: { foo: vi.fn() } }
    },
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('SubmissionStatistics.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(SubmissionStatistics, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
