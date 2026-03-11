import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { externalApiService, housingProjectService, mapService, userService } from '@/services';
import { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { BasicResponse, GroupName } from '@/utils/enums/application';
import { NumResidentialUnits } from '@/utils/enums/housing';
import { mockAxiosResponse, PRIMEVUE_STUBS } from '../../../../helpers';

import type { GeoJSON } from 'geojson';
import type { Contact, GeocoderAddressResponse, Group, HousingProject, User } from '@/types';

interface ProjectFormInstance {
  formRef: {
    values: {
      location: {
        streetAddress: string | null;
        locationAddress: string | null;
      };
    };
    setFieldValue: (field: string, value: unknown) => void;
  };
}

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
    searchOrgBook: vi.fn(),
    searchAddressCoder: vi.fn()
  },
  housingProjectService: {
    updateProject: vi.fn()
  },
  mapService: {
    getPIDs: vi.fn()
  },
  userService: {
    searchUsers: vi.fn()
  }
}));

const getPIDsSpy = vi.spyOn(mapService, 'getPIDs');
const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
const updateProjectSpy = vi.spyOn(housingProjectService, 'updateProject');

const currentDate = new Date().toISOString();

const testUser: User = {
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
};

const exampleContact: Contact = {
  contactId: 'contact123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '123-456-7890'
} as Contact;

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
  atsEnquiryId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  applicationStatus: ApplicationStatus.IN_PROGRESS,
  contacts: [exampleContact],
  user: testUser,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const emptyGeocoderResponse: GeocoderAddressResponse = {
  searchTimestamp: new Date(),
  executionTime: 10,
  version: '1.0',
  minScore: 0,
  maxResults: 10,
  echo: false,
  interpolation: 'none',
  outputSRS: 4326,
  setBack: 0,
  features: []
};

const wrapperSettings = (testProjectProp = testProject, editableProp = true) => ({
  props: {
    project: testProjectProp,
    editable: editableProp
  },
  global: {
    plugins: [
      createTestingPinia({
        initialState: { auth: { user: {} } }
      }),
      PrimeVue,
      ConfirmationService,
      i18n,
      ToastService
    ],
    stubs: {
      ...PRIMEVUE_STUBS,
      FormNavigationGuard: true,
      'font-awesome-icon': true,
      'router-link': true
    }
  }
});

describe('ProjectFormNavigator.vue (Housing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchUsersSpy.mockResolvedValue(mockAxiosResponse([{ fullName: 'dummyName' }] as User[]));
    getPIDsSpy.mockResolvedValue(mockAxiosResponse({ pids: ['123456789'] }));
  });

  it('renders the component with the provided props', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();
    expect(wrapper.exists()).toBeTruthy();
  });

  it('renders the correct amount of dropdowns', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();
    // Second flush required to settle VeeValidate Form rendering
    await flushPromises();

    const elements = wrapper.findAll('.p-select-dropdown');
    expect(elements.length).toBe(16);
  });

  it('renders the correct amount of input components', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();
    await flushPromises();

    const elements = wrapper.findAll('.p-inputtext');
    expect(elements.length).toBe(16);
  });

  it('renders the correct amount of text area components', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();
    await flushPromises();

    const elements = wrapper.findAll('textarea');
    expect(elements.length).toBe(3);
  });

  it('searches for users onMount', async () => {
    const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(ProjectForm, wrapperSettings(mountProject));
    await flushPromises();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({ userId: [mountProject.assignedUserId] });
  });

  it('gets PIDs onMount', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(getPIDsSpy).toHaveBeenCalledTimes(1);
    expect(getPIDsSpy).toHaveBeenCalledWith(testProject.housingProjectId);
  });

  it('disables all fields when editable is false', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings(undefined, false));
    await flushPromises();
    await flushPromises();

    const elements = wrapper.findAll('.p-disabled');
    expect(wrapper.vm.$props?.editable).toBe(false);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('geojson download btn not visible when no geojson', async () => {
    const modifiedProject = { ...testProject, geoJson: undefined };

    const wrapper = mount(ProjectForm, wrapperSettings(modifiedProject, false));
    await flushPromises();
    await flushPromises();

    expect(wrapper.find('#download-geojson').exists()).toBe(false);
  });

  it('checks geojson download btn visible when geojson is in project', async () => {
    const testGeoJson: GeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    };
    const modifiedProject = { ...testProject, geoJson: testGeoJson };

    const wrapper = mount(ProjectForm, wrapperSettings(modifiedProject, false));
    await flushPromises();
    await flushPromises();

    const downloadBtn = wrapper.find('#download-geojson');
    expect(downloadBtn.exists()).toBe(true);
  });

  describe('Location and Address Handlers', () => {
    it('searches address coder on input', async () => {
      const searchAddressCoderSpy = vi.spyOn(externalApiService, 'searchAddressCoder');
      searchAddressCoderSpy.mockResolvedValue(mockAxiosResponse(emptyGeocoderResponse));

      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();
      await flushPromises();

      const addressSearch = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });
      await addressSearch.vm.$emit('on-input', { target: { value: '123 Test St' } });

      expect(searchAddressCoderSpy).toHaveBeenCalledWith('123 Test St');
    });

    it('clears location fields when address search is empty', async () => {
      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();
      await flushPromises();

      const addressSearch = wrapper.findComponent({ name: 'EditableSelect', props: { name: 'addressSearch' } });
      await addressSearch.vm.$emit('on-input', { target: { value: '' } });
      await flushPromises();

      const vm = wrapper.vm as unknown as ProjectFormInstance;
      expect(vm.formRef.values.location.streetAddress).toBeNull();
    });
  });

  describe('Form Actions (Submit & ReOpen)', () => {
    it('submits updated project successfully', async () => {
      updateProjectSpy.mockResolvedValue(mockAxiosResponse(testProject));

      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();
      await flushPromises();

      const form = wrapper.findComponent({ name: 'Form' });
      await form.vm.$emit('submit', {
        project: {},
        units: {},
        location: { locationAddress: 'dummy' },
        finance: {},
        submissionState: {},
        atsClientId: '1',
        atsEnquiryId: '1'
      });
      await flushPromises();

      expect(updateProjectSpy).toHaveBeenCalled();
    });

    it('catches and toasts error on submit failure', async () => {
      updateProjectSpy.mockRejectedValue(new Error('Update failed'));

      const wrapper = mount(ProjectForm, wrapperSettings());
      await flushPromises();
      await flushPromises();

      const form = wrapper.findComponent({ name: 'Form' });
      await form.vm.$emit('submit', {
        project: {},
        units: {},
        location: {},
        finance: {},
        submissionState: {},
        atsClientId: '1',
        atsEnquiryId: '1'
      });
      await flushPromises();

      expect(updateProjectSpy).toHaveBeenCalled();
    });
  });
});
