import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ProjectTeamAddModal from '@/components/projectCommon/ProjectTeamAddModal.vue';
import i18n from '@/i18n';
import { contactService } from '@/services';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';
import { mockAxiosResponse, t } from '../../../helpers';

import type * as VeeValidate from 'vee-validate';
import type { Contact, ActivityContact } from '@/types';

vi.mock('@/services', () => ({
  contactService: { matchContacts: vi.fn() }
}));

vi.mock('vee-validate', async (importOriginal) => {
  const actual = await importOriginal<typeof VeeValidate>();
  return {
    ...actual,
    useForm: () => ({
      handleSubmit: (fn: (values: VeeValidate.GenericObject) => void) => (e?: Event) => {
        if (e?.preventDefault) e.preventDefault();
        fn({ firstName: 'Manual', lastName: 'User' });
      },
      resetForm: vi.fn()
    })
  };
});

const mockContact: Contact = {
  contactId: 'contact1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  userId: 'user-123'
};

const mockActivityContact: ActivityContact = {
  activityId: 'activity1',
  contactId: 'contact1',
  role: ActivityContactRole.MEMBER,
  contact: mockContact
};

const wrapperSettings = (zone = Zone.INTERNAL, activityContacts: ActivityContact[] = []) => ({
  props: {
    activityContacts,
    visible: true,
    'onUpdate:visible': (val: boolean | undefined) => val
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: { app: { zone } }
      }),
      i18n,
      PrimeVue,
      ToastService
    ],
    stubs: {
      'font-awesome-icon': { template: '<i />' },
      Dialog: {
        name: 'Dialog',
        template: '<div class="stub-dialog"><slot name="header" /><slot /><slot name="footer" /></div>'
      },
      Spinner: true,
      Form: {
        name: 'VeeFormStub',
        template: '<form class="vee-form-stub" @submit.prevent><slot /></form>'
      }
    }
  }
});

