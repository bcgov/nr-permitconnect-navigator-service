import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectTeamManageModal from '@/components/projectCommon/ProjectTeamManageModal.vue';
import i18n from '@/i18n';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';
import { t } from '../../../helpers';

import type { ActivityContact, Contact } from '@/types';

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

const wrapperSettings = (zone = Zone.INTERNAL, props = {}) => ({
  props: {
    activityContact: mockActivityContact,
    visible: true,
    'onUpdate:visible': (val: boolean | undefined) => val,
    ...props
  },
  global: {
    plugins: [createTestingPinia({ initialState: { app: { zone } } }), i18n, PrimeVue],
    stubs: {
      Dialog: {
        name: 'Dialog',
        template: '<div class="stub-dialog"><slot name="header" /><slot /></div>'
      },
      Message: {
        template: '<div class="stub-msg"><slot /></div>'
      },
      Select: {
        name: 'Select',
        props: ['modelValue', 'options'],
        template:
          '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>'
      }
    }
  }
});

describe('ProjectTeamManageModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Computed Logic & Zones', () => {
    it('filters selectableRoles for INTERNAL zone correctly', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings(Zone.INTERNAL));

      const select = wrapper.getComponent({ name: 'Select' });
      const options = select.props('options');

      expect(options).toContain(ActivityContactRole.PRIMARY);
      expect(options).toContain(ActivityContactRole.ADMIN);
      expect(options).not.toContain(ActivityContactRole.MEMBER);
    });

    it('filters selectableRoles for EXTERNAL zone correctly', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings(Zone.EXTERNAL));

      const select = wrapper.getComponent({ name: 'Select' });
      const options = select.props('options');

      expect(options).not.toContain(ActivityContactRole.PRIMARY);
      expect(options).toContain(ActivityContactRole.ADMIN);
      expect(options).not.toContain(ActivityContactRole.MEMBER);
    });

    it('handles missing activityContact prop for roles', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings(Zone.INTERNAL, { activityContact: undefined }));

      const select = wrapper.getComponent({ name: 'Select' });
      const options = select.props('options');

      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('Template Bindings & UI State', () => {
    it('renders contact name correctly', () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings());

      expect(wrapper.text()).toContain('John');
      expect(wrapper.text()).toContain('Doe');
    });

    it('shows ADMIN warning only when ADMIN role is selected', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings());

      expect(wrapper.find('.stub-msg').exists()).toBe(false);

      const select = wrapper.getComponent({ name: 'Select' });
      await select.vm.$emit('update:modelValue', ActivityContactRole.ADMIN);
      await flushPromises();

      expect(wrapper.find('.stub-msg').text()).toContain(t('projectTeamManageModal.adminSelectedWarning'));
    });
  });

  describe('Actions & Events', () => {
    it('emits manageUser event and disables save correctly', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings());
      const saveBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamManageModal.save')));

      expect(saveBtn?.element.disabled).toBe(true);

      const select = wrapper.getComponent({ name: 'Select' });
      await select.vm.$emit('update:modelValue', ActivityContactRole.PRIMARY);
      await flushPromises();

      expect(saveBtn?.element.disabled).toBe(false);
      await saveBtn?.trigger('click');

      expect(wrapper.emitted('projectTeamManageModal:manageUser')).toBeTruthy();
      expect(wrapper.emitted('projectTeamManageModal:manageUser')?.[0]).toEqual([
        mockActivityContact,
        ActivityContactRole.PRIMARY
      ]);
    });

    it('emits update:visible false on Cancel click and Dialog close', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings());

      const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes(t('projectTeamManageModal.cancel')));
      await cancelBtn?.trigger('click');
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);

      const dialog = wrapper.getComponent({ name: 'Dialog' });
      await dialog.vm.$emit('update:visible', false);
      expect(wrapper.emitted('update:visible')?.[1]).toEqual([false]);
    });
  });

  describe('Watchers & Visibility', () => {
    it('clears selected role when modal closes', async () => {
      const wrapper = mount(ProjectTeamManageModal, wrapperSettings());

      const select = wrapper.getComponent({ name: 'Select' });
      await select.vm.$emit('update:modelValue', ActivityContactRole.ADMIN);
      await flushPromises();

      await wrapper.setProps({ visible: false });
      await flushPromises();

      expect(select.props('modelValue')).toBeUndefined();
    });
  });
});
