import { flushPromises } from '@vue/test-utils';

import ProjectFormNavigator from '@/components/general/project/ProjectFormNavigator.vue';
import { generalProjectService, mapService, userService } from '@/services';
import { useProjectStore } from '@/store';
import { BasicResponse, Initiative } from '@/utils/enums/application';
import {
  ActivityContactRole,
  Area,
  ApplicationStatus,
  ContactPreference,
  ProjectApplicant,
  ProjectRelationship,
  Region,
  SubmissionType
} from '@/utils/enums/projectCommon';
import { updateLiveNameKey } from '@/utils/keys';

import { t } from '../../../../helpers';
import { mountComponent } from '../../../../mountComponent';
import { testAuditFields, testContactDefaults } from '../../../../fixtures';

import type { DeepPartial, GeneralProject, User } from '@/types';
import type { FormSchemaType } from '@/validators/general/projectFormNavigatorSchema';

// Mocks

const mockConfirmRequire = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useConfirm: () => ({ require: mockConfirmRequire })
}));

const getPidsSpy = vi.spyOn(mapService, 'getPids');
const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
const patchProjectSpy = vi.spyOn(generalProjectService, 'patchProject');

// Fixtures

const currentDate = new Date().toISOString();

const exampleContact = {
  ...testContactDefaults,
  contactId: 'contact123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
};

const testProject: GeneralProject = {
  generalProjectId: 'proj123',
  projectId: 'proj123',
  activityId: 'activity123',
  submittedAt: currentDate,
  applicationStatus: ApplicationStatus.IN_PROGRESS,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Test Co',
  queuePriority: 1,
  // The navigator form's schema (unlike intake's) only allows a submission
  // type of GUIDANCE/INAPPLICABLE -- ASSISTANCE et al. are intake-only.
  submissionType: SubmissionType.GUIDANCE,
  projectName: 'Test Project',
  projectDescription: 'Description',
  astNotes: 'Notes',
  atsClientId: null,
  atsEnquiryId: null,
  aaiUpdated: false,
  projectApplicantType: ProjectApplicant.INDIVIDUAL,
  projectLocation: 'Test Location',
  activityType: 'Other',
  region: Region.CARIBOO,
  area: Area.COAST,
  naturalDisaster: false,
  hasAppliedProvincialPermits: BasicResponse.NO,
  assignedUserId: null,
  locationPids: null,
  streetAddress: null,
  relatedPermits: null,
  projectNumber: null,
  projectLocationDescription: null,
  locality: null,
  province: null,
  checkProvincialPermits: null,
  geomarkUrl: null,
  businessArea: null,
  latitude: null,
  longitude: null,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate,
  deletedBy: null,
  deletedAt: null
};

// A primary activity contact backing `getPrimaryActivityContact`, so the
// form's initial `contact` section is populated with valid data (rather
// than all-`undefined`) and the real vee-validate schema can validate it.
const primaryActivityContact = {
  contactId: exampleContact.contactId,
  activityId: testProject.activityId,
  role: ActivityContactRole.PRIMARY,
  contact: {
    ...exampleContact,
    contactApplicantRelationship: ProjectRelationship.CONSULTANT,
    contactPreference: ContactPreference.EITHER
  }
};

// Mount

function mountProjectFormNavigator(options: { project?: GeneralProject; editable?: boolean } = {}) {
  const { project = testProject, editable = true } = options;

  const { wrapper } = mountComponent(ProjectFormNavigator, {
    props: { project, editable },
    piniaState: {
      app: { initiative: Initiative.GENERAL },
      project: { project, activityContacts: [primaryActivityContact] }
    },
    provide: { [updateLiveNameKey]: () => {} },
    stubs: {
      // The real vee-validate `<Form>` is left un-stubbed -- only its
      // children are. Each of these panels/sections owns its own slice of
      // the form (and often its own store/service dependencies), which is
      // more than this spec needs in order to exercise `ProjectFormNavigator`
      // itself; stubbing them keeps the Form's real validation/submit
      // behavior intact while avoiding having to fully wire up every panel.
      ATSInfo: true,
      ContactCardNavForm: true,
      CompanyProjectNamePanel: true,
      LocationPanel: true,
      LocationPidsPanel: true,
      LocationDescriptionPanel: true,
      ProjectDescriptionPanel: true,
      AstNotesPanel: true,
      SubmissionStateSection: true,
      RelatedEnquiriesSection: true,
      ProjectAreasUpdatedSection: true,
      FormNavigationGuard: true,
      CancelButton: true
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
async function submitForm(wrapper: ReturnType<typeof mountProjectFormNavigator>['wrapper']) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 50));
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
  searchUsersSpy.mockResolvedValue([{ fullName: 'dummyName' } as User]);
  getPidsSpy.mockResolvedValue('123456789');
});

