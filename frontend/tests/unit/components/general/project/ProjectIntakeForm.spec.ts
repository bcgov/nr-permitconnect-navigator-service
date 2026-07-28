import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import ProjectIntakeForm from '@/components/general/project/ProjectIntakeForm.vue';
import { StepperHeader } from '@/components/form';
import { createProjectIntakeSchema } from '@/validators/general/projectIntakeFormSchema';
import { contactService } from '@/services';
import { BasicResponse, RouteName, StorageKey } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/projectCommon';
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

  // These don't need a mounted component at all
  // `createProjectIntakeSchema` is a pure function, so we test it directly
  describe('validation schema', () => {
    const validCases = [
      {
        category: 'basic',
        orgBookOptions: [{ registeredName: 'testString3', registeredId: 'FM0281610' }],
        data: {
          basic: {
            projectApplicantType: ProjectApplicant.BUSINESS,
            isDevelopedInBc: BasicResponse.NO,
            registeredId: 'FM0281610',
            registeredName: 'testString3',
            projectName: 'Project',
            projectDescription: 'Desc',
            projectNumber: 'PN-1'
          }
        }
      },
      {
        category: 'location',
        orgBookOptions: [],
        data: {
          location: {
            naturalDisaster: 'Yes',
            projectLocation: 'testString1',
            streetAddress: 'testString2',
            locality: 'testString3',
            province: 'testString4',
            latitude: '51',
            longitude: '-139',
            ltsaPIDLookup: '',
            geomarkUrl: ''
          }
        }
      },
      {
        category: 'permits',
        orgBookOptions: [],
        data: {
          permits: {
            appliedPermits: [{ permitTypeId: 1, submittedDate: new Date(), trackingId: 'testString' }],
            hasAppliedProvincialPermits: BasicResponse.YES
          }
        }
      }
    ] as const;

    const invalidCases = [
      {
        category: 'basic',
        data: {
          basic: {
            projectApplicantType: 'testString1',
            isDevelopedInBC: 'testString2',
            registeredName: 'testString3'
          }
        }
      },
      {
        category: 'location',
        data: {
          location: {
            projectLocation: '',
            streetAddress: 'testString2',
            locality: 'testString3',
            province: 'testString4',
            latitude: '12',
            longitude: '-139',
            ltsaPIDLookup: '',
            geomarkUrl: ''
          }
        }
      },
      {
        category: 'permits',
        data: {
          permits: {
            appliedPermits: [{ permitTypeId: '', submittedDate: new Date(), trackingId: 'testString' }],
            hasAppliedProvincialPermits: 123
          }
        }
      },
      // A category that's missing entirely should fail the same way as one
      // with invalid fields, for every category.
      { category: 'basic', data: {} },
      { category: 'location', data: {} },
      { category: 'permits', data: {} }
    ] as const;

    it.each(validCases)(
      '$category passes validation with well-formed data',
      async ({ category, orgBookOptions, data }) => {
        await expect(createProjectIntakeSchema([...orgBookOptions]).validateAt(category, data)).resolves.toBeTruthy();
      }
    );

    it.each(invalidCases)('$category rejects malformed or missing data', async ({ category, data }) => {
      await expect(createProjectIntakeSchema([]).validateAt(category, data)).rejects.toThrowError();
    });
  });
});
