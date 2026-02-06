import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, shallowMount, RouterLinkStub } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import { Message } from '@/lib/primevue';
import ProjectConfirmationView from '@/views/external/ProjectConfirmationView.vue';
import { mockAxiosResponse, PRIMEVUE_STUBS, t } from '../../../helpers';

import { Initiative, RouteName } from '@/utils/enums/application';
import { electrificationProjectService, housingProjectService } from '@/services';

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

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
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
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: {
      RouterLink: RouterLinkStub,
      ...PRIMEVUE_STUBS
    }
  }
});

// Tests
beforeEach(() => {
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ housingProjectId: '123', activityId: '123' })
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(
    mockAxiosResponse({ housingProjectId: '123', activityId: '123' })
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('EnquiryConfirmationView.vue', () => {
  it('throws error if unknown initiative', async () => {
    shallowMount(ProjectConfirmationView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(housingProjectService.getProject).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(ProjectConfirmationView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it('sets the correct header', () => {
    const wrapper = shallowMount(ProjectConfirmationView, wrapperSettings());
    const childComponent = wrapper.find('h2');
    expect(childComponent.text()).toStrictEqual(t('views.e.projectConfirmationView.header'));
  });

  it.each([
    {
      initiative: Initiative.ELECTRIFICATION,
      backTo: t('views.e.projectConfirmationView.electrification.backTo'),
      initiativeRouteName: RouteName.EXT_ELECTRIFICATION,
      projectService: electrificationProjectService,
      projectRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT,
      message: t('views.e.projectConfirmationView.electrification.message')
    },
    {
      initiative: Initiative.HOUSING,
      backTo: t('views.e.projectConfirmationView.housing.backTo'),
      initiativeRouteName: RouteName.EXT_HOUSING,
      projectService: housingProjectService,
      projectRouteName: RouteName.EXT_HOUSING_PROJECT,
      message: t('views.e.projectConfirmationView.housing.message')
    }
  ])('sets the correct content for $initiative', async (value) => {
    const wrapper = shallowMount(ProjectConfirmationView, wrapperSettings(value.initiative));
    await flushPromises();

    const message = wrapper.findComponent(Message);
    const subHeader = wrapper.find('h3');
    const links = wrapper.findAllComponents(RouterLinkStub);

    expect(message.text()).toStrictEqual(t('views.e.projectConfirmationView.success'));
    expect(subHeader.text()).toStrictEqual(t('views.e.projectConfirmationView.projectId'));
    // link 1
    expect(links[0]?.text()).toStrictEqual('123');
    expect(links[0]?.props('to')).toEqual({
      name: value.projectRouteName,
      params: { projectId: '123' }
    });
    expect(wrapper.text()).toContain(value.message);
    // link 2
    expect(links[1]?.text()).toStrictEqual(value.backTo);
    expect(links[1]?.props('to')).toEqual({
      name: value.initiativeRouteName
    });
  });
});
