import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import { contactService, permitService, housingProjectService, electrificationProjectService } from '@/services';
import { Initiative } from '@/utils/enums/application';
import PermitStatusView from '@/views/external/PermitStatusView.vue';
import { PRIMEVUE_STUBS, t } from '../../../helpers';
import type { Permit } from '@/types';

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
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('@/services/contactService', () => ({
  contactService: {
    searchContacts: vi.fn()
  }
}));

vi.mock('@/services/permitService', () => ({
  permitService: {
    getPermit: vi.fn()
  }
}));

vi.mock('@/services/electrificationProjectService', () => ({
  electrificationProjectService: {
    searchProjects: vi.fn()
  }
}));

vi.mock('@/services/housingProjectService', () => ({
  housingProjectService: {
    searchProjects: vi.fn()
  }
}));

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
    permitId: '123',
    projectId: '123'
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: {
            initiative
          }
        }
      }),
      i18n,
      PrimeVue
    ],
    stubs: {
      'font-awesome-icon': true,
      'router-link': true,
      ...PRIMEVUE_STUBS
    }
  }
});

// Tests
beforeEach(() => {
  vi.mocked(contactService.searchContacts).mockResolvedValue([]);
  vi.mocked(permitService.getPermit).mockResolvedValue({ permitId: '123' } as Permit);
  vi.mocked(electrificationProjectService.searchProjects).mockResolvedValue([]);
  vi.mocked(housingProjectService.searchProjects).mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('PermitStatusView', () => {
  it('throws error if unknown initiative', async () => {
    shallowMount(PermitStatusView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(permitService.getPermit).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(PermitStatusView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.e.permitStatusView.unableToLoad'), undefined, undefined);
  });
});
