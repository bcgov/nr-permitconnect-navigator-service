import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createTestingPinia } from '@pinia/testing';
import { flushPromises, shallowMount } from '@vue/test-utils';

import ProjectTeamTab from '@/components/projectCommon/ProjectTeamTab.vue';
import i18n from '@/i18n';
import { activityContactService, contactService } from '@/services';
import { Zone } from '@/utils/enums/application';
import { ActivityContactRole } from '@/utils/enums/projectCommon';
import { mockAxiosError, mockAxiosErrorNoResponse, mockAxiosResponse } from '../../../helpers';

import type { ActivityContact, Contact } from '@/types';

const mockRequire = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockRequire }),
    useToast: () => ({ success: mockToastSuccess, error: mockToastError, warn: vi.fn() })
  };
});

vi.mock('@/services', () => ({
  activityContactService: {
    createActivityContact: vi.fn(),
    updateActivityContact: vi.fn(),
    deleteActivityContact: vi.fn()
  },
  contactService: {
    updateContact: vi.fn()
  }
}));

const mockContact: Contact = {
  contactId: 'contact1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  phoneNumber: '123'
};

const mockActivityContact: ActivityContact = {
  contactId: 'contact1',
  activityId: 'activity1',
  role: ActivityContactRole.MEMBER,
  contact: mockContact
};

const wrapperSettings = (zone = Zone.INTERNAL) => ({
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: { zone },
          project: { project: { activityId: 'activity1' }, activityContacts: [] }
        }
      }),
      ConfirmationService,
      i18n,
      ToastService
    ],
    stubs: {
      ProjectTeamAddModal: true,
      ProjectTeamManageModal: true,
      Button: true,
      ProjectTeamTable: true
    }
  }
});

