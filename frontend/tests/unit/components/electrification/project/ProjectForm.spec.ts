import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { atsService, externalApiService, electrificationProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { mockAxiosResponse, VEE_FORM_STUB } from '../../../../helpers';

import type { AxiosResponse } from 'axios';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { DefineComponent, ComponentPublicInstance } from 'vue';
import type { ElectrificationProject } from '@/types';
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
  electrificationProjectService: {
    updateProject: vi.fn()
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
  project: {},
  submissionState: {},
  contact: exampleContact,
  atsClientId: null,
  atsEnquiryId: null,
  addedToAts: false
};

const wrapperSettings = (editable = true) => ({
  props: { editable, project: testProject },
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
    }
  }
});

describe('ProjectForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with provided props', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });
});

describe('onRegisteredNameInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call searchOrgBook once when query length is less than 2', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const event: AutoCompleteCompleteEvent = { query: 'A', originalEvent: new Event('input') };
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await flushPromises();

    expect(externalApiService.searchOrgBook).toHaveBeenCalledOnce();
  });

  it('should call searchOrgBook twice when query length is 2 or more', async () => {
    vi.mocked(externalApiService.searchOrgBook).mockResolvedValue({
      data: {
        results: [
          { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
          { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
        ]
      }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const event: AutoCompleteCompleteEvent = { query: 'Test', originalEvent: new Event('input') };
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await flushPromises();

    expect(externalApiService.searchOrgBook).toHaveBeenCalledTimes(2);
    expect(externalApiService.searchOrgBook).toHaveBeenCalledWith('Test');
  });

  it('should filter results by type "name" and map to suggestions prop', async () => {
    vi.mocked(externalApiService.searchOrgBook).mockResolvedValue({
      data: {
        results: [
          { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
          { type: 'entity', value: 'Other Type', topic_source_id: 'FM0009999' },
          { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
        ]
      }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const event: AutoCompleteCompleteEvent = { query: 'Test', originalEvent: new Event('input') };
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await flushPromises();

    const suggestions = autoComplete.props('suggestions');
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]).toEqual({ registeredName: 'Test Company Ltd', registeredId: 'FM0001234' });
    expect(suggestions[1]).toEqual({ registeredName: 'Test Corp', registeredId: 'FM0005678' });
  });

  it('should handle empty results from searchOrgBook via prop check', async () => {
    vi.mocked(externalApiService.searchOrgBook).mockResolvedValue({ data: { results: [] } } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const event: AutoCompleteCompleteEvent = { query: 'NonExistent', originalEvent: new Event('input') };
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await flushPromises();

    expect(autoComplete.props('suggestions')).toHaveLength(0);
  });
});

describe('Form Submission & ATS Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(electrificationProjectService.updateProject).mockResolvedValue(mockAxiosResponse(testProject));
  });

  it('handles CLIENT_ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue({ status: 201, data: { clientId: 111 } } as AxiosResponse);
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue({
      status: 201,
      data: { enquiryId: 222 }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues });
    await flushPromises();

    expect(atsService.createATSClient).toHaveBeenCalled();
    expect(atsService.createATSEnquiry).toHaveBeenCalled();
    expect(electrificationProjectService.updateProject).toHaveBeenCalledWith(
      testProject.electrificationProjectId,
      expect.objectContaining({
        project: expect.objectContaining({ atsClientId: 111, atsEnquiryId: 222, addedToAts: true })
      })
    );
  });

  it('handles ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue({
      status: 201,
      data: { enquiryId: 333 }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, atsClientId: 111 });
    await flushPromises();

    expect(atsService.createATSEnquiry).toHaveBeenCalled();
    expect(electrificationProjectService.updateProject).toHaveBeenCalledWith(
      testProject.electrificationProjectId,
      expect.objectContaining({
        project: expect.objectContaining({ atsClientId: 111, atsEnquiryId: 333, addedToAts: true })
      })
    );
  });

  it('handles CLIENT creation path upon form submit', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue({ status: 201, data: { clientId: 444 } } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, atsEnquiryId: 555 });
    await flushPromises();

    expect(atsService.createATSClient).toHaveBeenCalled();
    expect(electrificationProjectService.updateProject).toHaveBeenCalledWith(
      testProject.electrificationProjectId,
      expect.objectContaining({
        project: expect.objectContaining({ atsClientId: 444, atsEnquiryId: 555, addedToAts: true })
      })
    );
  });

  it('bypasses addedToAts in CLIENT_ENQUIRY path when IDs fail to generate', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue(mockAxiosResponse({}));
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue(mockAxiosResponse({}));

    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, addedToAts: false });
    await flushPromises();

    expect(electrificationProjectService.updateProject).toHaveBeenCalledWith(
      testProject.electrificationProjectId,
      expect.objectContaining({
        project: expect.objectContaining({ addedToAts: false })
      })
    );
  });

  it('does nothing and falls through to update if atsCreateType is undefined', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, addedToAts: false });
    await flushPromises();

    expect(atsService.createATSClient).not.toHaveBeenCalled();
    expect(atsService.createATSEnquiry).not.toHaveBeenCalled();
    expect(electrificationProjectService.updateProject).toHaveBeenCalled();
  });
});

describe('Watchers', () => {
  it('updates form values passed to ContactCardNavForm when primaryContact changes in store', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
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
