import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { atsService, externalApiService, userService, electrificationProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { FORM_STUBS, mockAxiosError, mockAxiosResponse, t, VEE_FORM_STUB } from '../../../../helpers';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { DefineComponent, ComponentPublicInstance } from 'vue';
import type { ElectrificationProject } from '@/types';
import type { VueWrapper } from '@vue/test-utils';

const mockRequire = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastWarn = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockRequire }),
    useToast: () => ({ success: mockToastSuccess, error: mockToastError, warn: mockToastWarn })
  };
});

vi.mock('@/services', () => ({
  atsService: {
    createATSClient: vi.fn(),
    createATSEnquiry: vi.fn()
  },
  externalApiService: {
    searchOrgBook: vi.fn()
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
  project: {
    projectName: 'New Name',
    companyIdRegistered: 'C1'
  },
  submissionState: {
    queuePriority: 2,
    submissionType: SubmissionType.GUIDANCE,
    applicationStatus: ApplicationStatus.IN_PROGRESS,
    assignedUser: { userId: 'u1' }
  },
  projectDescription: 'New desc',
  locationDescription: 'New loc',
  astNotes: 'New ast',
  contact: exampleContact,
  atsClientId: 111,
  atsEnquiryId: 222,
  aaiUpdated: true,
  addedToAts: true
};

const wrapperSettings = (projectOverride = testProject, editable = true) => ({
  props: { editable, project: projectOverride },
  global: {
    plugins: [
      () => createTestingPinia({ initialState: { auth: { user: {} } } }),
      PrimeVue,
      ConfirmationService,
      i18n,
      ToastService
    ],
    directives: {
      tooltip: () => {}
    },
    stubs: {
      ATSInfo: true,
      ContactCardNavForm: true,
      Form: VEE_FORM_STUB,
      FormNavigationGuard: true,
      Message: { template: '<div class="stub-message"><slot /></div>' },
      'font-awesome-icon': true,
      'router-link': true,
      ...FORM_STUBS
    }
  }
});

describe('ProjectFormNavigator.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Lifecycle & Initial Load', () => {
    it('renders the form with provided props', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();
      expect(wrapper.exists()).toBe(true);
    });

    it('searches users on mount if assignedUserId exists', async () => {
      vi.mocked(userService.searchUsers).mockResolvedValue(mockAxiosResponse([{ fullName: 'Test User' }]));
      const project = { ...testProject, assignedUserId: 'u1' };

      mount(ProjectForm, wrapperSettings(project));
      await flushPromises();

      expect(userService.searchUsers).toHaveBeenCalledWith({ userId: ['u1'] });
    });

    it('searches OrgBook on mount if companyNameRegistered exists', async () => {
      const project = { ...testProject, companyNameRegistered: 'Existing Co' };

      mount(ProjectForm, wrapperSettings(project));
      await flushPromises();

      expect(externalApiService.searchOrgBook).toHaveBeenCalledWith('Existing Co');
    });
  });

  describe('DOM Interactions & Emits', () => {
    it('emits inputProjectName when project name changes', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const input = wrapper.findComponent({ name: 'InputText' });
      await input.vm.$emit('onInput', { target: { value: 'Updated Project' } });

      expect(wrapper.emitted('inputProjectName')).toBeTruthy();
      expect(wrapper.emitted('inputProjectName')?.[0]).toEqual(['Updated Project']);
    });

    it('handles cancel button click: shows message, scrolls, and auto-hides', async () => {
      vi.useFakeTimers();

      const mockScroll = vi.fn();
      vi.spyOn(document, 'getElementById').mockReturnValue({
        scrollIntoView: mockScroll
      } as unknown as HTMLElement);

      const activeProject = { ...testProject, applicationStatus: ApplicationStatus.IN_PROGRESS };
      const wrapper = mount(ProjectForm, wrapperSettings(activeProject));
      await flushPromises();

      const cancelBtn = wrapper.findComponent({ name: 'CancelButton' });
      await cancelBtn.vm.$emit('clicked');

      await nextTick();

      const message = wrapper.find('.stub-message');
      expect(message.exists()).toBe(true);
      expect(message.text()).toContain(t('i.common.form.cancelMessage'));

      vi.advanceTimersByTime(150);
      expect(mockScroll).toHaveBeenCalled();

      vi.advanceTimersByTime(5000);
      expect(wrapper.find('.stub-message').exists()).toBe(true);

      vi.advanceTimersByTime(1000);
      await nextTick();
      expect(wrapper.find('.stub-message').exists()).toBe(false);

      vi.useRealTimers();
    });

    it('handles reopen submission confirm flow', async () => {
      const project = { ...testProject, applicationStatus: ApplicationStatus.COMPLETED };
      const wrapper = mount(ProjectForm, wrapperSettings(project));
      await flushPromises();

      const reopenBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.props('label') === 'Re-open submission');
      await reopenBtn?.vm.$emit('click');

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();
      await flushPromises();

      expect(electrificationProjectService.updateProject).toHaveBeenCalled();
    });

    it('handles invalid submit by showing a warning toast', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
        '.vee-form-stub'
      );
      form.vm.$emit('invalid-submit', { errors: { 'contact.firstName': 'required' } });

      expect(mockToastWarn).toHaveBeenCalled();
    });

    it('covers reopen submission without form values (fall-through)', async () => {
      const project = { ...testProject, applicationStatus: ApplicationStatus.COMPLETED };
      const wrapper = mount(ProjectForm, wrapperSettings(project));
      await flushPromises();

      const reopenBtn = wrapper
        .findAllComponents({ name: 'Button' })
        .find((b) => b.props('label') === 'Re-open submission');
      await reopenBtn?.vm.$emit('click');

      const confirmArgs = mockRequire.mock.calls[0]?.[0];

      wrapper.unmount();

      await confirmArgs.accept();
      await flushPromises();

      expect(electrificationProjectService.updateProject).not.toHaveBeenCalled();
    });
  });

  describe('onRegisteredNameInput & AutoComplete', () => {
    it('should call searchOrgBook once when query length is less than 2', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const event: AutoCompleteCompleteEvent = { query: 'A', originalEvent: new Event('input') };
      const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
      await autoComplete.vm.$emit('onComplete', event);
      await flushPromises();

      expect(externalApiService.searchOrgBook).toHaveBeenCalledOnce();
    });

    it('should search and map results on AutoComplete complete', async () => {
      vi.mocked(externalApiService.searchOrgBook).mockResolvedValue(
        mockAxiosResponse({
          results: [
            { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
            { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
          ]
        })
      );

      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const event: AutoCompleteCompleteEvent = { query: 'Test', originalEvent: new Event('input') };
      const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
      await autoComplete.vm.$emit('onComplete', event);
      await flushPromises();

      const suggestions = autoComplete.props('suggestions');
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({ registeredName: 'Test Company Ltd', registeredId: 'FM0001234' });
    });

    it('should set field values on AutoComplete select', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
      await autoComplete.vm.$emit('onSelect', { registeredName: 'Selected Corp', registeredId: 'ID123' });
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      expect(form.props('initialValues')).toBeDefined();
    });
  });

  describe('Form Submission & Mapping', () => {
    beforeEach(() => {
      vi.mocked(electrificationProjectService.updateProject).mockResolvedValue(mockAxiosResponse(testProject));
    });

    it('maps payload correctly, omitting excluded fields, and toasts success', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
        '.vee-form-stub'
      );
      form.vm.$emit('submit', { ...mockSubmitValues });
      await flushPromises();

      expect(electrificationProjectService.updateProject).toHaveBeenCalledWith(
        testProject.electrificationProjectId,
        expect.objectContaining({
          project: {
            projectName: mockSubmitValues.project.projectName,
            companyIdRegistered: mockSubmitValues.project.companyIdRegistered,
            queuePriority: mockSubmitValues.submissionState.queuePriority,
            submissionType: mockSubmitValues.submissionState.submissionType,
            assignedUserId: mockSubmitValues.submissionState.assignedUser.userId,
            atsClientId: mockSubmitValues.atsClientId,
            atsEnquiryId: mockSubmitValues.atsEnquiryId,
            electrificationProjectId: testProject.projectId,
            locationDescription: mockSubmitValues.locationDescription,
            projectDescription: mockSubmitValues.projectDescription,
            astNotes: mockSubmitValues.astNotes,
            aaiUpdated: mockSubmitValues.aaiUpdated,
            activityId: testProject.activityId,
            addedToAts: mockSubmitValues.addedToAts,
            applicationStatus: mockSubmitValues.submissionState.applicationStatus
          }
        })
      );

      const updateCallArgs = vi.mocked(electrificationProjectService.updateProject).mock.calls[0]?.[1];
      expect(updateCallArgs).not.toHaveProperty('contact');
      expect(updateCallArgs).not.toHaveProperty('submissionState');
      expect(updateCallArgs).not.toHaveProperty('assignedUser');

      expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('handles submission errors with toast.error', async () => {
      vi.mocked(electrificationProjectService.updateProject).mockRejectedValue(mockAxiosError('Update failed'));

      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
        '.vee-form-stub'
      );
      form.vm.$emit('submit', { ...mockSubmitValues });
      await flushPromises();

      expect(mockToastError).toHaveBeenCalled();
    });
  });

  describe('Template Bindings & Edge Cases', () => {
    it('covers Assignee and OrgBook Option Labels', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const assigneeSelect = wrapper
        .findAllComponents({ name: 'EditableSelect' })
        .find((c) => c.props('name') === 'submissionState.assignedUser');
      expect(assigneeSelect?.props('getOptionLabel')({ fullName: 'Test User' })).toBe('Test User');

      const orgBookAuto = wrapper.findComponent({
        name: 'AutoComplete',
        props: { name: 'project.companyNameRegistered' }
      });
      expect(orgBookAuto.props('getOptionLabel')({ registeredName: 'Test Org' })).toBe('Test Org');
    });

    it('covers ats-info explicit emits in template', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
      const form = wrapper.findComponent({ name: 'VeeFormStub' });

      await atsInfo.vm.$emit('ats-info:set-client-id', 999);
      await atsInfo.vm.$emit('ats-info:set-added-to-ats', true);

      await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);
      await form.vm.$emit('submit', { ...mockSubmitValues, atsClientId: 999, addedToAts: true });
      await flushPromises();
      expect(atsService.createATSClient).toHaveBeenCalled();

      await atsInfo.vm.$emit('ats-info:create-enquiry');
      await form.vm.$emit('submit', { ...mockSubmitValues, atsClientId: 999, addedToAts: true });
      await flushPromises();
      expect(atsService.createATSEnquiry).toHaveBeenCalled();
    });

    it('handles string throw on submit (non-Error branch)', async () => {
      vi.mocked(electrificationProjectService.updateProject).mockRejectedValue('String error');
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      await form.vm.$emit('submit', mockSubmitValues);
      await flushPromises();

      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('mounts without companyNameRegistered to skip orgbook search', async () => {
      const project = { ...testProject, companyNameRegistered: '' };
      mount(ProjectForm, wrapperSettings(project));
      await flushPromises();

      expect(externalApiService.searchOrgBook).not.toHaveBeenCalled();
    });

    it('covers invalid-submit emit on form and fires warning toast', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const form = wrapper.findComponent({ name: 'VeeFormStub' });
      await form.vm.$emit('invalid-submit', { errors: { 'contact.firstName': 'required' } });

      expect(mockToastWarn).toHaveBeenCalled();
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

    it('ignores watcher update if contactId is identical', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();

      const store = useProjectStore();
      const initialContact = { ...exampleContact, contactId: 'contact123', firstName: 'Jane' };
      const identicalIdContact = { ...exampleContact, contactId: 'contact123', firstName: 'Bob' };

      store.activityContacts = [
        {
          contactId: 'contact123',
          activityId: 'activity123',
          role: ActivityContactRole.PRIMARY,
          contact: initialContact
        }
      ];
      await nextTick();

      store.activityContacts = [
        {
          contactId: 'contact123',
          activityId: 'activity123',
          role: ActivityContactRole.PRIMARY,
          contact: identicalIdContact
        }
      ];
      await nextTick();

      const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
      expect(contactCard.props('formValues').contact.firstName).not.toBe('Bob');
    });
  });
});
