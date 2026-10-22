import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { useForm } from 'vee-validate';
import { mount, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ProjectIntakeAssistance from '@/components/housing/project/ProjectIntakeAssistance.vue';
import { enquiryService } from '@/services';
import { SubmissionType } from '@/utils/enums/projectCommon';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const TestWrapper = {
  components: { ProjectIntakeAssistance },
  setup() {
    useForm(); // provides vee-validate form context
  },
  template: '<ProjectIntakeAssistance  />'
};

const wrapperSettings = () => ({
  global: {
    plugins: [
      createTestingPinia({
        initialState: {}
      }),
      i18n,
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('ProjectIntakeAssistance.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', () => {
    const wrapper = shallowMount(TestWrapper, wrapperSettings());
    expect(wrapper.findComponent(ProjectIntakeAssistance).exists()).toBe(true);
  });

  // The API's create enquiry body is flat and strict, so a nested basic section is rejected
  it('requests assistance with a flat create enquiry payload', async () => {
    const createEnquirySpy = vi.spyOn(enquiryService, 'createEnquiry').mockResolvedValue({ enquiryId: 'e1' } as never);
    const wrapper = mount(
      {
        components: { ProjectIntakeAssistance },
        setup() {
          useForm({ initialValues: { contacts: { contactId: 'c1', firstName: 'First', email: 'a@b.co' } } });
        },
        template: '<ProjectIntakeAssistance />'
      },
      {
        global: {
          ...wrapperSettings().global,
          stubs: { 'font-awesome-icon': true, 'router-link': true, teleport: true }
        }
      }
    );

    await (
      wrapper.findComponent(ProjectIntakeAssistance).vm as unknown as { onAssistanceRequest: () => Promise<void> }
    ).onAssistanceRequest();

    expect(createEnquirySpy).toHaveBeenCalledWith({
      enquiryDescription: expect.any(String),
      submissionType: SubmissionType.ASSISTANCE,
      contact: expect.objectContaining({ contactId: 'c1', firstName: 'First', email: 'a@b.co' })
    });
  });
});
