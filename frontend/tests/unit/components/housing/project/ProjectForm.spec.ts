import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';

import ProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import { externalApiService, mapService, userService } from '@/services';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { GroupName } from '@/utils/enums/application';
import { mount } from '@vue/test-utils';

import type { AxiosResponse } from 'axios';
import type { GeoJSON } from 'geojson';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { HousingProject, IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute, Group } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
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

const getPIDsSpy = vi.spyOn(mapService, 'getPIDs');
const searchUsersSpy = vi.spyOn(userService, 'searchUsers');

searchUsersSpy.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
getPIDsSpy.mockResolvedValue({ data: { pids: ['123456789'] } } as AxiosResponse);

const currentDate = new Date().toISOString();

const exampleIDIRAttribute: IDIRAttribute = {
  idirUsername: 'idirUser',
  idirUserGuid: 'idir-guid-123'
};

// Example BasicBCeIDAttribute object
const exampleBasicBCeIDAttribute: BasicBCeIDAttribute = {
  bceidUsername: 'bceidUser',
  bceidUserGuid: 'bceid-guid-123'
};

// Example BusinessBCeIDAttribute object
const exampleBusinessBCeIDAttribute: BusinessBCeIDAttribute = {
  bceidBusinessGuid: 'business-guid-123',
  bceidBusinessName: 'Example Business',
  ...exampleBasicBCeIDAttribute
};

// Example User object
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

// Example Contact object
const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

// Example Project object
const testProject: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'project789',
  projectId: 'project789',
  queuePriority: 1,
  submissionType: 'Type A',
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyIdRegistered: 'FM0281610',
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  projectName: 'Project Alpha',
  projectDescription: 'This is a test project description.',
  projectLocationDescription: 'Test location description.',
  singleFamilyUnits: '10',
  multiFamilyUnits: '20',
  multiPermitsNeeded: 'Yes',
  otherUnitsDescription: 'Other units description.',
  otherUnits: '5',
  hasRentalUnits: 'Yes',
  rentalUnits: '15',
  financiallySupportedBc: 'Yes',
  financiallySupportedIndigenous: 'Yes',
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: 'Yes',
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: 'Yes',
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
      ToastService
    ],
    stubs: ['font-awesome-icon', 'router-link']
  }
});

describe('ProjectForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await nextTick();

    expect(wrapper).toBeTruthy();
  });

  it('renders the correct amount of dropdowns', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    // Note: <Form> component's v-if does not settle until after two nextTick() calls.
    // Both will be required if the DOM querying is required.
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('.p-select-dropdown');
    expect(elements.length).toBe(16);
  });

  it('renders the correct amount of input components', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await nextTick();
    await nextTick();

    // includes datepicker and input mask components, but not dropdowns
    const elements = wrapper.findAll('.p-inputtext');
    expect(elements.length).toBe(16);
  });

  it('renders the correct amount of input mask components (phone number)', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('.p-inputmask');
    expect(elements.length).toBe(0);
  });

  it('renders the correct amount of text area components', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('textarea');
    expect(elements.length).toBe(3);
  });

  it('searches for users onMount', async () => {
    const mountProject = { ...testProject, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(ProjectForm, wrapperSettings(mountProject));
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({ userId: [mountProject.assignedUserId] });
  });

  it('gets PIDs onMount', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings());
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(getPIDsSpy).toHaveBeenCalledTimes(1);
    expect(getPIDsSpy).toHaveBeenCalledWith(testProject.housingProjectId);
  });

  it('disables all fields when editable is false', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings(undefined, false));
    await nextTick();
    await nextTick();

    // Note: if different form fields components are added to template they will need to be added to this
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
    expect(wrapper.vm.$props?.editable).toBe(false);
    expect(elements.length).toBe(20);
  });

  it('geojson download btn not visible when no geojson', async () => {
    const modifiedProject = { ...testProject, geoJson: undefined };

    const wrapper = mount(ProjectForm, wrapperSettings(modifiedProject, false));
    await nextTick();
    await nextTick();

    expect(wrapper.find('#download-geojson').exists()).toBe(false);
  });

  it('checks geojson download btn visible when geojson is in submission', async () => {
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
    const modifiedSubmission = { ...testSubmission, geoJson: testGeoJson };

    const wrapper = mount(ProjectForm, wrapperSettings(modifiedProject, false));
    await nextTick();
    await nextTick();

    const downloadBtn = wrapper.find('#download-geojson');
    expect(downloadBtn.exists()).toBe(true);
    expect(downloadBtn.isVisible()).toBe(true);
  });
});

describe('onRegisteredNameInput', () => {
  const searchOrgBookSpy = vi.spyOn(externalApiService, 'searchOrgBook');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not call searchOrgBook when query length is less than 2', async () => {
    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'A',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.trigger('on-complete', event);

    expect(searchOrgBookSpy).not.toHaveBeenCalled();
  });

  it('should call searchOrgBook when query length is 2 or more', async () => {
    const mockResponse = {
      data: {
        results: [
          { type: 'name', value: 'Test Company Ltd', topic_source_id: 'FM0001234' },
          { type: 'name', value: 'Test Corp', topic_source_id: 'FM0005678' }
        ]
      }
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
    await nextTick();
    await nextTick();

    const event: AutoCompleteCompleteEvent = {
      query: 'Test',
      originalEvent: new Event('input')
    };

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('on-complete', event);
    await nextTick();

    expect(searchOrgBookSpy).toHaveBeenCalledTimes(1);
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

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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

  it('should handle undefined results from searchOrgBook', async () => {
    const mockResponse = {
      data: {}
    };

    searchOrgBookSpy.mockResolvedValue(mockResponse as AxiosResponse);

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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

    const wrapper = mount(ProjectForm, wrapperSettings(testProject));
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
