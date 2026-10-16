import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import ProjectIntakeForm from '@/components/general/project/ProjectIntakeForm.vue';
import { StepperHeader } from '@/components/form';
import { contactService } from '@/services';
import { RouteName, StorageKey } from '@/utils/enums/application';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import { mountComponent } from '../../../../mountComponent';
import { mockRouter, resetMockRouter } from '../../../../mockRouter';

import type { Contact, Draft, GeneralProject } from '@/types';
import type { FormSchemaType } from '@/validators/general/projectIntakeFormSchema';

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

// Fixtures

const sampleContact: Contact = {
  contactId: '82fba7a8-9cb6-47c4-95b0-81c165e5a317',
  userId: 'd3245118-f4d6-429a-be8e-f13f049ade3a',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.CONSULTANT,
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

// Minimal fixtures for the "both draft and project supplied" error path.
// These deliberately don't need to be full valid shapes -- the component
// throws on this combination before it ever reads their fields.
const minimalDraft = { draftId: 'draft-1', activityId: 'activity-1', data: {} } as unknown as Draft<FormSchemaType>;
const minimalProject = { projectId: 'project-1' } as unknown as GeneralProject;

// Mount

const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');

function mountProjectIntakeForm(options: { props?: Record<string, unknown> } = {}) {
  const { wrapper } = mountComponent(ProjectIntakeForm, {
    props: options.props,
    piniaState: {},
    stubs: {
      Map: true,
      ProjectIntakeAssistance: true
    }
  });

  return { wrapper };
}

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: { authority: 'abc', clientId: '123' }
    })
  );

  searchContactsSpy.mockResolvedValue([sampleContact]);
  resetMockRouter();
  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

// Tests

describe('ProjectIntakeForm', () => {
  describe('rendering', () => {
    it('mounts without error', async () => {
      const { wrapper } = mountProjectIntakeForm();
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });

    it('renders the form synchronously on mount', async () => {
      const { wrapper } = mountProjectIntakeForm();

      expect(wrapper.find('#form').exists()).toBe(true);
    });

    it('renders one stepper header per step, in order', async () => {
      const { wrapper } = mountProjectIntakeForm();
      await flushPromises();

      const headers = wrapper.findAllComponents(StepperHeader);

      expect(headers).toHaveLength(4);
      expect(headers.map((h) => h.props('index'))).toEqual([0, 1, 2, 3]);
    });

    it('disables the submit button until the last step is reached', async () => {
      const { wrapper } = mountProjectIntakeForm();
      await nextTick();
      await flushPromises();

      const submitButton = wrapper.find('[type="submit"]');

      expect(submitButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('onBeforeMount', () => {
    it('redirects to the general error route if both `draft` and `project` are supplied', async () => {
      mountProjectIntakeForm({ props: { draft: minimalDraft, project: minimalProject } });
      await flushPromises();

      expect(mockRouter.replace).toHaveBeenCalledWith({ name: RouteName.EXT_GENERAL });
    });
  });
});