describe('ProjectTeamTab.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Lifecycle, Computed & DOM Bindings', () => {
    it('shows addUserModal on mount if internal and no primary contact exists', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings(Zone.INTERNAL));
      await flushPromises();

      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });
      expect(addModal.props('visible')).toBe(true);
    });

    it('hides addUserModal on mount if external', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings(Zone.EXTERNAL));
      await flushPromises();

      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });
      expect(addModal.props('visible')).toBe(false);
    });

    it('opens Add User modal when DOM button is clicked', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings(Zone.EXTERNAL));
      await flushPromises();

      const btn = wrapper.findComponent({ name: 'Button' });
      await btn.vm.$emit('click');
      await flushPromises();

      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });
      expect(addModal.props('visible')).toBe(true);
    });

    it('hides addUserModal if a primary contact ALREADY exists on mount', async () => {
      const settings = wrapperSettings(Zone.INTERNAL);
      settings.global.plugins[0] = createTestingPinia({
        initialState: {
          app: { zone: Zone.INTERNAL },
          project: { activityContacts: [{ role: ActivityContactRole.PRIMARY }] }
        }
      });

      const wrapper = shallowMount(ProjectTeamTab, settings);
      await flushPromises();

      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });
      expect(addModal.props('visible')).toBe(false);
    });

    it('covers v-model:visible update for Add Modal', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      await flushPromises();

      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });
      await addModal.vm.$emit('update:visible', false);

      expect(addModal.props('visible')).toBe(false);
    });

    it('covers v-model:visible update for Manage Modal', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      await flushPromises();

      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });
      await manageModal.vm.$emit('update:visible', false);

      expect(manageModal.props('visible')).toBe(false);
    });
  });

  describe('Add Users Interactions (@project-team-add-modal:add-users)', () => {
    it('handles empty arrays gracefully', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', []);
      await flushPromises();

      expect(mockToastSuccess).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('handles single success toast for PRIMARY role', async () => {
      vi.mocked(contactService.updateContact).mockResolvedValue(mockAxiosResponse(mockContact));
      vi.mocked(activityContactService.createActivityContact).mockResolvedValue(mockAxiosResponse(mockActivityContact));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.PRIMARY }
      ]);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
      expect(addModal.props('visible')).toBe(false);
    });

    it('handles single failure toast', async () => {
      vi.mocked(activityContactService.createActivityContact).mockRejectedValue(new Error('One fail'));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });

    it('handles multiple successes toast (groups roles)', async () => {
      vi.mocked(activityContactService.createActivityContact).mockResolvedValue(mockAxiosResponse(mockActivityContact));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.MEMBER },
        { contact: mockContact, role: ActivityContactRole.ADMIN }
      ]);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('handles multiple failures with the SAME reason', async () => {
      vi.mocked(activityContactService.createActivityContact).mockRejectedValue(new Error('Same error'));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: { ...mockContact, firstName: 'A' }, role: ActivityContactRole.MEMBER },
        { contact: { ...mockContact, firstName: 'B' }, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });

    it('handles fallback error messages (no Axios response)', async () => {
      vi.mocked(activityContactService.createActivityContact).mockRejectedValue(
        mockAxiosErrorNoResponse('Fallback error')
      );

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });

    it('handles duplicate user error (P2002)', async () => {
      vi.mocked(activityContactService.createActivityContact).mockRejectedValue(mockAxiosError('Duplicate', 'P2002'));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });

    it('calls updateContact when contactId is missing (manual entry)', async () => {
      vi.mocked(contactService.updateContact).mockResolvedValue(mockAxiosResponse(mockContact));
      vi.mocked(activityContactService.createActivityContact).mockResolvedValue(mockAxiosResponse(mockActivityContact));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: { firstName: 'No ID' }, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(contactService.updateContact).toHaveBeenCalled();
      expect(activityContactService.createActivityContact).toHaveBeenCalled();
    });

    it('covers single success toast for ADMIN role', async () => {
      vi.mocked(contactService.updateContact).mockResolvedValue(mockAxiosResponse(mockContact));
      vi.mocked(activityContactService.createActivityContact).mockResolvedValue(mockAxiosResponse(mockActivityContact));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.ADMIN }
      ]);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining('John Doe'));
    });

    it('covers single success toast for MEMBER role', async () => {
      vi.mocked(contactService.updateContact).mockResolvedValue(mockAxiosResponse(mockContact));
      vi.mocked(activityContactService.createActivityContact).mockResolvedValue(mockAxiosResponse(mockActivityContact));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining('John Doe'));
    });

    it('covers non-Error string exceptions in onAddUsers (false/fall-through branch)', async () => {
      vi.mocked(activityContactService.createActivityContact).mockRejectedValue('Just a random string error');

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const addModal = wrapper.findComponent({ name: 'ProjectTeamAddModal' });

      await addModal.vm.$emit('projectTeamAddModal:addUsers', [
        { contact: mockContact, role: ActivityContactRole.MEMBER }
      ]);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });
  });

  describe('Manage User Interactions (@project-team-manage-modal:manage-user)', () => {
    it('opens manage modal when table emits manage-user event', async () => {
      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      await flushPromises();

      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });
      await table.vm.$emit('projectTeamTable:manageUser', mockActivityContact);
      await flushPromises();

      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });
      expect(manageModal.props('visible')).toBe(true);
      expect(manageModal.props('activityContact')).toEqual(mockActivityContact);
    });

    it('updates PRIMARY role WITH demotion and toasts successfully', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockResolvedValue(
        mockAxiosResponse({ updated: mockActivityContact, demoted: mockActivityContact })
      );

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.PRIMARY);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
      expect(manageModal.props('visible')).toBe(false);
    });

    it('handles Manage Axios error WITH response payload', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockRejectedValue(mockAxiosError('Axios Message'));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.MEMBER);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });

    it('handles non-Error string exceptions gracefully', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockRejectedValue('String Error');

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.MEMBER);
      await flushPromises();

      expect(activityContactService.updateActivityContact).toHaveBeenCalled();
    });

    it('covers ADMIN role switch case in onManageUser', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockResolvedValue(
        mockAxiosResponse({ updated: mockActivityContact, demoted: undefined })
      );

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.ADMIN);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('covers MEMBER role switch case in onManageUser', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockResolvedValue(
        mockAxiosResponse({ updated: mockActivityContact, demoted: undefined })
      );

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.MEMBER);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('covers PRIMARY role WITH demotion in onManageUser', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockResolvedValue(
        mockAxiosResponse({ updated: mockActivityContact, demoted: mockActivityContact })
      );

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.PRIMARY);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('covers PRIMARY role WITHOUT demotion in onManageUser (the else block)', async () => {
      vi.mocked(activityContactService.updateActivityContact).mockResolvedValue(
        mockAxiosResponse({ updated: mockActivityContact, demoted: undefined })
      );

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.PRIMARY);
      await flushPromises();

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('covers Axios Error WITH response payload in onManageUser', async () => {
      const errorMessage = 'Custom Axios Error Message';
      vi.mocked(activityContactService.updateActivityContact).mockRejectedValue(mockAxiosError(errorMessage));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.MEMBER);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), errorMessage);
    });

    it('covers Axios Error WITHOUT response payload in onManageUser', async () => {
      const errorMessage = 'Fallback Axios Message';
      vi.mocked(activityContactService.updateActivityContact).mockRejectedValue(mockAxiosErrorNoResponse(errorMessage));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.MEMBER);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), errorMessage);
    });

    it('covers standard Error instance in onManageUser', async () => {
      const errorMessage = 'Standard Error Message';
      vi.mocked(activityContactService.updateActivityContact).mockRejectedValue(new Error(errorMessage));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const manageModal = wrapper.findComponent({ name: 'ProjectTeamManageModal' });

      await manageModal.vm.$emit('projectTeamManageModal:manageUser', mockActivityContact, ActivityContactRole.MEMBER);
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), errorMessage);
    });
  });

  describe('Revoke User Interactions (@project-team-table:revoke-user)', () => {
    it('triggers confirm dialog and executes accept callback successfully', async () => {
      vi.mocked(activityContactService.deleteActivityContact).mockResolvedValue(mockAxiosResponse(mockActivityContact));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());

      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });
      await table.vm.$emit('projectTeamTable:revokeUser', mockActivityContact);
      await flushPromises();

      const mockRequireCall = mockRequire.mock.calls[0];
      const confirmArgs = mockRequireCall?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(activityContactService.deleteActivityContact).toHaveBeenCalledWith('activity1', 'contact1');
      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('handles Revoke standard Error', async () => {
      vi.mocked(activityContactService.deleteActivityContact).mockRejectedValue(new Error('Standard Error'));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());

      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });
      await table.vm.$emit('projectTeamTable:revokeUser', mockActivityContact);

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });

    it('covers Axios Error WITH response payload in onRevokeUser', async () => {
      const errorMessage = 'Revoke Axios Error Message';
      vi.mocked(activityContactService.deleteActivityContact).mockRejectedValue(mockAxiosError(errorMessage));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });

      await table.vm.$emit('projectTeamTable:revokeUser', mockActivityContact);

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), errorMessage);
    });

    it('covers Axios Error WITHOUT response payload in onRevokeUser', async () => {
      const errorMessage = 'Revoke Fallback Message';
      vi.mocked(activityContactService.deleteActivityContact).mockRejectedValue(mockAxiosErrorNoResponse(errorMessage));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });

      await table.vm.$emit('projectTeamTable:revokeUser', mockActivityContact);

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), errorMessage);
    });

    it('covers standard Error instance in onRevokeUser', async () => {
      const errorMessage = 'Revoke Standard Error';
      vi.mocked(activityContactService.deleteActivityContact).mockRejectedValue(new Error(errorMessage));

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });

      await table.vm.$emit('projectTeamTable:revokeUser', mockActivityContact);

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith(expect.any(String), errorMessage);
    });

    it('covers non-Error string exceptions in onRevokeUser (false/fall-through branch)', async () => {
      vi.mocked(activityContactService.deleteActivityContact).mockRejectedValue('Just a random string error');

      const wrapper = shallowMount(ProjectTeamTab, wrapperSettings());
      const table = wrapper.findComponent({ name: 'ProjectTeamTable' });

      await table.vm.$emit('projectTeamTable:revokeUser', mockActivityContact);

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(activityContactService.deleteActivityContact).toHaveBeenCalled();
    });
  });
});
