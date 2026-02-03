import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { electrificationProjectService, housingProjectService, permitService } from '@/services';
import { Initiative } from '@/utils/enums/application';
import AuthorizationView from '@/views/internal/AuthorizationView.vue';
import { mockAxiosResponse, t } from '../../../helpers';

// Mock functions we need to test
const toastErrorMock = vi.fn();

// Mock dependencies
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn()
  })
}));

vi.mock('@/lib/primevue/useToast', () => ({
  useToast: () => ({
    error: toastErrorMock
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock('@/services/electrificationProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  default: {
    getProject: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  default: {
    getPermit: vi.fn()
  }
}));

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
    projectId: '1',
    permitId: '3'
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: {
            initiative
          }
        },
        stubActions: false
      }),
      i18n,
      PrimeVue,
      ToastService
    ]
  }
});

// Tests
beforeEach(() => {
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse([{ electrificationProjectId: '1' }])
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(mockAxiosResponse([{ housingProjectId: '1' }]));
  vi.mocked(permitService.getPermit).mockResolvedValue(mockAxiosResponse({ permitId: '3' }));
});

afterEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('AuthorizationView.vue', () => {
  it('does not render while loading', async () => {
    const wrapper = shallowMount(AuthorizationView, wrapperSettings());
    expect(wrapper.findComponent(AuthorizationForm).exists()).toBe(false);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(AuthorizationView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(expect.any(String), t('views.initiativeStateError'), undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(permitService.getPermit).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(AuthorizationView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(expect.any(String), 'BOOM', undefined);
  });

  it('renders AuthorizationForm after loading', async () => {
    const wrapper = shallowMount(AuthorizationView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(AuthorizationForm).exists()).toBe(true);
  });

  it('passes props to AuthorizationForm', async () => {
    const wrapper = shallowMount(AuthorizationView, wrapperSettings());
    await flushPromises();

    const childComponent = wrapper.findComponent(AuthorizationForm);
    expect(childComponent.props('authorization')).toStrictEqual({ permitId: '3' });
    expect(childComponent.props('editable')).toStrictEqual(true);
  });
});
