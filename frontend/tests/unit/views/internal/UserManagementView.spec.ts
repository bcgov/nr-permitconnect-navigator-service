import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { accessRequestService, yarsService } from '@/services';
import { GroupName } from '@/utils/enums/application';
import UserManagementView from '@/views/internal/UserManagementView.vue';

import type { User } from '@/types';

const mockRequire = vi.fn();

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key // returns the key as the translation
  })
}));

vi.mock('@/lib/primevue', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useConfirm: () => ({ require: mockRequire })
}));

vi.mock('@/services', () => ({
  accessRequestService: { listAccessRequests: vi.fn().mockResolvedValue([]), processAccessRequest: vi.fn() },
  userService: { searchUsers: vi.fn().mockResolvedValue([]) },
  yarsService: { deleteSubjectGroup: vi.fn() }
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

const wrapperSettings = (groups: { name: GroupName }[] = []) => ({
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            },
            authz: { groups }
          }
        }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: {
      'font-awesome-icon': true,
      'router-link': true
    }
  }
});

// Tests
describe('UserManagementView.vue', () => {
  it('renders', () => {
    const wrapper = shallowMount(UserManagementView, wrapperSettings());

    expect(wrapper).toBeTruthy();
  });

  // Only a non-admin revoke files an access request, which needs the full identity
  it('lets an admin revoke a user who is missing identity details', async () => {
    const wrapper = shallowMount(UserManagementView, wrapperSettings([{ name: GroupName.DEVELOPER }]));
    const user = { userId: 'u1', sub: 'sub1', lastName: null, groups: [{ groupId: 7 }] } as unknown as User;

    (wrapper.vm as unknown as { onRevoke: (r: { user: User }) => void }).onRevoke({ user });
    await mockRequire.mock.calls[0]![0].accept();

    expect(yarsService.deleteSubjectGroup).toHaveBeenCalledWith({ sub: 'sub1', groupId: 7 });
  });

  it('leaves the table alone when a processed request is no longer in it', async () => {
    const wrapper = shallowMount(UserManagementView, wrapperSettings());
    await flushPromises();
    const vm = wrapper.vm as unknown as {
      onProcessUserAccessRequest: () => Promise<void>;
      selectedUserAccessRequest: unknown;
      userProcessModalAction: string;
      usersAndAccessRequests: unknown[];
    };
    const other = { user: { userId: 'u2' }, accessRequest: { accessRequestId: 'ar2', grant: true } };

    vm.usersAndAccessRequests = [other];
    vm.selectedUserAccessRequest = { user: { userId: 'u1' }, accessRequest: { accessRequestId: 'ar1', grant: true } };
    vm.userProcessModalAction = 'Deny';
    await vm.onProcessUserAccessRequest();

    expect(accessRequestService.processAccessRequest).toHaveBeenCalledWith({ accessRequestId: 'ar1', approve: false });
    expect(vm.usersAndAccessRequests).toEqual([other]);
  });
});
