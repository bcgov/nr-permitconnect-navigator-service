import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ContactPage from '@/components/contact/ContactPage.vue';
import { Initiative } from '@/utils/enums/application';
import ContactPageView from '@/views/internal/ContactPageView.vue';
import { t } from '../../../helpers';

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

// Default component mounting wrapper settings
const wrapperSettings = (initiative = Initiative.HOUSING) => ({
  props: {
    contactId: '1'
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
afterEach(() => {
  vi.clearAllMocks();
});

describe('ContactPageView.vue', () => {
  it('throws error if unknown initiative', async () => {
    shallowMount(ContactPageView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('renders ContactPage after loading', async () => {
    const wrapper = shallowMount(ContactPageView, wrapperSettings());
    await flushPromises();

    expect(wrapper.findComponent(ContactPage).exists()).toBe(true);
  });

  it('passes props to ContactPage', async () => {
    const wrapper = shallowMount(ContactPageView, wrapperSettings());
    await flushPromises();

    const childComponent = wrapper.findComponent(ContactPage);
    expect(childComponent.props('contactId')).toStrictEqual('1');
  });
});
