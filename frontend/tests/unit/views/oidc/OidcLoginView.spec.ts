import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import { useAuthNStore } from '@/store';
import OidcLoginView from '@/views/oidc/OidcLoginView.vue';
import { IdentityProviderKind, StorageKey } from '@/utils/enums/application';
import * as utils from '@/utils/utils';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => {}
  }))
}));

const wrapperSettings = () => ({
  global: {
    plugins: [
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

describe('OidcLoginView', () => {
  const findIdpConfigSpy = vi.spyOn(utils, 'findIdpConfig');

  it('renders component', () => {
    const wrapper = mount(OidcLoginView, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('should invoke auth login flow with BCSC when the BCSC button is clicked', async () => {
    const wrapper = mount(OidcLoginView, wrapperSettings());
    const authNStore = useAuthNStore();
    const bcscButton = wrapper.find('[data-test="bcsc-login-button"]');

    await bcscButton.trigger('click');

    expect(findIdpConfigSpy).toHaveBeenCalled();
    expect(findIdpConfigSpy).toHaveBeenCalledWith(IdentityProviderKind.BCSC);
    expect(authNStore.login).toHaveBeenCalled();
  });

  it('should invoke auth login flow with BCEID when the BCEID button is clicked', async () => {
    const wrapper = mount(OidcLoginView, wrapperSettings());
    const authNStore = useAuthNStore();
    const bceidButton = wrapper.find('[data-test="bceid-login-button"]');

    await bceidButton.trigger('click');

    expect(findIdpConfigSpy).toHaveBeenCalled();
    expect(findIdpConfigSpy).toHaveBeenCalledWith(IdentityProviderKind.BCEID);
    expect(authNStore.login).toHaveBeenCalled();
  });

  it('should invoke auth login flow with BCEIDBUSINESS on BCEIDBUSINESS button click', async () => {
    const wrapper = mount(OidcLoginView, wrapperSettings());
    const authNStore = useAuthNStore();
    const bceidBusinessButton = wrapper.find('[data-test="bceid-business-login-button"]');

    await bceidBusinessButton.trigger('click');

    expect(findIdpConfigSpy).toHaveBeenCalled();
    expect(findIdpConfigSpy).toHaveBeenCalledWith(IdentityProviderKind.BCEIDBUSINESS);
    expect(authNStore.login).toHaveBeenCalled();
  });
  it('should invoke auth login flow with IDIR when the IDIR button is clicked', async () => {
    const wrapper = mount(OidcLoginView, wrapperSettings());
    const authNStore = useAuthNStore();
    const idirButton = wrapper.find('[data-test="idir-login-button"]');

    await idirButton.trigger('click');

    expect(findIdpConfigSpy).toHaveBeenCalled();
    expect(findIdpConfigSpy).toHaveBeenCalledWith(IdentityProviderKind.IDIR);
    expect(authNStore.login).toHaveBeenCalled();
  });

  it('calls login function BCSC when BCSC button is clicked', async () => {
    // Mock the login function
    const loginMock = vi.fn();
    const wrapper = mount(OidcLoginView, {
      global: {
        mocks: {
          login: loginMock
        }
      }
    });

    // Find the BCSC button and simulate a click
    const bcscButton = wrapper.find('[data-test="bcsc-login-button"]');
    await bcscButton.trigger('click');

    // Assert that the login function was called with the correct argument
    expect(loginMock).toHaveBeenCalledWith(IdentityProviderKind.BCSC);
  });

  it('calls login function BCEID when BCEID button is clicked', async () => {
    // Mock the login function
    const loginMock = vi.fn();
    const wrapper = mount(OidcLoginView, {
      global: {
        mocks: {
          login: loginMock
        }
      }
    });

    // Find the BCSC button and simulate a click
    const bceidButton = wrapper.find('[data-test="bceid-login-button"]');
    await bceidButton.trigger('click');

    // Assert that the login function was called with the correct argument
    expect(loginMock).toHaveBeenCalledWith(IdentityProviderKind.BCEID);
  });

  it('calls login function BCEIDBUSINESS when BCEIDBUSINESS button is clicked', async () => {
    // Mock the login function
    const loginMock = vi.fn();
    const wrapper = mount(OidcLoginView, {
      global: {
        mocks: {
          login: loginMock
        }
      }
    });

    // Find the BCSC button and simulate a click
    const bceidBusinessButton = wrapper.find('[data-test="bceid-business-login-button"]');
    await bceidBusinessButton.trigger('click');

    // Assert that the login function was called with the correct argument
    expect(loginMock).toHaveBeenCalledWith(IdentityProviderKind.BCEIDBUSINESS);
  });

  it('calls login function IDIR when IDIR button is clicked', async () => {
    // Mock the login function
    const loginMock = vi.fn();
    const wrapper = mount(OidcLoginView, {
      global: {
        mocks: {
          login: loginMock
        }
      }
    });

    // Find the BCSC button and simulate a click
    const idirButton = wrapper.find('[data-test="idir-login-button"]');
    await idirButton.trigger('click');

    // Assert that the login function was called with the correct argument
    expect(loginMock).toHaveBeenCalledWith(IdentityProviderKind.IDIR);
  });
});
