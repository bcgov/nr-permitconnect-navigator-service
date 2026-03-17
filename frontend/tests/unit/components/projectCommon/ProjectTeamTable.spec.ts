import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectTeamTable from '@/components/projectCommon/ProjectTeamTable.vue';
import i18n from '@/i18n';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';
import { t } from '../../../helpers';

import type { ActivityContact, Contact } from '@/types';
import type { DOMWrapper } from '@vue/test-utils';

const mockUserContact: Contact = { contactId: 'user', userId: 'user-id-123', firstName: 'Admin', lastName: 'User' };
const mockManualContact: Contact = { contactId: 'manual-entry', firstName: 'Manual', lastName: 'Entry' };
const mockPrimaryContact: Contact = { contactId: 'primary', firstName: 'Primary', lastName: 'Contact' };
const mockMemberContact: Contact = { contactId: 'member', userId: 'yes', firstName: 'Standard', lastName: 'Member' };

const activityContacts: ActivityContact[] = [
  { activityId: 'activity1', contactId: 'user', role: ActivityContactRole.ADMIN, contact: mockUserContact },
  { activityId: 'activity1', contactId: 'manual-entry', role: ActivityContactRole.MEMBER, contact: mockManualContact },
  { activityId: 'activity1', contactId: 'primary', role: ActivityContactRole.PRIMARY, contact: mockPrimaryContact },
  { activityId: 'activity1', contactId: 'member', role: ActivityContactRole.MEMBER, contact: mockMemberContact }
];

const wrapperSettings = (zone = Zone.INTERNAL, customContacts = activityContacts, currentUser = mockUserContact) => ({
  props: { activityContacts: customContacts },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: { zone },
          contact: { contact: currentUser }
        }
      }),
      i18n,
      PrimeVue
    ],
    stubs: {
      'font-awesome-icon': { template: '<i :class="icon" class="stub-icon" />', props: ['icon'] }
    }
  }
});

describe('ProjectTeamTable.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin View & Manageability Rules', () => {
    it('applies correct disabled states for INTERNAL zone', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings(Zone.INTERNAL));
      await flushPromises();

      const manageBtns: DOMWrapper<HTMLButtonElement>[] = wrapper.findAll(
        `button[aria-label="${t('projectTeamTable.headerManage')}"]`
      );
      const revokeBtns: DOMWrapper<HTMLButtonElement>[] = wrapper.findAll(
        `button[aria-label="${t('projectTeamTable.headerRevoke')}"]`
      );

      expect(manageBtns).toHaveLength(4);
      expect(revokeBtns).toHaveLength(4);

      expect(manageBtns[0]?.element.disabled).toBe(false);
      expect(revokeBtns[0]?.element.disabled).toBe(true);

      expect(manageBtns[1]?.element.disabled).toBe(true);
      expect(revokeBtns[1]?.element.disabled).toBe(false);

      expect(manageBtns[2]?.element.disabled).toBe(true);
      expect(revokeBtns[2]?.element.disabled).toBe(true);

      expect(manageBtns[3]?.element.disabled).toBe(false);
      expect(revokeBtns[3]?.element.disabled).toBe(false);
    });

    it('applies correct disabled states for EXTERNAL zone (restricts managing self)', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings(Zone.EXTERNAL));
      await flushPromises();

      const manageBtns: DOMWrapper<HTMLButtonElement>[] = wrapper.findAll(
        `button[aria-label="${t('projectTeamTable.headerManage')}"]`
      );

      expect(manageBtns[0]?.element.disabled).toBe(true);

      expect(manageBtns[3]?.element.disabled).toBe(false);
    });
  });

  describe('Non-Admin View', () => {
    it('hides manage and revoke columns entirely if current user is not an Admin/Primary', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings(Zone.INTERNAL, activityContacts, mockMemberContact));
      await flushPromises();

      const manageBtns = wrapper.findAll(`button[aria-label="${t('projectTeamTable.headerManage')}"]`);
      const revokeBtns = wrapper.findAll(`button[aria-label="${t('projectTeamTable.headerRevoke')}"]`);

      expect(manageBtns).toHaveLength(0);
      expect(revokeBtns).toHaveLength(0);
    });
  });

  describe('Template Rendering & Slots', () => {
    it('renders the #empty slot when no contacts are provided', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings(Zone.INTERNAL, []));
      await flushPromises();

      expect(wrapper.text()).toContain(t('projectTeamTable.noUsers'));
    });

    it('renders user icons only for contacts with userIds in INTERNAL zone', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings(Zone.INTERNAL));
      await flushPromises();

      const userIcons = wrapper.findAll('.stub-icon.fa-user');

      expect(userIcons).toHaveLength(2);
    });

    it('hides user icon column entirely in EXTERNAL zone', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings(Zone.EXTERNAL));
      await flushPromises();

      const userIcons = wrapper.findAll('.stub-icon.fa-user');

      expect(userIcons).toHaveLength(0);
    });
  });

  describe('Actions & Events', () => {
    it('emits manageUser and revokeUser when action buttons are clicked', async () => {
      const wrapper = mount(ProjectTeamTable, wrapperSettings());
      await flushPromises();

      const manageBtns: DOMWrapper<HTMLButtonElement>[] = wrapper.findAll(
        `button[aria-label="${t('projectTeamTable.headerManage')}"]`
      );
      const revokeBtns: DOMWrapper<HTMLButtonElement>[] = wrapper.findAll(
        `button[aria-label="${t('projectTeamTable.headerRevoke')}"]`
      );

      expect(manageBtns[3]?.element.disabled).toBe(false);
      await manageBtns[3]?.trigger('click');
      expect(wrapper.emitted('projectTeamTable:manageUser')).toBeTruthy();
      expect(wrapper.emitted('projectTeamTable:manageUser')?.[0]).toEqual([activityContacts[3]]);

      expect(revokeBtns[3]?.element.disabled).toBe(false);
      await revokeBtns[3]?.trigger('click');
      expect(wrapper.emitted('projectTeamTable:revokeUser')).toBeTruthy();
      expect(wrapper.emitted('projectTeamTable:revokeUser')?.[0]).toEqual([activityContacts[3]]);
    });
  });
});
