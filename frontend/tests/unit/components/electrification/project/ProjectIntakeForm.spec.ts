import { flushPromises } from '@vue/test-utils';

import ContactCardIntakeForm from '@/components/form/common/ContactCardIntakeForm.vue';
import RegisteredBusinessCard from '@/components/form/common/RegisteredBusinessCard.vue';
import ProjectIntakeForm from '@/components/electrification/project/ProjectIntakeForm.vue';
import { electrificationProjectService } from '@/services';
import { useFormStore } from '@/store';
import { RouteName, StorageKey } from '@/utils/enums/application';
import { ElectrificationProjectType } from '@/utils/enums/codeEnums';
import { ActivityContactRole, ContactPreference, FormType, ProjectRelationship } from '@/utils/enums/projectCommon';
import { createProjectIntakeSchema } from '@/validators/electrification/projectIntakeFormSchema';

import { mockRouter, resetMockRouter } from '../../../../mockRouter';
import { mountComponent } from '../../../../mountComponent';

import type { Draft, ElectrificationProject } from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectIntakeFormSchema';

// Mocks

// vi.mock is hoisted, so it can't reference `mockRouter` directly from the
// shared util at declaration time -- but it CAN return the same object
// reference at call time, which is all that matters for spies.
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ params: {}, query: {} }),
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn()
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockConfirmRequire = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockConfirmRequire }),
    useToast: () => ({ success: mockToastSuccess, error: mockToastError })
  };
});

// Fixtures

const primaryContact = {
  contactId: '82fba7a8-9cb6-47c4-95b0-81c165e5a317',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '1234567890',
  contactApplicantRelationship: ProjectRelationship.CONSULTANT,
  contactPreference: ContactPreference.EITHER
};

const testProject = {
  activityId: 'activity-1',
  companyNameRegistered: 'Test Co',
  companyIdRegistered: 'BC123',
  projectName: 'Project Alpha',
  projectDescription: 'A description',
  bcHydroNumber: '12345',
  projectType: ElectrificationProjectType.IPP_SOLAR,
  activity: {
    activityContact: [{ role: ActivityContactRole.PRIMARY, contact: primaryContact }]
  }
} as unknown as ElectrificationProject;

const testDraft = {
  draftId: 'draft-1',
  activityId: 'activity-1',
  data: {
    basic: { registeredId: 'BC123', registeredName: 'Test Co', projectName: 'Project Alpha' },
    contacts: { firstName: 'Jane' },
    project: { projectType: ElectrificationProjectType.IPP_SOLAR }
  }
} as unknown as Draft<FormSchemaType>;

// Minimal fixtures for the "both draft and project supplied" error path.
// These deliberately don't need to be full valid shapes -- the component
// throws on this combination before it ever reads their fields.
const minimalDraft = { draftId: 'draft-1', activityId: 'activity-1', data: {} } as unknown as Draft<FormSchemaType>;
const minimalProject = { projectId: 'project-1' } as unknown as ElectrificationProject;

// `ref="autoSaveRef"` in the real template points at whatever `FormAutosave`
// is stubbed with -- the component calls `autoSaveRef.value?.stopAutoSave()`
// before every draft save, which throws against VTU's default `true` auto-stub
// (no exposed methods) and corrupts the render tree. An Options API stub
// with a real `stopAutoSave` method keeps that call a no-op.
const FormAutosaveStub = {
  name: 'FormAutosave',
  props: ['callback', 'delay'],
  template: '<div />',
  methods: {
    stopAutoSave() {
      // no-op
    }
  }
};

// Mount

const upsertDraftSpy = vi.spyOn(electrificationProjectService, 'upsertDraft');
const submitDraftSpy = vi.spyOn(electrificationProjectService, 'submitDraft');

function mountProjectIntakeForm(options: { props?: Record<string, unknown> } = {}) {
  const { wrapper } = mountComponent(ProjectIntakeForm, {
    props: options.props,
    piniaState: {
      contact: { contact: primaryContact },
      code: {
        codes: { ElectrificationProjectType: [{ code: ElectrificationProjectType.IPP_SOLAR, display: 'IPP Solar' }] }
      }
    },
    stubs: {
      FormAutosave: FormAutosaveStub,
      FormNavigationGuard: { name: 'FormNavigationGuard', props: ['autoSaveRef'], template: '<div />' },
      CollectionDisclaimer: true,
      ValidationBanner: true,
      ContactCardIntakeForm: true,
      RegisteredBusinessCard: true,
      ProjectNameCard: true,
      ProjectTypeCard: true,
      BcHydroNumberCard: true,
      ProjectDescriptionCard: true
    }
  });

  return { wrapper };
}

