import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';

import FileUpload from '@/components/file/FileUpload.vue';
import { StorageKey } from '@/utils/enums/application';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const activityId = 'activityUUID';

const wrapperSettings = () => ({
  props: {
    activityId: activityId
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
    stubs: ['font-awesome-icon']
  }
});

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('FileUpload', () => {
  it('renders component', async () => {
    const wrapper = mount(FileUpload, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
