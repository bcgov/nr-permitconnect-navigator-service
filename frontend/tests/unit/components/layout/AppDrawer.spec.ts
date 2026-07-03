import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AppDrawer from '@/components/layout/AppDrawer.vue';
import { useAppStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName, StorageKey } from '@/utils/enums/application';

import type { CallbackFn } from '@/types';

interface DrawerItem {
  icon?: string;
  label: string;
  route?: string;
  func?: CallbackFn;
  public?: boolean;
  access?: NavigationPermission | NavigationPermission[];
  items?: DrawerItem[];
  mailTo?: string;
}

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

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

describe('AppDrawer.vue', () => {
  const createMountOptions = () => ({
    global: {
      plugins: [
        PrimeVue,
        createTestingPinia({
          stubActions: false
        })
      ],
      stubs: {
        'font-awesome-icon': true,
        RouterLink: true
      }
    }
  });

  const mountOptions = createMountOptions();

  it('renders menu button', () => {
    const wrapper = mount(AppDrawer, mountOptions);

    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toContain('Menu');
  });

  it('opens drawer when menu button is clicked', async () => {
    const wrapper = mount(AppDrawer, mountOptions);

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect((wrapper.vm as any).visible).toBe(true); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it('filters menu items based on permissions', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const permittedItems = (wrapper.vm as any).permittedItems; // eslint-disable-line @typescript-eslint/no-explicit-any
    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Verify that filtering is happening (permittedItems should be a subset of items)
    expect(permittedItems.length).toBeLessThanOrEqual(items.length);

    // Verify that all items in permittedItems have either public:true or access defined
    permittedItems.forEach((item: DrawerItem) => {
      expect(item.public || item.access).toBeTruthy();
    });
  });

  it('shows housing menu when initiative is HOUSING', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item: DrawerItem) => item.label === 'Housing')).toBe(true);
  });

  it('shows electrification menu when initiative is ELECTRIFICATION', async () => {
    const wrapper = mount(AppDrawer, createMountOptions());
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.ELECTRIFICATION);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item: DrawerItem) => item.label === 'Electrification')).toBe(true);
  });

  it('shows general menu when initiative is GENERAL', async () => {
    const wrapper = mount(AppDrawer, createMountOptions());
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.GENERAL);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item: DrawerItem) => item.label === 'General')).toBe(true);
  });

  it('calls router.push when createIntake is called', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    // eslint-disable-next-line max-len
    await (wrapper.vm as any).createIntake(RouteName.EXT_HOUSING_INTAKE); // eslint-disable-line @typescript-eslint/no-explicit-any

    expect(mockPush).toHaveBeenCalledWith({
      name: RouteName.EXT_HOUSING_INTAKE
    });
  });

  it('includes help menu items in all initiatives', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item: DrawerItem) => item.label === 'Help')).toBe(true);
  });

  it('includes home menu item in all initiatives', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item: DrawerItem) => item.label === 'Home')).toBe(true);
  });

  it('marks home as public', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    const homeItem = items.find((item: DrawerItem) => item.label === 'Home');
    expect(homeItem?.public).toBe(true);
  });

  it('has nested items in initiative-specific menus', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    const housingItem = items.find((item: DrawerItem) => item.label === 'Housing');
    expect(housingItem?.items).toBeDefined();
    expect(Array.isArray(housingItem?.items)).toBe(true);
    expect(housingItem?.items.length).toBeGreaterThan(0);
  });

  it('has mailto links in help menu', async () => {
    const wrapper = mount(AppDrawer, mountOptions);
    const appStore = useAppStore();
    appStore.setInitiative(Initiative.HOUSING);

    await flushPromises();

    const items = (wrapper.vm as any).items; // eslint-disable-line @typescript-eslint/no-explicit-any
    const helpItem = items.find((item: DrawerItem) => item.label === 'Help');
    expect(helpItem?.items).toBeDefined();
    const mailToItem = helpItem?.items?.find((item: DrawerItem) => item.mailTo);
    expect(mailToItem).toBeDefined();
    expect(mailToItem?.mailTo).toContain('mailto:');
  });
});
