import { flushPromises } from '@vue/test-utils';

import ProjectFormNavigator from '@/components/housing/project/ProjectFormNavigator.vue';
import { atsService, housingProjectService, mapService, userService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes, BasicResponse, GroupName } from '@/utils/enums/application';
import {
  ActivityContactRole,
  ApplicationStatus,
  ContactPreference,
  ProjectApplicant,
  ProjectRelationship,
  SubmissionType
} from '@/utils/enums/projectCommon';
import { NumResidentialUnits } from '@/utils/enums/housing';
import { updateLiveNameKey } from '@/utils/keys';

import { mockAxiosResponse } from '../../../../helpers';
import { mountComponent } from '../../../../mountComponent';

import type { AtsClientResource, AtsEnquiryResource, Group, HousingProject, User } from '@/types';

// Mocks

const createAtsClientSpy = vi.spyOn(atsService, 'createAtsClient');
const createAtsEnquirySpy = vi.spyOn(atsService, 'createAtsEnquiry');
const getPidsSpy = vi.spyOn(mapService, 'getPids');
const listUsersSpy = vi.spyOn(userService, 'listUsers');
const patchProjectSpy = vi.spyOn(housingProjectService, 'patchProject');

// Fixtures

const currentDate = new Date().toISOString();

const exampleContact = {
  contactId: 'contact123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNmber: '123-456-7890'
};

const testProject: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'project789',
  projectId: 'project789',
  queuePriority: 1,
  submissionType: SubmissionType.GUIDANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  projectName: 'Project Alpha',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
  multiFamilyUnits: NumResidentialUnits.UNSURE,
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: NumResidentialUnits.UNSURE,
  hasRentalUnits: BasicResponse.YES,
  rentalUnits: NumResidentialUnits.ONE_TO_NINE,
  financiallySupportedBc: BasicResponse.YES,
  financiallySupportedIndigenous: BasicResponse.YES,
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: BasicResponse.YES,
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: BasicResponse.YES,
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPids: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: false,
  addedToAts: true,
  atsClientId: 654321,
  atsEnquiryId: 654321,
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  applicationStatus: ApplicationStatus.COMPLETED,
  projectApplicantType: ProjectApplicant.INDIVIDUAL,
  hasAppliedProvincialPermits: false,
  projectLocation: '',
  contacts: [exampleContact],
  user: {
    active: true,
    email: 'john.doe@example.com',
    firstName: 'John',
    fullName: 'John Doe',
    idp: 'idir',
    lastName: 'Doe',
    groups: [{ groupId: 1, name: GroupName.DEVELOPER } as Group],
    status: 'active',
    userId: 'user123',
    sub: 'sub-123',
    elevatedRights: true,
    bceidBusinessName: '',
    createdBy: 'testCreatedBy',
    createdAt: currentDate,
    updatedBy: 'testUpdatedAt',
    updatedAt: currentDate
  } as User,
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
    phoneNumber: '1234567890',
    contactApplicantRelationship: ProjectRelationship.CONSULTANT,
    contactPreference: ContactPreference.EITHER
  }
};

// Mount

function mountProjectFormNavigator(options: { project?: HousingProject; editable?: boolean } = {}) {
  const { project = testProject, editable = true } = options;

  const { wrapper } = mountComponent(ProjectFormNavigator, {
    props: { project, editable },
    piniaState: {
      project: { activityContacts: [primaryActivityContact] }
    },
    provide: { [updateLiveNameKey]: () => {} },
    stubs: {
      ATSInfo: true,
      ContactCardNavForm: true,
      CompanyProjectNamePanel: true,
      ResidentialUnitsPanel: true,
      FinanciallySupportedPanel: true,
      LocationPanel: true,
      LocationPidsPanel: true,
      LocationDescriptionPanel: true,
      ProjectDescriptionPanel: true,
      AstNotesPanel: true,
      SubmissionStateSection: true,
      RelatedEnquiriesSection: true,
      ProjectAreasUpdatedSection: true,
      FeedbackConsentSection: true,
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
  listUsersSpy.mockResolvedValue([{ fullName: 'dummyName' } as User]);
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

  describe('onBeforeMount', () => {
    it('searches for the assigned user', async () => {
      const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
      const { wrapper } = mountProjectFormNavigator({ project: mountProject });
      await flushPromises();

      expect(wrapper.isVisible()).toBe(true);
      expect(listUsersSpy).toHaveBeenCalledExactlyOnceWith({ userId: [mountProject.assignedUserId] });
    });

    it('gets the location PIDs for the project', async () => {
      const { wrapper } = mountProjectFormNavigator();
      await flushPromises();

      expect(wrapper.isVisible()).toBe(true);
      expect(getPidsSpy).toHaveBeenCalledExactlyOnceWith({ projectId: testProject.housingProjectId });
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
          addedToAts: true
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
          activityId: 'activity456',
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
