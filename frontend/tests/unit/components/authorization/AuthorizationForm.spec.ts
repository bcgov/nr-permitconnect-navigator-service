import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { shallowMount } from '@vue/test-utils';

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import AuthorizationForm from '@/components/authorization/AuthorizationForm.vue';
import { peachService, permitService, permitNoteService, sourceSystemKindService, userService } from '@/services';
import { useConfigStore } from '@/store';
import { StorageKey } from '@/utils/enums/application';
import { PermitNeeded, PermitStage, PermitState } from '@/utils/enums/permit';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';

import type { AxiosResponse } from 'axios';

const createPermitNoteSpy = vi.spyOn(permitNoteService, 'createPermitNote');
const deletePermitSpy = vi.spyOn(permitService, 'deletePermit');
const getPeachSummarySpy = vi.spyOn(peachService, 'getPeachSummary');
const getSourceSystemKindsService = vi.spyOn(sourceSystemKindService, 'getSourceSystemKinds');
const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
const upsertPermitSpy = vi.spyOn(permitService, 'upsertPermit');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn(),
    locale: { value: 'en' }
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

const testSourceSystemKinds = [
  {
    sourceSystemKindId: 3,
    kind: null,
    description: 'Permit Number',
    sourceSystem: 'ITSM-5285',
    createdBy: '00000000-0000-4000-8000-000000000000',
    createdAt: '2025-12-02T23:52:52.615Z',
    updatedBy: null,
    updatedAt: null,
    deletedBy: null,
    deletedAt: null
  },
  {
    sourceSystemKindId: 2,
    kind: null,
    description: 'Application Number',
    sourceSystem: 'ITSM-5285',
    createdBy: '00000000-0000-4000-8000-000000000000',
    createdAt: '2025-12-02T23:52:52.615Z',
    updatedBy: null,
    updatedAt: null,
    deletedBy: null,
    deletedAt: null
  }
];

let pinia: ReturnType<typeof createTestingPinia>;

const wrapperSettings = () => ({
  props: {
    editable: true
  },
  global: {
    plugins: [pinia, PrimeVue, ConfirmationService, ToastService],
    provide: {
      [projectRouteNameKey as symbol]: { value: 'housing-project' },
      [projectServiceKey as symbol]: {
        value: {
          emailConfirmation: vi.fn()
        }
      }
    },
    stubs: {
      'font-awesome-icon': true,
      AuthorizationCardIntake: true,
      AuthorizationStatusUpdatesCard: true,
      AuthorizationUpdateHistory: true,
      FormNavigationGuard: true
    },
    directives: {
      Tooltip: Tooltip
    }
  }
});

beforeEach(async () => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      },
      ches: {
        submission: {
          cc: 'test@example.com'
        }
      },
      features: { peach: true }
    })
  );

  pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
    initialState: {
      auth: {
        user: {}
      },
      project: {
        project: {
          activityId: 'CE0756D0',
          projectId: 'project-123',
          projectName: 'Test Project',
          assignedUserId: undefined,
          contacts: []
        }
      },
      code: {
        codes: {
          ElectrificationProjectCategory: [],
          ElectrificationProjectType: [],
          EscalationType: [],
          SourceSystem: []
        }
      }
    }
  });
  setActivePinia(pinia);

  const configStore = useConfigStore();
  await configStore.init();

  vi.clearAllMocks();

  createPermitNoteSpy.mockResolvedValue({ data: {} } as AxiosResponse);
  deletePermitSpy.mockResolvedValue({} as AxiosResponse);
  getPeachSummarySpy.mockResolvedValue({ data: null } as AxiosResponse);
  getSourceSystemKindsService.mockResolvedValue({ data: testSourceSystemKinds } as AxiosResponse);
  searchUsersSpy.mockResolvedValue({
    data: [
      {
        firstName: 'Updater',
        lastName: 'User'
      }
    ]
  } as AxiosResponse);
  upsertPermitSpy.mockResolvedValue({
    data: {
      permitId: 'permit-123',
      permitType: { name: 'Test Authorization Type' },
      submittedDate: '2025-01-01',
      createdAt: '2025-01-01'
    }
  } as AxiosResponse);
});

afterEach(() => {
  sessionStorage.clear();
});

