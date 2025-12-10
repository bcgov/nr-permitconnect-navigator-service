import { createTestingPinia } from '@pinia/testing';
import { shallowMount } from '@vue/test-utils';

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { sourceSystemKindService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';

import type { AxiosResponse } from 'axios';

const getSourceSystemKindsService = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn(),
    locale: { value: 'en' }
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testSourceSystemKinds = [
  {
    sourceSystemKindId: 3,
    kind: null,
    description: 'Permit Number',
    sourceSystem: 'ITSM-5285',
    createdBy: '00000000-0000-4000-8000-000000000000',
    createdAt: '2025-12-02T23:52:52.615Z',
    updatedBy: null,
    updatedAt: null,
    deletedBy: null,
    deletedAt: null
  },
  {
    sourceSystemKindId: 2,
    kind: null,
    description: 'Application Number',
    sourceSystem: 'ITSM-5285',
    createdBy: '00000000-0000-4000-8000-000000000000',
    createdAt: '2025-12-02T23:52:52.615Z',
    updatedBy: null,
    updatedAt: null,
    deletedBy: null,
    deletedAt: null
  }
];

const wrapperSettings = () => ({
  props: {
    editable: true
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          auth: {
            user: {}
          },
          config: {
            config: { ches: { submission: { cc: 'test@example.com' } } }
          },
          project: {
            project: {
              activityId: 'CE0756D0',
              projectId: 'project-123',
              projectName: 'Test Project',
              assignedUserId: undefined,
              contacts: []
            }
          },
          code: {
            codes: {
              ElectrificationProjectCategory: [],
              ElectrificationProjectType: [],
              EscalationType: [],
              SourceSystem: []
            }
          }
        },
        stubActions: false
      }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    provide: {
      [projectRouteNameKey as symbol]: { value: 'housing-project' },
      [projectServiceKey as symbol]: {
        value: {
          emailConfirmation: vi.fn()
        }
      }
    },
    stubs: {
      'font-awesome-icon': true,
      AuthorizationCardIntake: true,
      AuthorizationStatusUpdatesCard: true,
      AuthorizationUpdateHistory: true,
      FormNavigationGuard: true
    },
    directives: {
      Tooltip: Tooltip
    }
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

  getSourceSystemKindsService.mockResolvedValue({ data: testSourceSystemKinds } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthorizationForm', () => {
  it('renders component', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
