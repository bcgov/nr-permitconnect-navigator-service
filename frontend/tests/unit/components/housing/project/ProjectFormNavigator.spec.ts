import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { flushPromises, shallowMount } from '@vue/test-utils';

import ProjectFormNavigator from '@/components/housing/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { atsService, mapService, userService, housingProjectService } from '@/services';
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
import { mockAxiosResponse, VEE_FORM_STUB } from '../../../../helpers';

import type { DefineComponent, ComponentPublicInstance } from 'vue';
import type { HousingProject, IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute, Group } from '@/types';
import type { VueWrapper } from '@vue/test-utils';

vi.mock('@/services', () => ({
  atsService: {
    createATSClient: vi.fn(),
    createATSEnquiry: vi.fn()
  },
  externalApiService: {
    searchOrgBook: vi.fn()
  },
  mapService: {
    getPIDs: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  },
  housingProjectService: {
    updateProject: vi.fn()
  }
}));

const currentDate = new Date().toISOString();

const exampleIDIRAttribute: IDIRAttribute = {
  idirUsername: 'idirUser',
  idirUserGuid: 'idir-guid-123'
};

const exampleBasicBCeIDAttribute: BasicBCeIDAttribute = {
  bceidUsername: 'bceidUser',
  bceidUserGuid: 'bceid-guid-123'
};

const exampleBusinessBCeIDAttribute: BusinessBCeIDAttribute = {
  bceidBusinessGuid: 'business-guid-123',
  bceidBusinessName: 'Example Business',
  ...exampleBasicBCeIDAttribute
};

const testUser = {
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
  idirAttributes: exampleIDIRAttribute,
  bceidAttributes: exampleBasicBCeIDAttribute,
  businessBceidAttribute: exampleBusinessBCeIDAttribute,
  bceidBusinessName: '',
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

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
  submissionType: SubmissionType.ASSISTANCE,
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
  rentalUnits: '15',
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
  user: testUser,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const mockSubmitValues = {
  contact: {
    contactId: exampleContact.contactId,
    firstName: exampleContact.firstName,
    lastName: exampleContact.lastName,
    phoneNumber: '1234567890',
    email: exampleContact.email,
    contactApplicantRelationship: ProjectRelationship.CONSULTANT,
    contactPreference: ContactPreference.EITHER
  },

  companyProjectName: {
    companyIdRegistered: null,
    companyNameRegistered: null,
    projectName: 'Test'
  },

  location: {
    locationAddress: null,
    streetAddress: null,
    locality: null,
    province: null,
    locationPids: null,
    latitude: null,
    longitude: null,
    geomarkUrl: null,
    naturalDisaster: BasicResponse.NO
  },
  finance: {
    financiallySupportedBc: BasicResponse.NO,
    financiallySupportedIndigenous: BasicResponse.NO,
    indigenousDescription: null,
    financiallySupportedNonProfit: BasicResponse.NO,
    nonProfitDescription: null,
    financiallySupportedHousingCoop: BasicResponse.NO,
    housingCoopDescription: null
  },
  units: {
    singleFamilyUnits: null,
    multiFamilyUnits: null,
    otherUnitsDescription: null,
    otherUnits: null,
    hasRentalUnits: BasicResponse.NO,
    rentalUnits: null
  },

  projectDescription: { description: 'Test' },

  submissionState: {
    applicationStatus: '',
    submissionType: '',
    queuePriority: 3
  },
  atsInfo: {
    atsClientId: null,
    atsEnquiryId: null
  },
  projectAreasUpdated: {
    addedToAts: false,
    aaiUpdated: false,
    ltsaUpdated: false
  },
  consent: {
    consentToFeedback: false
  }
};

const wrapperSettings = (testProjectProp = testProject, editableProp = true) => ({
  props: {
    project: testProjectProp,
    editable: editableProp
  },
  global: {
    plugins: [
      () =>
        createTestingPinia({
          initialState: {
            auth: {
              user: {}
            }
          }
        }),
      PrimeVue,
      ConfirmationService,
      i18n,
      ToastService
    ],
    directives: {
      // Silences vue waring for failed to resolve directive tooltip
      tooltip: () => {}
    },
    stubs: {
      'font-awesome-icon': true,
      'router-link': true,
      ATSInfo: true,
      ContactCardNavForm: true,
      // Silences the Vue warning for undeclared emit/prop on-complete in test printout
      AutoComplete: {
        name: 'AutoComplete',
        props: ['disabled', 'name', 'suggestions'],
        template: '<div class="stub-autocomplete p-inputtext"></div>'
      },
      Form: VEE_FORM_STUB
    },
    provide: {
      [updateLiveNameKey]: () => {}
    }
  }
});

describe('ProjectForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.searchUsers).mockResolvedValue(mockAxiosResponse([{ fullName: 'dummyName' }]));
    vi.mocked(mapService.getPIDs).mockResolvedValue(mockAxiosResponse({ pids: ['123456789'] }));
  });

  it('renders the component with the provided props', async () => {
    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await nextTick();

    expect(wrapper).toBeTruthy();
  });

  it('searches for users onMount', async () => {
    const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings(mountProject));
    await flushPromises();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(userService.searchUsers).toHaveBeenCalledTimes(1);
    expect(userService.searchUsers).toHaveBeenCalledWith({ userId: [mountProject.assignedUserId] });
  });

  it('gets PIDs onMount', async () => {
    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(mapService.getPIDs).toHaveBeenCalledTimes(1);
    expect(mapService.getPIDs).toHaveBeenCalledWith(testProject.housingProjectId);
  });
});

