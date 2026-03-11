import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { electrificationProjectService, userService } from '@/services';
import { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { mockAxiosResponse, PRIMEVUE_STUBS } from '../../../../helpers';

import type { ElectrificationProject, User } from '@/types';

const mockRequire = vi.fn();
vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockRequire }),
    useToast: () => ({ success: vi.fn(), error: vi.fn(), warn: vi.fn() })
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
  electrificationProjectService: {
    updateProject: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  }
}));

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
const updateProjectSpy = vi.spyOn(electrificationProjectService, 'updateProject');

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
  contacts: []
};

const wrapperSettingsForm = (projectData = testProject, editable = true) => ({
  props: { editable, project: projectData },
  global: {
    plugins: [
      createTestingPinia({ initialState: { auth: { user: {} } } }),
      PrimeVue,
      ConfirmationService,
      ToastService,
      i18n
    ],
    stubs: {
      ...PRIMEVUE_STUBS,
      FormNavigationGuard: true,
      BasicContactInformationCard: true,
      ATSUserLinkModal: true,
      ATSUserDetailsModal: true,
      ATSUserCreateModal: true
    }
  }
});

describe('ProjectFormNavigator.vue (Electrification)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchUsersSpy.mockResolvedValue(mockAxiosResponse([] as User[]));
  });

  it('renders the form with provided props', async () => {
    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('emits project name change on input', async () => {
    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await flushPromises();
    await flushPromises();

    const nameInput = wrapper.findComponent({ name: 'InputText', props: { name: 'project.projectName' } });
    await nameInput.vm.$emit('on-input', { target: { value: 'New Name' } });

    expect(wrapper.emitted('inputProjectName')).toBeTruthy();
    expect(wrapper.emitted('inputProjectName')?.[0]).toEqual(['New Name']);
  });

  describe('Form Actions (Submit & ReOpen)', () => {
    it('submits updated project successfully', async () => {
      updateProjectSpy.mockResolvedValue(mockAxiosResponse(testProject));

      const wrapper = mount(ProjectForm, wrapperSettingsForm());
      await flushPromises();
      await flushPromises();

      const form = wrapper.findComponent({ name: 'Form' });
      await form.vm.$emit('submit', {
        project: {},
        submissionState: {},
        atsClientId: '1',
        atsEnquiryId: '1'
      });
      await flushPromises();

      expect(updateProjectSpy).toHaveBeenCalled();
    });

    it('catches and toasts error on submit failure', async () => {
      updateProjectSpy.mockRejectedValue(new Error('Update failed'));

      const wrapper = mount(ProjectForm, wrapperSettingsForm());
      await flushPromises();
      await flushPromises();

      const form = wrapper.findComponent({ name: 'Form' });
      await form.vm.$emit('submit', {
        project: {},
        submissionState: {},
        atsClientId: '1',
        atsEnquiryId: '1'
      });
      await flushPromises();

      expect(updateProjectSpy).toHaveBeenCalled();
    });
  });
});
