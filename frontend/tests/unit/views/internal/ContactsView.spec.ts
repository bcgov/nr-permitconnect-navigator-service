import PrimeVue from 'primevue/config';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';

import { default as i18n } from '@/i18n';
import ViewHeader from '@/components/common/ViewHeader.vue';
import ContactsProponentsList from '@/components/contact/ContactsProponentsList.vue';
import { contactService } from '@/services';
import ContactsView from '@/views/internal/ContactsView.vue';
import { Initiative, RouteName } from '@/utils/enums/application';
import { mockAxiosResponse } from '../../../helpers';

import type { ActivityContact } from '@/types';

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

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({
    replace: vi.fn()
  })
}));

vi.mock('@/lib/primevue/useToast', () => ({
  useToast: () => ({
    error: toastErrorMock
  })
}));

vi.mock('@/services/contactService', () => ({
  default: {
    searchContacts: vi.fn()
  }
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
      // Force PrimeVue stubs to render children
      Tabs: { template: '<div><slot /></div>' },
      TabList: { template: '<div><slot /></div>' },
      Tab: { template: '<div><slot /></div>' },
      TabPanels: { template: '<div><slot /></div>' },
      TabPanel: { template: '<div><slot /></div>' }
    }
  }
});

// Tests
describe('ContactsView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets the correct header', () => {
    const wrapper = shallowMount(ContactsView, wrapperSettings());
    const childComponent = wrapper.findComponent(ViewHeader);
    expect(childComponent.props('header')).toBe('Contacts list');
  });

  it('does not render tabs while loading', async () => {
    const wrapper = shallowMount(ContactsView, wrapperSettings());
    expect(wrapper.findComponent(ContactsProponentsList).exists()).toBe(false);
  });

  it.each([
    { initiative: Initiative.ELECTRIFICATION, route: RouteName.INT_ELECTRIFICATION_CONTACT_PAGE },
    { initiative: Initiative.HOUSING, route: RouteName.INT_HOUSING_CONTACT_PAGE }
  ])('sets the correct initiative: $initiative', (value) => {
    const wrapper = shallowMount(ContactsView, wrapperSettings(value.initiative));
    // No other way to test this without casting
    const vm = wrapper.vm as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(vm.initiativeState.provideContactInitiativeRouteName).toBe(value.route);
  });

  it('throws error if unknown initiative', async () => {
    shallowMount(ContactsView, wrapperSettings(Initiative.PCNS));
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('Unable to determine initiative state', undefined, undefined);
  });

  it('catches API errors and calls toast', async () => {
    vi.mocked(contactService.searchContacts).mockRejectedValueOnce(new Error('BOOM'));

    shallowMount(ContactsView, wrapperSettings());
    await flushPromises();

    expect(toastErrorMock).toHaveBeenCalledWith('BOOM', undefined, undefined);
  });

  it('renders ContactsProponentsList after loading', async () => {
    vi.mocked(contactService.searchContacts).mockResolvedValueOnce(mockAxiosResponse([]));

    const wrapper = shallowMount(ContactsView, wrapperSettings());
    await flushPromises();

    const proponentsList = wrapper.findComponent(ContactsProponentsList);
    expect(proponentsList.exists()).toBe(true);
  });

  it('passes contacts to ContactsProponentsList', async () => {
    vi.mocked(contactService.searchContacts).mockResolvedValueOnce(
      mockAxiosResponse([{ contactId: '1', activityContact: [{} as ActivityContact] }])
    );

    const wrapper = shallowMount(ContactsView, wrapperSettings());
    await flushPromises();

    const proponentsList = wrapper.findComponent(ContactsProponentsList);
    expect(proponentsList.props('contacts')).toStrictEqual([
      { contactId: '1', activityContact: [{} as ActivityContact] }
    ]);
  });

  it('filters to contacts with activityContacts', async () => {
    vi.mocked(contactService.searchContacts).mockResolvedValueOnce(
      mockAxiosResponse([{ contactId: '1', activityContact: [{} as ActivityContact] }, { contactId: '2' }])
    );

    const wrapper = shallowMount(ContactsView, wrapperSettings());
    await flushPromises();

    const proponentsList = wrapper.findComponent(ContactsProponentsList);
    expect(proponentsList.props('contacts')).toStrictEqual([
      { contactId: '1', activityContact: [{} as ActivityContact] }
    ]);
  });

  it('removes a contact when ContactsProponentsList emits contact-deleted', async () => {
    vi.mocked(contactService.searchContacts).mockResolvedValueOnce(
      mockAxiosResponse([
        { contactId: '1', activityContact: [{} as ActivityContact] },
        { contactId: '2', activityContact: [{} as ActivityContact] }
      ])
    );

    const wrapper = shallowMount(ContactsView, wrapperSettings());
    await flushPromises();

    const proponentsList = wrapper.findComponent(ContactsProponentsList);
    proponentsList.vm.$emit('contact-deleted', { contactId: '1' });

    expect(proponentsList.props('contacts')).toStrictEqual([
      { contactId: '2', activityContact: [{} as ActivityContact] }
    ]);
  });
});