/**
 * One `trigger('submit')` + `flushPromises()` isn't enough to see
 * `@submit`/`@invalid-submit` fire -- a second flush, with a real timer
 * delay before it, is needed too. (Same gotcha found for ProjectFormNavigator.)
 */
async function submitForm(wrapper: ReturnType<typeof mountProjectIntakeForm>['wrapper']) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 50));
  await flushPromises();
}

beforeEach(() => {
  sessionStorage.setItem(StorageKey.CONFIG, JSON.stringify({ oidc: { authority: 'abc', clientId: '123' } }));
  resetMockRouter();
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

// Tests

describe('ProjectIntakeForm', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountProjectIntakeForm();

      expect(wrapper.exists()).toBe(true);
    });

    it('renders the form synchronously on mount', () => {
      const { wrapper } = mountProjectIntakeForm();

      expect(wrapper.find('#form').exists()).toBe(true);
    });
  });

  describe('onBeforeMount', () => {
    it('redirects to the general error route if both `draft` and `project` are supplied', async () => {
      mountProjectIntakeForm({ props: { draft: minimalDraft, project: minimalProject } });
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith({ name: RouteName.EXT_ELECTRIFICATION });
    });

    it('populates initial values from a draft, including org book options when a business is present', () => {
      const { wrapper } = mountProjectIntakeForm({ props: { draft: testDraft } });

      expect(wrapper.findComponent(ContactCardIntakeForm).props('initialFormValues')).toEqual(testDraft.data.contacts);
      expect(wrapper.findComponent(RegisteredBusinessCard).props('orgBookOptions')).toEqual([
        { registeredId: 'BC123', registeredName: 'Test Co' }
      ]);
    });

    it('does not populate org book options when the draft lacks a registered business', () => {
      const draftWithoutBusiness = {
        ...testDraft,
        data: { ...testDraft.data, basic: { projectName: 'Project Alpha' } }
      } as unknown as Draft<FormSchemaType>;

      const { wrapper } = mountProjectIntakeForm({ props: { draft: draftWithoutBusiness } });

      expect(wrapper.findComponent(RegisteredBusinessCard).props('orgBookOptions')).toEqual([]);
    });

    it('populates initial values from a project primary contact', () => {
      const { wrapper } = mountProjectIntakeForm({ props: { project: testProject } });

      expect(wrapper.findComponent(ContactCardIntakeForm).props('initialFormValues')).toEqual(
        expect.objectContaining({ contactId: primaryContact.contactId, firstName: primaryContact.firstName })
      );
    });

    it('populates initial values from the current user contact when neither draft nor project is supplied', () => {
      const { wrapper } = mountProjectIntakeForm();

      expect(wrapper.findComponent(ContactCardIntakeForm).props('initialFormValues')).toEqual(
        expect.objectContaining({ contactId: primaryContact.contactId, firstName: primaryContact.firstName })
      );
    });
  });

  describe('draft auto-save', () => {
    it('saves the draft via the FormAutosave callback, updates the model, and toasts success', async () => {
      const response = { ...testDraft, draftId: 'draft-2' };
      upsertDraftSpy.mockResolvedValue(response);

      const { wrapper } = mountProjectIntakeForm();
      const callback = wrapper.findComponent({ name: 'FormAutosave' }).props('callback') as () => Promise<void>;
      await callback();
      await flushPromises();

      expect(upsertDraftSpy).toHaveBeenCalledWith(expect.objectContaining({ draftId: undefined }));
      expect(wrapper.emitted('update:draft')?.[0]).toEqual([response]);
      expect(useFormStore().setFormType).toHaveBeenCalledWith(FormType.DRAFT);
      expect(mockRouter.replace).toHaveBeenCalledWith({ params: { draftId: response.draftId } });
      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('shows an error toast when saving the draft fails', async () => {
      upsertDraftSpy.mockRejectedValue(new Error('BOOM'));

      const { wrapper } = mountProjectIntakeForm();
      const callback = wrapper.findComponent({ name: 'FormAutosave' }).props('callback') as () => Promise<void>;
      await callback();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
      expect(wrapper.emitted('update:draft')).toBeUndefined();
    });
  });

  describe('form submission', () => {
    it('submits the built payload and navigates to the confirmation page on success', async () => {
      submitDraftSpy.mockResolvedValue({
        activityId: 'activity-1',
        electrificationProjectId: 'project-1'
      } as ElectrificationProject);

      const { wrapper } = mountProjectIntakeForm({ props: { project: testProject } });
      // The project branch of onBeforeMount doesn't seed `orgBookOptions`
      // from the project's existing registered business, so the search
      // component (stubbed here) has to "reselect" it for the business-name
      // validator to accept the pre-filled value.
      await wrapper
        .findComponent(RegisteredBusinessCard)
        .vm.$emit('update:orgBookOptions', [
          { registeredId: testProject.companyIdRegistered, registeredName: testProject.companyNameRegistered }
        ]);

      await submitForm(wrapper);

      const confirmArgs = mockConfirmRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(submitDraftSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: undefined,
          draftId: undefined,
          basic: expect.objectContaining({
            registeredId: testProject.companyIdRegistered,
            registeredName: testProject.companyNameRegistered,
            projectName: testProject.projectName
          }),
          project: { bcHydroNumber: testProject.bcHydroNumber, projectType: testProject.projectType }
        })
      );
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: RouteName.EXT_ELECTRIFICATION_INTAKE_CONFIRMATION,
        params: { projectId: 'project-1' }
      });
    });

    it('shows an error toast and unlocks the form when the response is missing IDs', async () => {
      submitDraftSpy.mockResolvedValue({} as ElectrificationProject);

      const { wrapper } = mountProjectIntakeForm({ props: { project: testProject } });
      await wrapper
        .findComponent(RegisteredBusinessCard)
        .vm.$emit('update:orgBookOptions', [
          { registeredId: testProject.companyIdRegistered, registeredName: testProject.companyNameRegistered }
        ]);

      await submitForm(wrapper);
      const confirmArgs = mockConfirmRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  // These don't need a mounted component at all --
  // `createProjectIntakeSchema` is a pure function, so we test it directly.
  describe('validation schema', () => {
    const codeList = { ElectrificationProjectType: [ElectrificationProjectType.IPP_SOLAR] } as never;
    const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

    const validCases = [
      {
        category: 'basic',
        data: {
          basic: {
            registeredId: 'BC123',
            registeredName: 'Test Co',
            projectName: 'Project',
            projectDescription: undefined
          }
        }
      },
      {
        category: 'project',
        data: { project: { projectType: ElectrificationProjectType.IPP_SOLAR, bcHydroNumber: '12345' } }
      }
    ] as const;

    const invalidCases = [
      { category: 'basic', data: { basic: { registeredName: 'Not a suggestion', projectName: 'Project' } } },
      { category: 'basic', data: {} },
      { category: 'project', data: { project: { projectType: 'NOT_A_TYPE' } } },
      { category: 'project', data: {} }
    ] as const;

    it.each(validCases)('$category passes validation with well-formed data', async ({ category, data }) => {
      await expect(
        createProjectIntakeSchema(codeList, orgBookOptions).validateAt(category, data)
      ).resolves.toBeTruthy();
    });

    it.each(invalidCases)('$category rejects malformed or missing data', async ({ category, data }) => {
      await expect(
        createProjectIntakeSchema(codeList, orgBookOptions).validateAt(category, data)
      ).rejects.toThrowError();
    });

    it('requires a project description only when the project type is OTHER', async () => {
      const schema = createProjectIntakeSchema(codeList, orgBookOptions);

      await expect(
        schema.validateAt(
          'basic',
          { basic: { registeredId: 'BC123', registeredName: 'Test Co', projectName: 'Project' } },
          { context: { project: { projectType: ElectrificationProjectType.OTHER } } }
        )
      ).rejects.toThrowError();

      await expect(
        schema.validateAt(
          'basic',
          { basic: { registeredId: 'BC123', registeredName: 'Test Co', projectName: 'Project' } },
          { context: { project: { projectType: ElectrificationProjectType.IPP_SOLAR } } }
        )
      ).resolves.toBeTruthy();
    });
  });
});
