import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import ProjectForm from '@/components/electrification/project/ProjectForm.vue';
import { userService } from '@/services';
import { ApplicationStatus } from '@/utils/enums/projectCommon';

import type { ElectrificationProject } from '@/types';
import type { AxiosResponse } from 'axios';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
searchUsersSpy.mockResolvedValue({ data: [] } as AxiosResponse);

const testProject: ElectrificationProject = {
  electrificationProjectId: 'proj123',
  projectId: 'proj123',
  activityId: 'activity123',
  submittedAt: new Date().toISOString(),
  intakeStatus: 'Pending',
  applicationStatus: ApplicationStatus.IN_PROGRESS,
  companyNameRegistered: 'Test Co',
  hasRelatedEnquiry: false,
  queuePriority: 1,
  submissionType: 'Type A',
  projectName: 'Test Project',
  projectDescription: 'Description',
  multiPermitsNeeded: 'No',
  astNotes: 'Notes',
  atsClientId: null,
  atsEnquiryId: null,
  aaiUpdated: false,
  contacts: []
};

const wrapperSettingsForm = (editable = true) => ({
  props: { editable, project: testProject },
  global: {
    plugins: [
      () => createTestingPinia({ initialState: { auth: { user: {} } } }),
      PrimeVue,
      ConfirmationService,
      ToastService
    ],
    stubs: [
      'FormNavigationGuard',
      'BasicContactInformationCard',
      'ATSUserLinkModal',
      'ATSUserDetailsModal',
      'ATSUserCreateModal'
    ]
  }
});

describe('ProjectForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with provided props', async () => {
    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