describe('AuthorizationForm', () => {
  it('renders component', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('loads source system kinds on mount', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    expect(getSourceSystemKindsService).toHaveBeenCalledTimes(1);

    const vm: any = wrapper.vm;
    expect(vm.sourceSystemKinds).toHaveLength(testSourceSystemKinds.length);
  });

  it('initializes default form values when no authorization is provided', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm;

    expect(vm.initialFormValues).toEqual({
      state: PermitState.NONE,
      stage: PermitStage.PRE_SUBMISSION
    });
  });

  it('initializes form values when authorization is provided', async () => {
    const baseSettings = wrapperSettings();

    const auth = {
      permitType: { name: 'Test Auth', agency: 'Test Agency', businessDomain: 'Domain' },
      decisionDate: '2025-01-02',
      decisionTime: '10:00',
      submittedDate: '2025-01-01',
      submittedTime: '09:00',
      permitTracking: [
        {
          sourceSystemKindId: 10,
          trackingId: 'ABC-123',
          shownToProponent: true,
          sourceSystemKind: { sourceSystemKindId: 10 }
        }
      ],
      issuedPermitId: 'ISS-1',
      statusLastChanged: '2025-01-03',
      statusLastChangedTime: '11:00',
      statusLastVerified: '2025-01-03',
      statusLastVerifiedTime: '11:00',
      stage: PermitStage.APPLICATION_SUBMISSION,
      state: PermitState.IN_PROGRESS,
      needed: PermitNeeded.YES,
      permitId: 'permit-123',
      createdAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'creator',
      updatedAt: '2025-01-03T00:00:00.000Z',
      updatedBy: 'updater'
    };

    const wrapper = shallowMount(AuthorizationForm, {
      ...baseSettings,
      props: {
        ...baseSettings.props,
        authorization: auth as any
      }
    });

    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    expect(vm.initialFormValues.authorizationType).toEqual(auth.permitType);
    expect(vm.initialFormValues.stage).toBe(auth.stage);
    expect(vm.initialFormValues.state).toBe(auth.state);
    expect(vm.initialFormValues.needed).toBe(auth.needed);

    expect(vm.initialFormValues.permitTracking).toEqual([
      {
        sourceSystemKindId: 10,
        trackingId: 'ABC-123',
        shownToProponent: true
      }
    ]);
  });

  it('detects a PEACH integrated auth type when sourceSystemKinds contains an integrated system', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    vm.sourceSystemKinds = [
      {
        sourceSystemKindId: 1,
        sourceSystem: 'ITSM-9999',
        description: 'Job Number',
        kind: null,
        createdBy: 'user',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        integrated: true
      }
    ];

    expect(vm.checkIfPeachIntegratedAuthType('ITSM-9999')).toBe(true);
    expect(vm.checkIfPeachIntegratedAuthType('OTHER-SYS')).toBe(false);
  });

  it('detects PEACH integrated tracking ids based on sourceSystemKinds', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    vm.sourceSystemKinds = [
      {
        sourceSystemKindId: 10,
        sourceSystem: 'ITSM-9999',
        description: 'Job Number',
        kind: null,
        createdBy: 'user',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        integrated: true
      }
    ];

    const integratedTracking = [
      {
        sourceSystemKindId: 10,
        trackingId: 'ABC-123',
        shownToProponent: false
      }
    ];

    const nonIntegratedTracking = [
      {
        sourceSystemKindId: 999,
        trackingId: 'XYZ-999',
        shownToProponent: false
      }
    ];

    expect(vm.checkIfPeachIntegratedTrackingId(integratedTracking)).toBe(true);
    expect(vm.checkIfPeachIntegratedTrackingId(nonIntegratedTracking)).toBe(false);
    expect(vm.checkIfPeachIntegratedTrackingId([])).toBe(false);
  });

  it('submits a non-PEACH permit, creates note, and triggers email notification', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();
    const vm: any = wrapper.vm;

    const projectService = vm.projectService.value;
    const emailSpy = vi.spyOn(projectService, 'emailConfirmation');

    const submitPayload = {
      authorizationType: {
        permitTypeId: 123,
        sourceSystem: 'NON-PEACH-SYS'
      },
      permitNote: 'This is a test note',
      decisionDate: null,
      submittedDate: null,
      statusLastChanged: null,
      statusLastVerified: null,
      needed: PermitNeeded.YES,
      stage: PermitStage.APPLICATION_SUBMISSION,
      state: PermitState.IN_PROGRESS,
      permitTracking: []
    };

    await vm.onSubmit(submitPayload);
    await wrapper.vm.$nextTick();

    expect(upsertPermitSpy).toHaveBeenCalledTimes(1);

    expect(createPermitNoteSpy).toHaveBeenCalledTimes(1);
    expect(createPermitNoteSpy).toHaveBeenCalledWith({
      permitId: 'permit-123',
      note: 'This is a test note'
    });

    expect(getPeachSummarySpy).not.toHaveBeenCalled();

    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  it('does not create a permit note when note is empty or whitespace', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    const submitPayload = {
      authorizationType: {
        permitTypeId: 123,
        sourceSystem: 'NON-PEACH-SYS'
      },
      permitNote: '   ',
      decisionDate: null,
      submittedDate: null,
      statusLastChanged: null,
      statusLastVerified: null,
      needed: PermitNeeded.YES,
      stage: PermitStage.APPLICATION_SUBMISSION,
      state: PermitState.IN_PROGRESS,
      permitTracking: []
    };

    await vm.onSubmit(submitPayload);

    expect(upsertPermitSpy).toHaveBeenCalledTimes(1);
    expect(createPermitNoteSpy).not.toHaveBeenCalled();
  });

  it('removes the Peach template from permitNote when leaving Peach-integrated state', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;
    const template = 'PEACH TEMPLATE';

    (vm.t as any).mockReturnValue(template);

    const setFieldValue = vi.fn();

    (vm as any).formRef = {
      values: {
        permitNote: `Some user text\n\n${template}\n\nMore text`
      },
      setFieldValue
    };

    vm.handlePeachIntegrationChange(false, true);

    expect(setFieldValue).toHaveBeenCalledWith('permitNote', 'Some user text\n\nMore text');
  });

  it('adds Peach template when entering integrated mode and note is empty', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;
    const template = 'PEACH TEMPLATE';

    (vm.t as any).mockReturnValue(template);

    const setFieldValue = vi.fn();

    (vm as any).formRef = {
      values: {
        permitNote: ''
      },
      setFieldValue
    };

    vm.handlePeachIntegrationChange(true, false);

    expect(setFieldValue).toHaveBeenCalledWith('permitNote', template);
  });

  it('appends Peach template once when entering integrated mode and note has content', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;
    const template = 'PEACH TEMPLATE';

    (vm.t as any).mockReturnValue(template);

    const setFieldValue = vi.fn();

    (vm as any).formRef = {
      values: {
        permitNote: 'Existing note'
      },
      setFieldValue
    };

    vm.handlePeachIntegrationChange(true, false);

    expect(setFieldValue).toHaveBeenCalledWith('permitNote', `Existing note\n\n${template}`);
  });

  it('does not add Peach template when authorization already has existing notes', async () => {
    const baseSettings = wrapperSettings();
    const wrapper = shallowMount(AuthorizationForm, {
      ...baseSettings,
      props: {
        ...baseSettings.props,
        authorization: {
          permitNote: 'previous note',
          permitTracking: [
            {
              sourceSystemKindId: 10,
              trackingId: 'ABC-123',
              shownToProponent: true,
              sourceSystemKind: { sourceSystemKindId: 10 }
            }
          ]
        } as any
      }
    });
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;
    const template = 'PEACH TEMPLATE';
    (vm.t as any).mockReturnValue(template);

    const setFieldValue = vi.fn();

    (vm as any).formRef = {
      values: { permitNote: '' },
      setFieldValue
    };

    vm.handlePeachIntegrationChange(true, false);

    expect(setFieldValue).toHaveBeenCalledWith('needed', PermitNeeded.YES);

    expect(setFieldValue).not.toHaveBeenCalledWith('permitNote', expect.anything());
  });

  it('getPeachSummary maps sourceSystemKind onto permitTracking and returns data', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    vm.sourceSystemKinds = [
      {
        sourceSystemKindId: 10,
        sourceSystem: 'SYS',
        description: 'Job Number',
        kind: null,
        createdBy: 'user',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null,
        integrated: true
      }
    ];

    const tracking = [
      {
        sourceSystemKindId: 10,
        trackingId: 'ABC-123',
        shownToProponent: false
      }
    ];

    getPeachSummarySpy.mockResolvedValueOnce({ data: { some: 'data' } } as AxiosResponse);

    const result = await vm.getPeachSummary(tracking);

    expect(getPeachSummarySpy).toHaveBeenCalledTimes(1);
    expect(getPeachSummarySpy).toHaveBeenCalledWith([
      expect.objectContaining({
        sourceSystemKindId: 10,
        trackingId: 'ABC-123',
        shownToProponent: false,
        sourceSystemKind: expect.objectContaining({ sourceSystemKindId: 10 })
      })
    ]);

    expect(result).toEqual({ some: 'data' });
  });

  it('getPeachSummary shows noPeachData modal when record is not found (404)', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    getPeachSummarySpy.mockRejectedValueOnce({
      status: 404,
      response: {
        data: {
          extra: {
            peachError: {
              record_id: 'RID',
              system_id: 'SYS'
            }
          }
        }
      }
    });

    await vm.getPeachSummary([
      {
        sourceSystemKindId: 1,
        trackingId: 'ABC-123',
        shownToProponent: false
      }
    ]);

    expect(vm.noPeachDataModalVisible).toBe(true);
  });

  it('uses peachPermitNoteNotificationTemplate when note is only the Peach template and permit is valid', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();
    const vm: any = wrapper.vm;

    vm.isValidPeachPermit = true;

    const template = 'PEACH TEMPLATE ONLY';
    (vm.t as any).mockReturnValue(template);

    const projectService = vm.projectService.value;
    const emailSpy = vi.spyOn(projectService, 'emailConfirmation');

    const permit = {
      permitType: { name: 'Test Auth' },
      submittedDate: '2025-01-01',
      createdAt: '2025-01-01T00:00:00.000Z',
      permitId: 'permit-123'
    } as any;

    await vm.emailNotification(permit, template);

    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  it('handles errors when saving the permit fails', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    upsertPermitSpy.mockRejectedValueOnce(new Error('boom'));

    const submitPayload = {
      authorizationType: {
        permitTypeId: 123,
        sourceSystem: 'NON-PEACH-SYS'
      },
      permitNote: 'This is a test note',
      decisionDate: null,
      submittedDate: null,
      statusLastChanged: null,
      statusLastVerified: null,
      needed: PermitNeeded.YES,
      stage: PermitStage.APPLICATION_SUBMISSION,
      state: PermitState.IN_PROGRESS,
      permitTracking: []
    };

    await vm.onSubmit(submitPayload);
  });

  it('onDelete calls deletePermit and navigates on accept', async () => {
    const baseSettings = wrapperSettings();

    const wrapper = shallowMount(AuthorizationForm, {
      ...baseSettings,
      props: {
        ...baseSettings.props,
        authorization: {
          permitId: 'permit-123',
          permitType: { name: 'Test Auth', agency: 'A', businessDomain: 'B' },
          permitTracking: [],
          createdAt: '2025-01-01',
          createdBy: 'creator',
          stage: PermitStage.PRE_SUBMISSION,
          state: PermitState.NONE,
          needed: PermitNeeded.NO
        } as any
      }
    });

    await wrapper.vm.$nextTick();
    const vm: any = wrapper.vm;

    const requireSpy = vi.spyOn(vm.confirmDialog, 'require');

    vm.onDelete();

    expect(requireSpy).toHaveBeenCalledTimes(1);

    const args = requireSpy.mock.calls[0]![0] as { accept: () => Promise<void> };

    await args.accept();

    expect(deletePermitSpy).toHaveBeenCalledWith('permit-123');
    expect(vm.router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'housing-project',
        query: { initialTab: '2' }
      })
    );
  });

  it('onDelete shows error and does not navigate when delete fails', async () => {
    const baseSettings = wrapperSettings();

    const wrapper = shallowMount(AuthorizationForm, {
      ...baseSettings,
      props: {
        ...baseSettings.props,
        authorization: {
          permitId: 'permit-123',
          permitType: { name: 'Test Auth', agency: 'A', businessDomain: 'B' },
          permitTracking: [],
          createdAt: '2025-01-01',
          createdBy: 'creator',
          updatedAt: '2025-01-02',
          updatedBy: 'updater',
          stage: PermitStage.PRE_SUBMISSION,
          state: PermitState.NONE,
          needed: PermitNeeded.NO
        } as any
      }
    });

    await wrapper.vm.$nextTick();
    const vm: any = wrapper.vm;

    const requireSpy = vi.spyOn(vm.confirmDialog, 'require');
    deletePermitSpy.mockRejectedValueOnce(new Error('boom'));

    vm.onDelete();

    expect(requireSpy).toHaveBeenCalledTimes(1);

    const args = requireSpy.mock.calls[0]![0] as { accept: () => Promise<void> };

    await args.accept();

    expect(deletePermitSpy).toHaveBeenCalledWith('permit-123');
    expect(vm.router.push).not.toHaveBeenCalled();
  });

  it('onInvalidSubmit forwards errors without throwing', async () => {
    const wrapper = shallowMount(AuthorizationForm, wrapperSettings());
    await wrapper.vm.$nextTick();

    const vm: any = wrapper.vm;

    expect(() => vm.onInvalidSubmit({ errors: { field: 'some error' } })).not.toThrow();
  });
});
