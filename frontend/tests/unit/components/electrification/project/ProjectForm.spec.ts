import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import ProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import { externalApiService, userService } from '@/services';
import { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { ElectrificationProject } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn() })
}));

vi.mock('@/services', () => ({
  externalApiService: {
    searchOrgBook: vi.fn()
  },
  mapService: {
    getPIDs: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  }
}));

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
searchUsersSpy.mockResolvedValue({ data: [] } as AxiosResponse);

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

describe('onRegisteredNameInput', () => {
  const searchOrgBookSpy = vi.spyOn(externalApiService, 'searchOrgBook');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call searchOrgBook once when query length is less than 2', async () => {
    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'A',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    expect(searchOrgBookSpy).toHaveBeenCalledOnce();
  });

  it('should call searchOrgBook twice when query length is 2 or more', async () => {
    const mockResponse = {
      data: {
        results: [
          { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
          { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
        ]
      }
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'Test',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    expect(searchOrgBookSpy).toHaveBeenCalledTimes(2);
    expect(searchOrgBookSpy).toHaveBeenCalledWith('Test');
  });

  it('should filter results by type "name" and map to OrgBookOption format', async () => {
    const mockResponse = {
      data: {
        results: [
          { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
          { type: 'entity', value: 'Other Type', topic_source_id: 'FM0009999' },
          { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
        ]
      }
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'Test',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    // Access internal state through wrapper
    const orgBookOptions = (wrapper.vm as any).orgBookOptions; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(orgBookOptions).toHaveLength(2);
    expect(orgBookOptions[0]).toEqual({
      registeredName: 'Test Company Ltd',
      registeredId: 'FM0001234'
    });
    expect(orgBookOptions[1]).toEqual({
      registeredName: 'Test Corp',
      registeredId: 'FM0005678'
    });
  });

  it('should handle empty results from searchOrgBook', async () => {
    const mockResponse = {
      data: {
        results: []
      }
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'NonExistent',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    const orgBookOptions = (wrapper.vm as any).orgBookOptions; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(orgBookOptions).toHaveLength(0);
  });

  it('should handle results with only non-name types', async () => {
    const mockResponse = {
      data: {
        results: [
          { type: 'entity', value: 'Entity Type', topic_source_id: 'FM0001111' },
          { type: 'person', value: 'Person Type', topic_source_id: 'FM0002222' }
        ]
      }
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'Test',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    const orgBookOptions = (wrapper.vm as any).orgBookOptions; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(orgBookOptions).toHaveLength(0);
  });

  it('should call searchOrgBook with exact query string', async () => {
    const mockResponse = {
      data: {
        results: []
      }
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettingsForm());
    await nextTick();
    await nextTick();

    const testQuery = 'My Test Company Name';
    const event: AutoCompleteCompleteEvent = {
      query: testQuery,
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    expect(searchOrgBookSpy).toHaveBeenCalledWith(testQuery);
  });
});
