import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';

import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';

import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { useConfirm, useToast } from '@/lib/primevue';
import { peachService, permitService, sourceSystemKindService, userService } from '@/services';
import { PermitNeeded, PermitStage, PermitState } from '@/utils/enums/permit';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';

import type { Permit, PermitTracking, PermitType } from '@/types';
import type { AxiosResponse } from 'axios';

// Mock Services
vi.mock('@/services', () => ({
  peachService: { getPeachSummary: vi.fn() },
  permitService: { upsertPermit: vi.fn(), deletePermit: vi.fn() },
  permitNoteService: { createPermitNote: vi.fn() },
  sourceSystemKindService: { getSourceSystemKinds: vi.fn() },
  userService: { searchUsers: vi.fn() }
}));

// Mock PrimeVue Composables
vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/primevue')>();
  return {
    ...actual,
    useConfirm: vi.fn(),
    useToast: vi.fn()
  };
});

// Mock Vue Router
const mockRouterPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush })
}));

// Mock i18n
const mockT = (key: string) => key;
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT,
    locale: { value: 'en' }
  })
}));

const testSourceSystemKinds = [
  {
    sourceSystemKindId: 10,
    sourceSystem: 'ITSM-9999',
    description: 'Integrated System',
    integrated: true,
    permitTypeIds: [123]
  },
  {
    sourceSystemKindId: 2,
    sourceSystem: 'OTHER',
    description: 'Standard System',
    integrated: false,
    permitTypeIds: [123]
  }
];

const defaultAuthorization: Permit = {
  permitId: 'permit-123',
  permitType: {
    name: 'Test Auth',
    agency: 'Agency',
    businessDomain: 'Domain',
    permitTypeId: 123,
    sourceSystem: 'OTHER'
  },
  stage: PermitStage.PRE_SUBMISSION,
  state: PermitState.NONE,
  needed: PermitNeeded.YES,
  permitTracking: [],
  createdAt: '2025-01-01',
  createdBy: 'creator'
} as unknown as Permit;

const wrapperSettings = (props = {}, isPeachEnabled = true) => ({
  props: {
    editable: true,
    ...props
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          app: { features: { peach: isPeachEnabled } },
          project: {
            project: { activityId: 'act-123', projectId: 'project-123' }
          },
          code: { codes: { SourceSystem: [] } }
        }
      }),
      PrimeVue
    ],
    provide: {
      [projectRouteNameKey as symbol]: { value: 'housing-project' },
      [projectServiceKey as symbol]: { value: { emailConfirmation: vi.fn() } }
    },
    stubs: {
      'font-awesome-icon': true,
      AuthorizationCardIntake: true,
      AuthorizationStatusUpdatesCard: true,
      AuthorizationUpdateHistory: true,
      FormNavigationGuard: true,
      Form: {
        name: 'Form',
        template:
          '<form @submit.prevent="$emit(\'submit\', $attrs[\'initial-values\'])"><slot :values="$attrs[\'initial-values\']" :setFieldValue="() => {}" /></form>'
      },
      Dialog: {
        name: 'Dialog',
        template: '<div v-if="$attrs.visible" class="stub-dialog"><slot name="header" /><slot /></div>'
      }
    },
    directives: {
      Tooltip: Tooltip
    }
  }
});