// Tests

describe('ProjectFormNavigator', () => {
  describe('rendering', () => {
    it('renders the component with the provided props', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('onMounted', () => {
    it('searches for the assigned user', async () => {
      const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
      const { wrapper } = mountProjectFormNavigator({ project: mountProject });
      await flushPromises();

      expect(wrapper.isVisible()).toBe(true);
      expect(searchUsersSpy).toHaveBeenCalledExactlyOnceWith({ userId: [mountProject.assignedUserId] });
    });

    it('gets the location PIDs for the project', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      expect(wrapper.isVisible()).toBe(true);
      expect(getPidsSpy).toHaveBeenCalledExactlyOnceWith({ projectId: testProject.generalProjectId });
    });

    it('seeds decimals as numbers and drops missing codes', async () => {
      const { wrapper } = mountProjectFormNavigator({
        project: { ...testProject, latitude: '49.5', longitude: '-123.25', region: null, area: null }
      });
      await flushPromises();

      const values = (
        wrapper.vm as unknown as { formRef: { getValues: () => DeepPartial<FormSchemaType> } }
      ).formRef.getValues();
      expect(values.location).toMatchObject({ latitude: 49.5, longitude: -123.25 });
      expect(values.submissionState).toMatchObject({ region: undefined, area: undefined });
    });
  });

  describe('form submission', () => {
    it('patches the project directly on submit', async () => {
      patchProjectSpy.mockResolvedValue(testProject);

      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      await submitForm(wrapper);

      expect(patchProjectSpy).toHaveBeenCalledWith(expect.objectContaining({ projectId: testProject.projectId }));
    });
  });

  describe('reopen', () => {
    const completedProject = { ...testProject, applicationStatus: ApplicationStatus.COMPLETED };

    async function reopen(project: GeneralProject) {
      const { wrapper } = mountProjectFormNavigator({ project });
      await flushPromises();

      const reopenButton = wrapper
        .findAll('button')
        .find((b) => b.text() === t('i.housing.project.projectForm.reopenSubmission'));
      await reopenButton?.trigger('click');
      await mockConfirmRequire.mock.calls[0]?.[0].accept();
      await flushPromises();
    }

    it('validates and saves the project as in progress', async () => {
      patchProjectSpy.mockResolvedValue(testProject);

      await reopen(completedProject);

      expect(patchProjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: testProject.projectId, applicationStatus: ApplicationStatus.IN_PROGRESS })
      );
    });

    it('does not save when the form is invalid', async () => {
      await reopen({ ...completedProject, projectName: '' });

      expect(patchProjectSpy).not.toHaveBeenCalled();
    });
  });

  describe('watchers', () => {
    it('updates ContactCardNavForm when the primary contact changes in the store', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      const store = useProjectStore();
      store.activityContacts = [
        {
          ...testAuditFields,
          contactId: 'new-contact-999',
          activityId: testProject.activityId,
          role: ActivityContactRole.PRIMARY,
          contact: { ...exampleContact, contactId: 'new-contact-999', firstName: 'Jane' }
        }
      ];
      await flushPromises();

      const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
      const passedFormValues = contactCard.props('formValues');

      expect(passedFormValues.contact.contactId).toBe('new-contact-999');
      expect(passedFormValues.contact.firstName).toBe('Jane');
    });
  });
});
