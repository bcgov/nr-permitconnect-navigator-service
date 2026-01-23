// tests/unit/components/roadmap/Roadmap.spec.ts

import { reactive, ref } from 'vue';
import { nextTick, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import Roadmap from '@/components/roadmap/Roadmap.vue';
import { userService, roadmapService } from '@/services';
import { Initiative } from '@/utils/enums/application';

import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

vi.mock('@/store', () => {
  return {
    useConfigStore: () =>
      reactive({
        getConfig: ref({ ches: { roadmap: { bcc: 'bcc@example.com' } } })
      }),
    useProjectStore: () =>
      reactive({
        getPermits: ref([]),
        getDocuments: ref([]),
        getProject: ref({
          activityId: 'act1',
          projectName: 'Test Project',
          assignedUserId: undefined,
          contacts: []
        })
      }),
    useAppStore: () =>
      reactive({
        getInitiative: ref(Initiative.HOUSING)
      })
  };
});

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
searchUsersSpy.mockResolvedValue({ data: [] } as AxiosResponse);

const sendSpy = vi.spyOn(roadmapService, 'send');
sendSpy.mockResolvedValue({} as AxiosResponse);

const testActivityId = 'act1';

const wrapperSettingsForm = (editable = true) => ({
  props: { activityId: testActivityId, editable },
  global: {
    plugins: [
      () => createTestingPinia({ initialState: { auth: { user: {} } } }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: {
      // Stub vee-validate's <Form> so setFieldValue() exists
      Form: defineComponent({
        setup(_props, { expose }) {
          expose({ setFieldValue: () => {} });
          return {};
        },
        template: '<div><slot/></div>'
      }),
      FileSelectModal: true,
      InputText: true,
      TextArea: true,
      Button: true
    }
  }
});

describe('Roadmap.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with provided props', async () => {
    const wrapper = mount(Roadmap, wrapperSettingsForm());
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
