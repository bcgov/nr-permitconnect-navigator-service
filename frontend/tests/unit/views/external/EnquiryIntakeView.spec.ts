import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import EnquiryIntakeForm from '@/components/enquiry/EnquiryIntakeForm.vue';
import { electrificationProjectService, housingProjectService, permitService } from '@/services';
import { Initiative } from '@/utils/enums/application';
import EnquiryIntakeView from '@/views/external/EnquiryIntakeView.vue';
import { mockAxiosResponse, t } from '../../../helpers';

import type { ElectrificationProject, HousingProject } from '@/types';
import { FormState, FormType } from '@/utils/enums/projectCommon';
import { nextTick } from 'vue';
import { useFormStore } from '@/store';

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
  useRoute: () => ({})
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
interface Props {
  enquiryId?: string;
  projectId?: string;
  permitId?: string;
}

const wrapperSettings = (initiative = Initiative.HOUSING, props?: Props) => ({
  props: {
    ...props
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: {
            initiative
          },
          form: {
            formType: FormType.NEW,
            formState: FormState.UNLOCKED
          }
        },
        stubActions: false
      }),
      i18n,
      PrimeVue
    ]
  }
});

// Tests
beforeEach(() => {
  vi.mocked(electrificationProjectService.getProject).mockResolvedValue(
    mockAxiosResponse<ElectrificationProject>({
      electrificationProjectId: '123',
      activityId: '123'
    } as ElectrificationProject)
  );
  vi.mocked(housingProjectService.getProject).mockResolvedValue(
    mockAxiosResponse<HousingProject>({ housingProjectId: '123', activityId: '123' } as HousingProject)
  );
  vi.mocked(permitService.getPermit).mockResolvedValue(mockAxiosResponse({ permitId: '123', activityId: '123' }));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('EnquiryIntakeView.vue', () => {
  it('throws error if unknown initiative', async () => {
    shallowMount(EnquiryIntakeView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(housingProjectService.getProject).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(EnquiryIntakeView, wrapperSettings(Initiative.HOUSING, { projectId: '123' }));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it('sets the correct header', () => {
    const wrapper = shallowMount(EnquiryIntakeView, wrapperSettings());
    const childComponent = wrapper.find('h3');
    expect(childComponent.text()).toStrictEqual(t('views.e.enquiryIntakeView.header'));
  });

  it('renders EnquiryIntakeForm after loading', async () => {
    const wrapper = shallowMount(EnquiryIntakeView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(EnquiryIntakeForm).exists()).toBe(true);
  });

  it('locks the form if enquiryId prop exists', async () => {
    shallowMount(EnquiryIntakeView, wrapperSettings(Initiative.HOUSING, { enquiryId: '123' }));
    await flushPromises();
    await nextTick();

    const formStore = useFormStore();
    expect(formStore.getFormType).toEqual(FormType.SUBMISSION);
    expect(formStore.getFormState).toEqual(FormState.LOCKED);
  });
});
