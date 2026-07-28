import { flushPromises } from '@vue/test-utils';

import ProjectFormNavigator from '@/components/electrification/project/ProjectFormNavigator.vue';
import { atsService, electrificationProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes, BasicResponse } from '@/utils/enums/application';
import { ElectrificationProjectType } from '@/utils/enums/codeEnums';
import {
  ActivityContactRole,
  ApplicationStatus,
  ContactPreference,
  ProjectRelationship,
  SubmissionType
} from '@/utils/enums/projectCommon';
import { updateLiveNameKey } from '@/utils/keys';

import { mockAxiosResponse } from '../../../../helpers';
import { mountComponent } from '../../../../mountComponent';

import type { AtsClientResource, AtsEnquiryResource, ElectrificationProject } from '@/types';

// Mocks

const createAtsClientSpy = vi.spyOn(atsService, 'createAtsClient');
const createAtsEnquirySpy = vi.spyOn(atsService, 'createAtsEnquiry');
const patchProjectSpy = vi.spyOn(electrificationProjectService, 'patchProject');

// Fixtures

const currentDate = new Date().toISOString();

const exampleContact = {
  contactId: 'contact123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
};

const testProject: ElectrificationProject = {
  electrificationProjectId: 'proj123',
  projectId: 'proj123',
  activityId: 'activity123',
  submittedAt: currentDate,
  applicationStatus: ApplicationStatus.IN_PROGRESS,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Test Co',
  hasRelatedEnquiry: false,
  queuePriority: 1,
  // The navigator form's schema (unlike intake's) only allows a submission
  // type of GUIDANCE/INAPPLICABLE -- ASSISTANCE et al. are intake-only.
  submissionType: SubmissionType.GUIDANCE,
  projectName: 'Test Project',
  projectDescription: 'Description',
  multiPermitsNeeded: 'No',
  astNotes: 'Notes',
  atsClientId: null,
  atsEnquiryId: null,
  aaiUpdated: false,
  addedToAts: false,
  projectType: ElectrificationProjectType.IPP_SOLAR,
  projectCategory: null,
  bcHydroNumber: null,
  hasEpa: BasicResponse.NO,
  megawatts: 100,
  bcEnvironmentAssessNeeded: BasicResponse.NO,
  contacts: [exampleContact],
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
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

function mountProjectFormNavigator(options: { project?: ElectrificationProject; editable?: boolean } = {}) {
  const { project = testProject, editable = true } = options;

  const { wrapper } = mountComponent(ProjectFormNavigator, {
    props: { project, editable },
    piniaState: {
      project: { activityContacts: [primaryActivityContact] },
      code: {
        codes: {
          ElectrificationProjectType: [{ code: ElectrificationProjectType.IPP_SOLAR, display: 'Solar', active: true }]
        }
      }
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
      ElectrificationPanel: true,
      ProjectDescriptionPanel: true,
      LocationDescriptionPanel: true,
      AstNotesPanel: true,
      SubmissionStateSection: true,
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
 *
 * `companyNameRegistered` is only valid if it matches one of the org book
 * options `CompanyProjectNamePanel` would normally supply -- since that
 * panel is stubbed, this emits the same event it would, so the real
 * schema's validation passes.
 */
async function submitForm(wrapper: ReturnType<typeof mountProjectFormNavigator>['wrapper']) {
  await wrapper
    .findComponent({ name: 'CompanyProjectNamePanel' })
    .vm.$emit('org-book-options', [
      { registeredId: testProject.companyIdRegistered, registeredName: testProject.companyNameRegistered }
    ]);

  await wrapper.find('form').trigger('submit');

  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 50));
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ProjectFormNavigator', () => {
  describe('rendering', () => {
    it('renders the component with the provided props', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });

    it('populates the initial form values before any interaction', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      expect(wrapper.text()).toContain(testProject.companyNameRegistered);
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      patchProjectSpy.mockResolvedValue(testProject);
    });

    it('creates a client and enquiry when the CLIENT_ENQUIRY type is chosen', async () => {
      createAtsClientSpy.mockResolvedValue(mockAxiosResponse({ clientId: 111 } as AtsClientResource, 201));
      createAtsEnquirySpy.mockResolvedValue(mockAxiosResponse({ enquiryId: 222 } as AtsEnquiryResource, 201));

      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      await wrapper.findComponent({ name: 'ATSInfo' }).vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);
      await submitForm(wrapper);

      expect(createAtsClientSpy).toHaveBeenCalled();
      expect(createAtsEnquirySpy).toHaveBeenCalled();
      expect(patchProjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: testProject.projectId,
          atsClientId: 111,
          atsEnquiryId: 222,
          addedToAts: true
        })
      );
    });

    it('creates only an enquiry when the ENQUIRY type is chosen, leaving the existing client untouched', async () => {
      createAtsEnquirySpy.mockResolvedValue(mockAxiosResponse({ enquiryId: 222 } as AtsEnquiryResource, 201));

      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      await wrapper.findComponent({ name: 'ATSInfo' }).vm.$emit('ats-info:create', ATSCreateTypes.ENQUIRY);
      await submitForm(wrapper);

      expect(createAtsEnquirySpy).toHaveBeenCalled();
      expect(patchProjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: testProject.projectId,
          atsClientId: testProject.atsClientId,
          atsEnquiryId: 222,
          addedToAts: true
        })
      );
    });

    it('creates only a client when the CLIENT type is chosen, leaving the existing enquiry untouched', async () => {
      createAtsClientSpy.mockResolvedValue(mockAxiosResponse({ clientId: 111 } as AtsClientResource, 201));

      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      await wrapper.findComponent({ name: 'ATSInfo' }).vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);
      await submitForm(wrapper);

      expect(createAtsClientSpy).toHaveBeenCalled();
      expect(patchProjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: testProject.projectId,
          atsClientId: 111,
          atsEnquiryId: testProject.atsEnquiryId,
          // Only ENQUIRY-bearing paths flip `addedToAts` true when the
          // *other* id was already falsy -- the CLIENT-only path here never
          // had a truthy enquiry id to pair with, so it stays as it started.
          addedToAts: testProject.addedToAts
        })
      );
    });

    it('keeps addedToAts false when the CLIENT_ENQUIRY IDs fail to generate', async () => {
      createAtsClientSpy.mockResolvedValue(mockAxiosResponse({} as AtsClientResource));
      createAtsEnquirySpy.mockResolvedValue(mockAxiosResponse({} as AtsEnquiryResource));

      const { wrapper } = mountProjectFormNavigator({ project: { ...testProject, addedToAts: false } });
      await flushPromises();

      await wrapper.findComponent({ name: 'ATSInfo' }).vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);
      await submitForm(wrapper);

      expect(patchProjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: testProject.projectId, addedToAts: false })
      );
    });

    it('patches the project directly when no ATS type was chosen', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      await submitForm(wrapper);

      expect(createAtsClientSpy).not.toHaveBeenCalled();
      expect(createAtsEnquirySpy).not.toHaveBeenCalled();
      expect(patchProjectSpy).toHaveBeenCalled();
    });
  });

  describe('watchers', () => {
    it('updates ContactCardNavForm when the primary contact changes in the store', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      const store = useProjectStore();
      store.activityContacts = [
        {
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