describe('Form Submission & ATS Integration', () => {
  const payload = {
    ...mockSubmitValues,
    atsInfo: {
      atsClientId: 111,
      atsEnquiryId: 222
    },
    projectAreasUpdated: {
      addedToAts: true,
      aaiUpdated: false,
      ltsaUpdated: false
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(housingProjectService.updateProject).mockResolvedValue(mockAxiosResponse(testProject));
    vi.mocked(mapService.getPIDs).mockResolvedValue(mockAxiosResponse({ pids: ['123456789'] }));
  });

  it('handles CLIENT_ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue(mockAxiosResponse({ clientId: 111 }, 201));
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue(mockAxiosResponse({ enquiryId: 222 }, 201));

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );

    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createATSClient).toHaveBeenCalled();
    expect(atsService.createATSEnquiry).toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ atsClientId: 111, atsEnquiryId: 222, addedToAts: true })
    );
  });

  it('handles ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue(mockAxiosResponse({ enquiryId: 222 }, 201));

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );

    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createATSEnquiry).toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ atsClientId: 111, atsEnquiryId: 222, addedToAts: true })
    );
  });

  it('handles CLIENT creation path upon form submit', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue(mockAxiosResponse({ clientId: 111 }, 201));

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createATSClient).toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ atsClientId: 111, atsEnquiryId: 222, addedToAts: true })
    );
  });

  it('bypasses addedToAts in CLIENT_ENQUIRY path when IDs fail to generate', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue(mockAxiosResponse({}));
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue(mockAxiosResponse({}));

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );

    const noAtsPayload = payload;
    noAtsPayload.projectAreasUpdated.addedToAts = false;

    form.vm.$emit('submit', noAtsPayload);
    await flushPromises();

    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ addedToAts: false })
    );
  });

  it('does nothing and falls through to update if atsCreateType is undefined', async () => {
    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings(testProject));
    await flushPromises();

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createATSClient).not.toHaveBeenCalled();
    expect(atsService.createATSEnquiry).not.toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalled();
  });
});

describe('Watchers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapService.getPIDs).mockResolvedValue(mockAxiosResponse({ pids: ['123456789'] }));
  });

  it('updates form values passed to ContactCardNavForm when primaryContact changes in store', async () => {
    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();
    await nextTick();

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
    await nextTick();

    const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
    const passedFormValues = contactCard.props('formValues');

    expect(passedFormValues.contact.contactId).toBe('new-contact-999');
    expect(passedFormValues.contact.firstName).toBe('Jane');
  });
});
