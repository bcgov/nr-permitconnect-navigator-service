import { Field } from 'vee-validate';
import { flushPromises } from '@vue/test-utils';

import CancelButton from '@/components/form/CancelButton.vue';
import { electrificationProjectService, generalProjectService, housingProjectService, permitService } from '@/services';
import { useFormStore, useProjectStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { FormState } from '@/utils/enums/projectCommon';
import PermitAddView from '@/views/external/PermitAddView.vue';

import { mockRouter, resetMockRouter } from '../../../mockRouter';
import { mountComponent } from '../../../mountComponent';

import type { ElectrificationProject, GeneralProject, HousingProject, ProjectBase } from '@/types';

// Mocks

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockConfirmRequire = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockConfirmRequire }),
    useToast: () => ({ success: mockToastSuccess, error: mockToastError })
  };
});

// A stand-in for `AppliedPermitsCard` that registers just the one field the
// tests need to drive, via a real vee-validate `<Field>` -- so the actual
// ancestor `<Form>` in `PermitAddView` still validates/submits it. The real
// card's own behaviour (add/remove rows, selects, etc) is covered by its own
// spec; this only needs to exist so `data.permits.appliedPermits` is present.
const AppliedPermitsCardStub = {
  components: { Field },
  template: '<Field name="permits.appliedPermits[0].permitTypeId" as="input" data-testid="permitTypeId" />'
};

// Fixtures

const testProject: ProjectBase = {
  activityId: 'activity456',
  projectId: 'project789',
  projectName: 'Project Alpha'
} as ProjectBase;

// Mount

function mountPermitAddView(options: { initiative?: Initiative; project?: HousingProject } = {}) {
  const { initiative = Initiative.HOUSING } = options;
  // Not defaulted via destructuring -- a default there would also kick in
  // when a caller explicitly passes `project: undefined` to test the
  // no-project state, since JS applies parameter defaults on `undefined`.
  const project = 'project' in options ? options.project : testProject;

  const { wrapper } = mountComponent(PermitAddView, {
    props: { projectId: testProject.projectId },
    piniaState: {
      app: { initiative },
      project: { project }
    },
    stubs: {
      AppliedPermitsCard: AppliedPermitsCardStub,
      FormNavigationGuard: true
    }
  });

  return { wrapper };
}

/**
 * One `trigger('submit')` + `flushPromises()` isn't enough to see
 * `@submit`/`@invalid-submit` fire -- a second flush, with a real timer
 * delay before it, is needed too. Found by trial and error; the underlying
 * reason isn't confirmed.
 */
async function submitForm(wrapper: ReturnType<typeof mountPermitAddView>['wrapper']) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 50));
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
  resetMockRouter();
  vi.spyOn(electrificationProjectService, 'getProject').mockResolvedValue(
    testProject as unknown as ElectrificationProject
  );
  vi.spyOn(generalProjectService, 'getProject').mockResolvedValue(testProject as unknown as GeneralProject);
  vi.spyOn(housingProjectService, 'getProject').mockResolvedValue(testProject as unknown as HousingProject);
  vi.spyOn(permitService, 'intakePermits').mockResolvedValue([]);
});

// Tests

describe('PermitAddView', () => {
  describe('rendering', () => {
    it('does not render the form when there is no project in the store', () => {
      const { wrapper } = mountPermitAddView({ project: undefined });

      expect(wrapper.find('form').exists()).toBe(false);
    });

    it('renders the project name and the applied permits form', async () => {
      const { wrapper } = mountPermitAddView();
      await flushPromises();

      expect(wrapper.find('h1').text()).toBe(testProject.projectName);
      expect(wrapper.find('form').exists()).toBe(true);
    });
  });

  describe('onMounted', () => {
    it.each([
      [Initiative.ELECTRIFICATION, () => electrificationProjectService.getProject],
      [Initiative.GENERAL, () => generalProjectService.getProject],
      [Initiative.HOUSING, () => housingProjectService.getProject]
    ])('loads the project via the %s project service and unlocks the form', async (initiative, getServiceSpy) => {
      mountPermitAddView({ initiative });
      await flushPromises();

      expect(getServiceSpy()).toHaveBeenCalledExactlyOnceWith({ projectId: testProject.projectId });
      expect(useProjectStore().setProject).toHaveBeenCalledWith(testProject);
      expect(useFormStore().setFormState).toHaveBeenCalledWith(FormState.UNLOCKED);
    });

    it('shows an error toast and routes back to the project when the project fails to load', async () => {
      vi.mocked(housingProjectService.getProject).mockRejectedValue(new Error('BOOM'));

      mountPermitAddView();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: RouteName.EXT_HOUSING_PROJECT,
        params: { projectId: testProject.projectId }
      });
      expect(useFormStore().setFormState).not.toHaveBeenCalled();
    });

    it('shows an error toast when the initiative cannot be determined', async () => {
      mountPermitAddView({ initiative: Initiative.PCNS });
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
      expect(housingProjectService.getProject).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('submits the applied permits and navigates back to the project on success', async () => {
      const { wrapper } = mountPermitAddView();
      await flushPromises();

      await wrapper.find('[data-testid="permitTypeId"]').setValue('5');
      await submitForm(wrapper);

      const confirmArgs = mockConfirmRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(permitService.intakePermits).toHaveBeenCalledWith([
        expect.objectContaining({ activityId: testProject.activityId, permitTypeId: '5' })
      ]);
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: RouteName.EXT_HOUSING_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });

    it('shows an error toast and leaves the form editable when the intake request fails', async () => {
      vi.mocked(permitService.intakePermits).mockRejectedValue(new Error('BOOM'));

      const { wrapper } = mountPermitAddView();
      await flushPromises();

      await wrapper.find('[data-testid="permitTypeId"]').setValue('5');
      await submitForm(wrapper);

      const confirmArgs = mockConfirmRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('user interaction', () => {
    it('navigates back to the project when cancelled', async () => {
      const { wrapper } = mountPermitAddView();
      await flushPromises();

      await wrapper.findComponent(CancelButton).vm.$emit('clicked');

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: RouteName.EXT_HOUSING_PROJECT,
        params: { projectId: testProject.projectId }
      });
    });
  });
});