describe('ProjectTeamAddModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Logic & UI Bindings', () => {
    it('sets search tag via input and correctly disables the search button', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const searchInput = wrapper.find('input');
      const searchBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.search')));

      await searchInput.setValue('J');
      expect(searchBtn?.element.disabled).toBe(true);

      await searchInput.trigger('keydown.enter');
      expect(contactService.matchContacts).not.toHaveBeenCalled();

      await searchInput.setValue('Jo');
      expect(searchBtn?.element.disabled).toBe(false);
    });

    it('triggers numeric search via Enter key', async () => {
      vi.mocked(contactService.matchContacts).mockResolvedValue(mockAxiosResponse([]));
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL));

      const searchInput = wrapper.find('input');
      await searchInput.setValue('2501234567');

      await searchInput.trigger('keydown.enter');
      await flushPromises();

      expect(contactService.matchContacts).toHaveBeenCalledWith({ phoneNumber: '2501234567' });
    });

    it('uses email search and covers specific external zone labels via button click', async () => {
      vi.mocked(contactService.matchContacts).mockResolvedValue(mockAxiosResponse([]));
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.EXTERNAL));

      const searchInput = wrapper.find('input');
      expect(searchInput.attributes('placeholder')).toBe(t('projectTeamAddModal.searchPlaceholderProp'));
      expect(wrapper.html()).toContain(t('projectTeamAddModal.addTeamMember'));

      await searchInput.setValue('test@test.com');

      const searchBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.search')));
      await searchBtn?.trigger('click');
      await flushPromises();

      expect(contactService.matchContacts).toHaveBeenCalledWith({ email: 'test@test.com' });
    });

    it('handles search error and resets loading UI', async () => {
      vi.mocked(contactService.matchContacts).mockRejectedValue(new Error('Search failed'));
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const searchInput = wrapper.find('input');
      await searchInput.setValue('Error');
      await searchInput.trigger('keydown.enter');
      await flushPromises();

      const dataTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      expect(dataTable?.props('loading')).toBe(false);
    });

    it('populates search results in the datatable covering true/false userId paths', async () => {
      const contactWithUser = { ...mockContact, userId: 'user-123' };
      const contactWithoutUser = { ...mockContact, contactId: 'contact2', userId: undefined };

      vi.mocked(contactService.matchContacts).mockResolvedValue(
        mockAxiosResponse([contactWithUser, contactWithoutUser])
      );

      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL));

      const searchInput = wrapper.find('input');
      await searchInput.setValue('John Doe');
      await searchInput.trigger('keydown.enter');
      await flushPromises();

      const dataTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      expect(dataTable?.props('value')).toHaveLength(2);
    });
  });

  describe('Adding & Removing Users', () => {
    it('checks manualEntry addition via Form submit', async () => {
      vi.mocked(contactService.matchContacts).mockResolvedValue(mockAxiosResponse([]));
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL));

      const searchInput = wrapper.find('input');
      await searchInput.setValue('John Doe');
      await searchInput.trigger('keydown.enter');
      await flushPromises();

      const toggleBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.manualEntry')));
      await toggleBtn?.trigger('click');
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await flushPromises();

      const selectedTable = wrapper.findAllComponents({ name: 'DataTable' })[1];
      expect(selectedTable?.props('value')[0].contact.firstName).toBe('Manual');
    });

    it('disables "Add User" button if user already exists in project', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL, [mockActivityContact]));

      const dataTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await dataTable?.vm.$emit('update:selection', mockContact);
      await nextTick();

      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      expect(addUserBtn?.element.disabled).toBe(true);

      expect(wrapper.html()).toContain(t('projectTeamAddModal.contactAlreadyExists'));
    });
    it('disables "Add User" button if user is already in the selected list', async () => {
      vi.mocked(contactService.matchContacts).mockResolvedValue(mockAxiosResponse([mockContact]));
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const input = wrapper.find('input');
      await input.setValue('John');
      await input.trigger('keydown.enter');
      await flushPromises();

      const searchTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await searchTable?.vm.$emit('update:selection', mockContact);
      await wrapper
        .findAll('button')
        .find((b) => b.text().includes(t('projectTeamAddModal.addUser')))
        ?.trigger('click');
      await flushPromises();

      await searchTable?.vm.$emit('update:selection', mockContact);
      await nextTick();

      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      expect(addUserBtn?.element.disabled).toBe(true);
    });

    it('adds a searched user to selection and removes it via DOM button click', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const searchTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await searchTable?.vm.$emit('update:selection', mockContact);
      await nextTick();

      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      await addUserBtn?.trigger('click');
      await flushPromises();

      const selectedTable = wrapper.findAllComponents({ name: 'DataTable' })[1];
      expect(selectedTable?.props('value')).toHaveLength(1);

      const removeBtn = wrapper.find('button[aria-label="' + t('projectTeamAddModal.remove') + '"]');
      await removeBtn.trigger('click');
      await flushPromises();

      expect(selectedTable?.props('value')).toHaveLength(0);
    });

    it('handles addUser when no selection exists (fall-through coverage)', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const addUserBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.text().includes(t('projectTeamAddModal.addUser')))!;

      await addUserBtn.vm.$emit('click');
      await flushPromises();

      expect(wrapper.findAllComponents({ name: 'DataTable' })).toHaveLength(1);
    });
  });

  describe('Business Rules & Template', () => {
    it('filters selectable roles in Select dropdown when primary exists', async () => {
      const existing = { ...mockActivityContact, contactId: 'different-contact-id', role: ActivityContactRole.PRIMARY };
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL, [existing]));

      const searchTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await searchTable?.vm.$emit('update:selection', mockContact);

      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      await addUserBtn?.trigger('click');
      await flushPromises();

      const select = wrapper.findComponent({ name: 'Select' });
      expect(select.props('options')).not.toContain(ActivityContactRole.PRIMARY);
    });

    it('checks optionDisabled edge cases dynamically via the Select component prop', async () => {
      vi.mocked(contactService.matchContacts).mockResolvedValue(mockAxiosResponse([]));
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL));

      const searchInput = wrapper.find('input');
      await searchInput.setValue('John Doe');
      await searchInput.trigger('keydown.enter');
      await flushPromises();
      await wrapper
        .findAll('button')
        .find((b) => b.text().includes(t('projectTeamAddModal.manualEntry')))
        ?.trigger('click');
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();
      await flushPromises();

      const select = wrapper.findComponent({ name: 'Select' });
      const optionDisabledFn = select.props('optionDisabled');

      expect(optionDisabledFn(ActivityContactRole.ADMIN)).toBe(true);
      expect(optionDisabledFn(ActivityContactRole.PRIMARY)).toBe(false);
    });

    it('renders admin warning when ADMIN is selected', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL));

      const searchTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await searchTable?.vm.$emit('update:selection', mockContact);
      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      await addUserBtn?.trigger('click');
      await flushPromises();

      const select = wrapper.findComponent({ name: 'Select' });
      await select.vm.$emit('update:modelValue', ActivityContactRole.ADMIN);
      await flushPromises();

      expect(wrapper.html()).toContain(t('projectTeamAddModal.adminSelectedWarning'));
    });

    it('shows error if no primary is selected on save click', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const searchTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await searchTable?.vm.$emit('update:selection', mockContact);
      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      await addUserBtn?.trigger('click');

      const select = wrapper.findComponent({ name: 'Select' });
      await select.vm.$emit('update:modelValue', ActivityContactRole.MEMBER);
      await flushPromises();

      const saveBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.save')));
      await saveBtn?.trigger('click');
      await flushPromises();

      const errorMessage = t('projectTeamAddModal.onePrimaryRoleError', { one: '<strong>one</strong>' });
      expect(wrapper.html()).toContain(errorMessage);
    });

    it('emits addUsers event on valid save click', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const searchTable = wrapper.findAllComponents({ name: 'DataTable' })[0];
      await searchTable?.vm.$emit('update:selection', mockContact);
      const addUserBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.addUser')));
      await addUserBtn?.trigger('click');

      const select = wrapper.findComponent({ name: 'Select' });
      await select.vm.$emit('update:modelValue', ActivityContactRole.PRIMARY);
      await flushPromises();

      const saveBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.save')));
      await saveBtn?.trigger('click');

      expect(wrapper.emitted('projectTeamAddModal:addUsers')).toBeTruthy();
      expect(wrapper.emitted('projectTeamAddModal:addUsers')?.[0]).toEqual([
        [{ contact: mockContact, role: ActivityContactRole.PRIMARY }]
      ]);
    });

    it('applies the correct column width classes based on the zone', async () => {
      vi.mocked(contactService.matchContacts).mockResolvedValue(mockAxiosResponse([mockContact]));
      const wrapperInt = mount(ProjectTeamAddModal, wrapperSettings(Zone.INTERNAL));

      const inputInt = wrapperInt.find('input');
      await inputInt.setValue('John Doe');
      await inputInt.trigger('keydown.enter');
      await flushPromises();

      const searchTableInt = wrapperInt.findAllComponents({ name: 'DataTable' })[0];
      await searchTableInt?.vm.$emit('update:selection', mockContact);
      await wrapperInt
        .findAll('button')
        .find((b) => b.text().includes(t('projectTeamAddModal.addUser')))
        ?.trigger('click');
      await flushPromises();

      const selectedTableInt = wrapperInt.findAll('.datatable')[1];
      const nameColInt = selectedTableInt?.findAll('.whitespace-nowrap')[1];
      expect(nameColInt?.classes()).toContain('w-[10%]');

      const wrapperExt = mount(ProjectTeamAddModal, wrapperSettings(Zone.EXTERNAL));

      const inputExt = wrapperExt.find('input');
      await inputExt.setValue('John Doe');
      await inputExt.trigger('keydown.enter');
      await flushPromises();

      const searchTableExt = wrapperExt.findAllComponents({ name: 'DataTable' })[0];
      await searchTableExt?.vm.$emit('update:selection', mockContact);
      await wrapperExt
        .findAll('button')
        .find((b) => b.text().includes(t('projectTeamAddModal.addTeamMember')))
        ?.trigger('click');
      await flushPromises();

      const selectedTableExt = wrapperExt.findAll('.datatable')[1];
      const nameColExt = selectedTableExt?.findAll('.whitespace-nowrap')[0];
      expect(nameColExt?.classes()).toContain('w-[15%]');
    });
  });

  describe('Watchers & Lifecycle', () => {
    it('emits update:visible false when Cancel button is clicked or Dialog closes', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamAddModal.cancel')));
      await cancelBtn?.trigger('click');
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);

      const dialog = wrapper.getComponent({ name: 'Dialog' });
      await dialog.vm.$emit('update:visible', false);
      expect(wrapper.emitted('update:visible')?.[1]).toEqual([false]);
    });

    it('resets state when visible prop changes to false', async () => {
      const wrapper = mount(ProjectTeamAddModal, wrapperSettings());

      const searchInput = wrapper.find('input');
      await searchInput.setValue('Dirty search');

      await wrapper.setProps({ visible: false });
      await flushPromises();

      expect(wrapper.find('input').element.value).toBe('');
    });
  });
});
