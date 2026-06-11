import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';

import ProjectFormNavigator from '@/components/electrification/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { atsService, electrificationProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes, BasicResponse } from '@/utils/enums/application';
import {
  ActivityContactRole,
  ApplicationStatus,
  ContactPreference,
  ProjectRelationship,
  SubmissionType
} from '@/utils/enums/projectCommon';
import { updateLiveNameKey } from '@/utils/keys';
import { mockAxiosResponse, VEE_FORM_STUB } from '../../../../helpers';

import type { VueWrapper } from '@vue/test-utils';
import type { DefineComponent, ComponentPublicInstance } from 'vue';
import type { AtsClientResource, AtsEnquiryResource, ElectrificationProject } from '@/types';

vi.mock('@/services', () => ({
  atsService: {
    createAtsClient: vi.fn(),
    createAtsEnquiry: vi.fn()
  },
  externalApiService: {
    searchOrgBook: vi.fn()
  },
  mapService: {
    getPIDs: vi.fn()
  },
  userService: {
    listUsers: vi.fn()
  },
  electrificationProjectService: {
    patchProject: vi.fn()
  }
}));

const exampleContact = {
  contactId: 'contact123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '123-456-7890'
};

const testProject: ElectrificationProject = {
  electrificationProjectId: 'proj123',
  projectId: 'proj123',
  activityId: 'activity123',
  submittedAt: new Date().toISOString(),
  applicationStatus: ApplicationStatus.IN_PROGRESS,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Test Co',
  hasRelatedEnquiry: false,
  queuePriority: 1,
  submissionType: SubmissionType.ASSISTANCE,
  projectName: 'Test Project',
  projectDescription: 'Description',
  multiPermitsNeeded: 'No',
  astNotes: 'Notes',
  atsClientId: null,
  atsEnquiryId: null,
  aaiUpdated: false,
  addedToAts: false,
  contacts: [exampleContact]
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

  electrification: {
    bcHydroNumber: null,
    projectType: '',
    hasEpa: BasicResponse.NO,
    megawatts: 1000,
    projectCategory: null,
    bcEnvironmentAssessNeeded: BasicResponse.NO
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
    aaiUpdated: false
  }
};

const wrapperSettings = () => ({
  props: { project: testProject },
  global: {
    plugins: [
      () => createTestingPinia({ initialState: { auth: { user: {} } } }),
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
      // Silences the Vue warning for undeclared emit/prop on-complete in test printout
      AutoComplete: {
        name: 'AutoComplete',
        props: ['disabled', 'name', 'suggestions'],
        template: '<div class="stub-autocomplete p-inputtext"></div>',
        emits: ['on-complete']
      },
      ContactCardNavForm: true,
      Form: VEE_FORM_STUB,
      FormNavigationGuard: true
    },
    provide: {
      [updateLiveNameKey]: () => {}
    }
  }
});

describe('ProjectForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with provided props', async () => {
    const wrapper = mount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
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
    vi.mocked(electrificationProjectService.patchProject).mockResolvedValue(testProject);
  });

  it('handles CLIENT_ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createAtsClient).mockResolvedValue(
      mockAxiosResponse({ clientId: 111 } as AtsClientResource, 201)
    );
    vi.mocked(atsService.createAtsEnquiry).mockResolvedValue(
      mockAxiosResponse({ enquiryId: 222 } as AtsEnquiryResource, 201)
    );

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );

    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createAtsClient).toHaveBeenCalled();
    expect(atsService.createAtsEnquiry).toHaveBeenCalled();
    expect(electrificationProjectService.patchProject).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: testProject.electrificationProjectId,
        atsClientId: 111,
        atsEnquiryId: 222,
        addedToAts: true
      })
    );
  });

  it('handles ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createAtsEnquiry).mockResolvedValue(
      mockAxiosResponse({ enquiryId: 222 } as AtsEnquiryResource, 201)
    );

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );

    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createAtsEnquiry).toHaveBeenCalled();
    expect(electrificationProjectService.patchProject).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: testProject.electrificationProjectId,
        atsClientId: 111,
        atsEnquiryId: 222,
        addedToAts: true
      })
    );
  });

  it('handles CLIENT creation path upon form submit', async () => {
    vi.mocked(atsService.createAtsClient).mockResolvedValue(
      mockAxiosResponse({ clientId: 111 } as AtsClientResource, 201)
    );

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createAtsClient).toHaveBeenCalled();
    expect(electrificationProjectService.patchProject).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: testProject.electrificationProjectId,
        atsClientId: 111,
        atsEnquiryId: 222,
        addedToAts: true
      })
    );
  });

  it('bypasses addedToAts in CLIENT_ENQUIRY path when IDs fail to generate', async () => {
    vi.mocked(atsService.createAtsClient).mockResolvedValue(mockAxiosResponse({} as AtsClientResource));
    vi.mocked(atsService.createAtsEnquiry).mockResolvedValue(mockAxiosResponse({} as AtsEnquiryResource));

    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
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

    expect(electrificationProjectService.patchProject).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: testProject.electrificationProjectId, addedToAts: false })
    );
  });

  it('does nothing and falls through to update if atsCreateType is undefined', async () => {
    const wrapper = shallowMount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', payload);
    await flushPromises();

    expect(atsService.createAtsClient).not.toHaveBeenCalled();
    expect(atsService.createAtsEnquiry).not.toHaveBeenCalled();
    expect(electrificationProjectService.patchProject).toHaveBeenCalled();
  });
});

describe('Watchers', () => {
  it('updates form values passed to ContactCardNavForm when primaryContact changes in store', async () => {
    const wrapper = mount(ProjectFormNavigator, wrapperSettings());
    await flushPromises();

    const store = useProjectStore();

    store.activityContacts = [
      {
        contactId: 'new-contact-999',
        activityId: 'activity123',
        role: ActivityContactRole.PRIMARY,
        contact: { ...exampleContact, contactId: 'new-contact-999', firstName: 'Jane' }
      }
    ];

    await nextTick();
    await flushPromises();

    const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
    const passedFormValues = contactCard.props('formValues');

    expect(passedFormValues.contact.contactId).toBe('new-contact-999');
    expect(passedFormValues.contact.firstName).toBe('Jane');
  });
});