describe('AuthorizationForm.vue', () => {
  let mockToastError: ReturnType<typeof vi.fn>;
  let mockToastSuccess: ReturnType<typeof vi.fn>;
  let mockConfirmRequire: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockToastError = vi.fn();
    mockToastSuccess = vi.fn();
    vi.mocked(useToast).mockReturnValue({ error: mockToastError, success: mockToastSuccess } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    mockConfirmRequire = vi.fn();
    vi.mocked(useConfirm).mockReturnValue({ require: mockConfirmRequire } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    vi.mocked(sourceSystemKindService.getSourceSystemKinds).mockResolvedValue({
      data: testSourceSystemKinds
    } as AxiosResponse);
    vi.mocked(userService.searchUsers).mockResolvedValue({
      data: [{ firstName: 'John', lastName: 'Doe' }]
    } as AxiosResponse);
  });

  describe('Initialization and Rendering', () => {
    it('loads source system kinds and renders properly without initial authorization', async () => {
      const wrapper = mount(AuthorizationForm, wrapperSettings());
      await flushPromises();

      expect(sourceSystemKindService.getSourceSystemKinds).toHaveBeenCalledTimes(1);
      expect(wrapper.html()).toContain('authorization.authorizationForm.addAuthorization');
    });

    it('displays authorization metadata when editing an existing permit', async () => {
      const wrapper = mount(
        AuthorizationForm,
        wrapperSettings({ authorization: { ...defaultAuthorization, updatedBy: 'user-1' } })
      );
      await flushPromises();

      expect(userService.searchUsers).toHaveBeenCalledWith({ userId: ['user-1'] });
      expect(wrapper.html()).toContain('Agency');
      expect(wrapper.html()).toContain('Domain');
      expect(wrapper.html()).toContain('Doe, John');
    });
  });

  describe('Form Submissions', () => {
    it('submits a standard permit successfully and navigates back', async () => {
      const wrapper = mount(AuthorizationForm, wrapperSettings({ authorization: defaultAuthorization }));
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(permitService.upsertPermit).toHaveBeenCalledWith(
        expect.objectContaining({
          permitId: 'permit-123',
          permitTypeId: 123
        })
      );
      expect(mockToastSuccess).toHaveBeenCalledWith('authorization.authorizationForm.permitSaved');
      expect(mockRouterPush).toHaveBeenCalledWith(expect.objectContaining({ name: 'housing-project' }));
    });

    it('interacts with PEACH service when saving an integrated authorization', async () => {
      const peachAuth: Permit = {
        ...defaultAuthorization,
        permitType: { ...defaultAuthorization.permitType, sourceSystem: 'ITSM-9999' } as PermitType,
        permitTracking: [{ sourceSystemKindId: 10, trackingId: 'ABC-123' } as PermitTracking]
      };

      vi.mocked(peachService.getPeachSummary).mockResolvedValue({
        data: { state: PermitState.ACCEPTED, stage: PermitStage.POST_DECISION }
      } as AxiosResponse);

      const wrapper = mount(AuthorizationForm, wrapperSettings({ authorization: peachAuth }));
      await flushPromises();

      const submitBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('authorization.authorizationForm.automatePublish'));
      expect(submitBtn).toBeDefined();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(peachService.getPeachSummary).toHaveBeenCalledTimes(1);

      const upsertArgs = vi.mocked(permitService.upsertPermit).mock.calls[0][0];
      expect(upsertArgs.state).toBe(PermitState.ACCEPTED);
      expect(upsertArgs.stage).toBe(PermitStage.POST_DECISION);
    });

    it('opens no data modal when PEACH service returns a 404', async () => {
      const peachAuth: Permit = {
        ...defaultAuthorization,
        permitType: { ...defaultAuthorization.permitType, sourceSystem: 'ITSM-9999' } as PermitType,
        permitTracking: [{ sourceSystemKindId: 10, trackingId: 'ABC-123' } as PermitTracking]
      };

      vi.mocked(peachService.getPeachSummary).mockRejectedValue({
        status: 404,
        response: { data: { extra: { peachError: { record_id: '1', system_id: '1' } } } },
        isAxiosError: true
      });

      const wrapper = mount(AuthorizationForm, wrapperSettings({ authorization: peachAuth }));
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.html()).toContain('authorization.authorizationForm.noRecordsFound');

      expect(permitService.upsertPermit).not.toHaveBeenCalled();

      const confirmBtn = wrapper
        .findAll('.stub-dialog button')
        .find((b) => b.text().includes('authorization.authorizationForm.confirm'));
      await confirmBtn?.trigger('click');
      await flushPromises();

      // Now upsert should proceed
      expect(permitService.upsertPermit).toHaveBeenCalled();
    });
  });

  describe('Deletion Logic', () => {
    it('triggers confirmation dialog and deletes permit on accept', async () => {
      const wrapper = mount(AuthorizationForm, wrapperSettings({ authorization: defaultAuthorization }));
      await flushPromises();

      mockConfirmRequire.mockImplementationOnce((options) => options.accept());

      const deleteBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('authorization.authorizationForm.delete'));
      await deleteBtn?.trigger('click');
      await flushPromises();

      expect(mockConfirmRequire).toHaveBeenCalled();
      expect(permitService.deletePermit).toHaveBeenCalledWith('permit-123');
      expect(mockToastSuccess).toHaveBeenCalledWith('authorization.authorizationForm.authDeleted');
      expect(mockRouterPush).toHaveBeenCalledWith(expect.objectContaining({ name: 'housing-project' }));
    });

    it('handles delete API failure gracefully', async () => {
      const wrapper = mount(AuthorizationForm, wrapperSettings({ authorization: defaultAuthorization }));
      await flushPromises();

      mockConfirmRequire.mockImplementationOnce((options) => options.accept());
      vi.mocked(permitService.deletePermit).mockRejectedValueOnce(new Error('Network error'));

      const deleteBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('authorization.authorizationForm.delete'));
      await deleteBtn?.trigger('click');
      await flushPromises();

      expect(mockToastError).toHaveBeenCalledWith('authorization.authorizationForm.authDeletionError', 'Network error');
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});
