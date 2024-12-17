import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { mount } from '@vue/test-utils';
import type { AxiosResponse } from 'axios';

import { userService } from '@/services';
import SearchUserNameById from '@/components/common/SearchUserNameById.vue';

const testUserId = 'foo';
const useUserService = vi.spyOn(userService, 'searchUsers');

const wrapperSettings = (testUserIdProp = testUserId) => ({
  props: {
    userId: testUserIdProp
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
      PrimeVue
    ]
  }
});

vi.clearAllMocks();

useUserService.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);

describe('SearchUserNameById.vue', () => {
  it('renders', () => {
    const wrapper = mount(SearchUserNameById, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });
});
