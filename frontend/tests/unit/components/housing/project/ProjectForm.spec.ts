import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

import ProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import i18n from '@/i18n';
import { atsService, externalApiService, mapService, userService, housingProjectService } from '@/services';
import { useProjectStore } from '@/store';
import { ATSCreateTypes, BasicResponse, GroupName } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { NumResidentialUnits } from '@/utils/enums/housing';
import { mockAxiosResponse, VEE_FORM_STUB } from '../../../../helpers';

import type { AxiosResponse } from 'axios';
import type { GeoJSON } from 'geojson';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
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
  atsEnquiryId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  applicationStatus: ApplicationStatus.COMPLETED,
  contacts: [exampleContact],
  user: testUser,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const mockSubmitValues = {
  project: {},
  location: {},
  finance: {},
  units: {},
  submissionState: {},
  contact: exampleContact,
  atsClientId: null,
  atsEnquiryId: null,
  addedToAts: false
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
    const wrapper = mount(ProjectForm, wrapperSettings());
    await nextTick();

    expect(wrapper).toBeTruthy();
  });

  it('renders the correct amount of dropdowns', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const elements = wrapper.findAll('.p-select-dropdown');
    expect(elements.length).toBe(16);
  });

  it('renders the correct amount of input components', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const elements = wrapper.findAll('.p-inputtext');
    expect(elements.length).toBe(16);
  });

  it('renders the correct amount of input mask components (phone number)', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const elements = wrapper.findAll('.p-inputmask');
    expect(elements.length).toBe(0);
  });

  it('renders the correct amount of text area components', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    const elements = wrapper.findAll('textarea');
    expect(elements.length).toBe(3);
  });

  it('searches for users onMount', async () => {
    const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(ProjectForm, wrapperSettings(mountProject));
    await flushPromises();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(userService.searchUsers).toHaveBeenCalledTimes(1);
    expect(userService.searchUsers).toHaveBeenCalledWith({ userId: [mountProject.assignedUserId] });
  });

  it('gets PIDs onMount', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await flushPromises();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(mapService.getPIDs).toHaveBeenCalledTimes(1);
    expect(mapService.getPIDs).toHaveBeenCalledWith(testProject.housingProjectId);
  });

  it('disables all fields when editable is false', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings(undefined, false));
    await flushPromises();

    const fieldComponentNames = [
      'Select',
      'InputText',
      'InputNumber',
      'TextArea',
      'Checkbox',
      'EditableSelect',
      'AutoComplete'
    ] as const;

    const fields = fieldComponentNames.flatMap((name) => wrapper.findAllComponents({ name }));

    expect(fields.length).toBeGreaterThan(0);

    const notDisabled = fields
      .filter((c) => c.props('disabled') !== true)
      .map((c) => ({
        component: c.vm?.$options?.name,
        name: c.props('name'),
        disabled: c.props('disabled')
      }));

    expect(notDisabled).toEqual([]);
    const elements = wrapper.findAll('.p-disabled');
    expect(wrapper.props('editable')).toBe(false);
    expect(elements.length).toBe(20);
  });

  it('geojson download btn not visible when no geojson', async () => {
    const modifiedProject = { ...testProject, geoJson: undefined };

    const wrapper = mount(ProjectForm, wrapperSettings(modifiedProject, false));
    await flushPromises();

    expect(wrapper.find('#download-geojson').exists()).toBe(false);
  });

  it('checks geojson download btn visible when geojson is in project', async () => {
    const testGeoJson: GeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        }
      ]
    };
    const modifiedProject = { ...testProject, geoJson: testGeoJson };

    const wrapper = mount(ProjectForm, wrapperSettings(modifiedProject, false));
    await flushPromises();

    const downloadBtn = wrapper.find('#download-geojson');
    expect(downloadBtn.exists()).toBe(true);
    expect(downloadBtn.isVisible()).toBe(true);
  });
});

describe('onRegisteredNameInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not call searchOrgBook when query length is less than 2', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await flushPromises();

    const event: AutoCompleteCompleteEvent = { query: 'A', originalEvent: new Event('input') };
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await flushPromises();

    expect(externalApiService.searchOrgBook).not.toHaveBeenCalled();
  });

  it('should call searchOrgBook when query length is 2 or more', async () => {
    vi.mocked(externalApiService.searchOrgBook).mockResolvedValue({
      data: {
        results: [
          { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
          { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
        ]
      }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await flushPromises();

    const event: AutoCompleteCompleteEvent = { query: 'Test', originalEvent: new Event('input') };
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await flushPromises();

    expect(externalApiService.searchOrgBook).toHaveBeenCalledTimes(1);
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

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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
    vi.mocked(housingProjectService.updateProject).mockResolvedValue(mockAxiosResponse(testProject));
  });

  it('handles CLIENT_ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue({ status: 201, data: { clientId: 111 } } as AxiosResponse);
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue({
      status: 201,
      data: { enquiryId: 222 }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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
    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ atsClientId: 111, atsEnquiryId: 222, addedToAts: true })
    );
  });

  it('handles ENQUIRY creation path upon form submit', async () => {
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue({
      status: 201,
      data: { enquiryId: 333 }
    } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, atsClientId: 111 });
    await flushPromises();

    expect(atsService.createATSEnquiry).toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ atsClientId: 111, atsEnquiryId: 333, addedToAts: true })
    );
  });

  it('handles CLIENT creation path upon form submit', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue({ status: 201, data: { clientId: 444 } } as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, atsEnquiryId: 555 });
    await flushPromises();

    expect(atsService.createATSClient).toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ atsClientId: 444, atsEnquiryId: 555, addedToAts: true })
    );
  });

  it('bypasses addedToAts in CLIENT_ENQUIRY path when IDs fail to generate', async () => {
    vi.mocked(atsService.createATSClient).mockResolvedValue(mockAxiosResponse({}));
    vi.mocked(atsService.createATSEnquiry).mockResolvedValue(mockAxiosResponse({}));

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await flushPromises();

    const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
    await atsInfo.vm.$emit('ats-info:create', ATSCreateTypes.CLIENT_ENQUIRY);

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, addedToAts: false });
    await flushPromises();

    expect(housingProjectService.updateProject).toHaveBeenCalledWith(
      testProject.housingProjectId,
      expect.objectContaining({ addedToAts: false })
    );
  });

  it('does nothing and falls through to update if atsCreateType is undefined', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await flushPromises();

    const form: Omit<VueWrapper<ComponentPublicInstance>, 'exists'> = wrapper.getComponent<DefineComponent>(
      '.vee-form-stub'
    );
    form.vm.$emit('submit', { ...mockSubmitValues, addedToAts: false });
    await flushPromises();

    expect(atsService.createATSClient).not.toHaveBeenCalled();
    expect(atsService.createATSEnquiry).not.toHaveBeenCalled();
    expect(housingProjectService.updateProject).toHaveBeenCalled();
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
        activityId: 'activity456',
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
