import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, shallowMount, RouterLinkStub } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import { Message } from '@/lib/primevue';
import { Initiative, RouteName } from '@/utils/enums/application';
import EnquiryConfirmationView from '@/views/external/EnquiryConfirmationView.vue';
import { PRIMEVUE_STUBS, t } from '../../../helpers';

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
      RouterLink: RouterLinkStub,
      ...PRIMEVUE_STUBS
    }
  }
});

// Tests
afterEach(() => {
  vi.clearAllMocks();
});

describe('EnquiryConfirmationView.vue', () => {
  it('throws error if unknown initiative', async () => {
    shallowMount(EnquiryConfirmationView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith(t('views.initiativeStateError'), undefined, undefined);
  });

  it('sets the correct header', () => {
    const wrapper = shallowMount(EnquiryConfirmationView, wrapperSettings());
    const childComponent = wrapper.find('h2');
    expect(childComponent.text()).toStrictEqual(t('views.e.enquiryConfirmationView.confirmationHeader'));
  });

  it.each([
    {
      initiative: Initiative.ELECTRIFICATION,
      message: t('views.e.enquiryConfirmationView.electrification.message'),
      backTo: t('views.e.enquiryConfirmationView.electrification.backTo'),
      routeName: RouteName.EXT_ELECTRIFICATION
    },
    {
      initiative: Initiative.HOUSING,
      message: t('views.e.enquiryConfirmationView.housing.message'),
      backTo: t('views.e.enquiryConfirmationView.housing.backTo'),
      routeName: RouteName.EXT_HOUSING
    }
  ])('sets the correct content for $initiative', async (value) => {
    const wrapper = shallowMount(EnquiryConfirmationView, wrapperSettings(value.initiative));
    await flushPromises();

    const message = wrapper.findComponent(Message);
    const link = wrapper.findComponent(RouterLinkStub);

    expect(message.text()).toStrictEqual(t('views.e.enquiryConfirmationView.confirmationBanner'));
    expect(wrapper.text()).toContain(value.message);
    expect(link.text()).toStrictEqual(value.backTo);
    expect(link.props('to')).toEqual({
      name: value.routeName
    });
  });
});
