import { nextTick } from 'vue';

import SubmissionForm from '@/components/housing/submission/SubmissionForm.vue';
import { ApplicationStatus } from '@/utils/enums/housing';
import { GroupName } from '@/utils/enums/application';
import { mapService, userService } from '@/services';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { mount } from '@vue/test-utils';

import type { HousingProject, IDIRAttribute, BasicBCeIDAttribute, BusinessBCeIDAttribute } from '@/types';

import type { AxiosResponse } from 'axios';
// import { geoJSON } from 'leaflet';

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
  groups: [GroupName.DEVELOPER],
  status: 'active',
  userId: 'user123',
  sub: 'sub-123',
  elevatedRights: true,
  idirAttributes: exampleIDIRAttribute,
  bceidAttributes: exampleBasicBCeIDAttribute,
  businessBceidAttribute: exampleBusinessBCeIDAttribute,
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

// Example Submission object
const testSubmission: HousingProject = {
  activityId: 'activity456',
  housingProjectId: 'submission789',
  queuePriority: 1,
  housingProjectType: 'Type A',
  submittedAt: '2023-01-01T12:00:00Z',
  relatedEnquiries: 'enquiry123',
  hasRelatedEnquiry: true,
  companyNameRegistered: 'Example Company',
  consentToFeedback: true,
  isDevelopedInBC: 'Yes',
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
  financiallySupportedBC: 'Yes',
  financiallySupportedIndigenous: 'Yes',
  indigenousDescription: 'Indigenous support description.',
  financiallySupportedNonProfit: 'Yes',
  nonProfitDescription: 'Non-profit support description.',
  financiallySupportedHousingCoop: 'Yes',
  housingCoopDescription: 'Housing coop support description.',
  streetAddress: '123 Main St',
  locality: 'Anytown',
  province: 'BC',
  locationPIDs: '123456789',
  latitude: 49.2827,
  longitude: -123.1207,
  geomarkUrl: 'http://example.com/geomark',
  naturalDisaster: 'None',
  addedToATS: true,
  atsClientId: '654321',
  ltsaCompleted: true,
  bcOnlineCompleted: true,
  aaiUpdated: true,
  astNotes: 'AST notes.',
  intakeStatus: 'Pending',
  applicationStatus: ApplicationStatus.COMPLETED,
  contacts: [exampleContact],
  user: testUser,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const wrapperSettings = (testSubmissionProp = testSubmission, editableProp = true) => ({
  props: {
    housingProject: testSubmissionProp,
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

describe('SubmissionForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with the provided props', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings());
    await nextTick();

    expect(wrapper).toBeTruthy();
  });

  it('renders the correct amount of dropdowns', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings());
    // Note: <Form> component's v-if does not settle until after two nextTick() calls.
    // Both will be required if the DOM querying is required.
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('.p-select-dropdown');
    expect(elements.length).toBe(19);
  });

  it('renders the correct amount of input components', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings());
    await nextTick();
    await nextTick();

    // includes datepicker and input mask components, but not dropdowns
    const elements = wrapper.findAll('.p-inputtext');
    expect(elements.length).toBe(21);
  });

  it('renders the correct amount of datepickers components', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings());
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('.p-datepicker-input');
    expect(elements.length).toBe(1);
  });

  it('renders the correct amount of input mask components (phone number)', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings());
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('.p-inputmask');
    expect(elements.length).toBe(1);
  });

  it('renders the correct amount of text area components', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings());
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('textarea');
    expect(elements.length).toBe(4);
  });

  it('searches for users onMount', async () => {
    const mountSubmission = { ...testSubmission, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(SubmissionForm, wrapperSettings(mountSubmission));
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({ userId: [mountSubmission.assignedUserId] });
  });

  it('gets PIDs onMount', async () => {
    // const mountSubmission = { ...testSubmission, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(SubmissionForm, wrapperSettings());
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(getPIDsSpy).toHaveBeenCalledTimes(1);
    expect(getPIDsSpy).toHaveBeenCalledWith(testSubmission.housingProjectId);
  });

  it('there are correct numbers of disabled components when editable prop is false', async () => {
    const wrapper = mount(SubmissionForm, wrapperSettings(undefined, false));
    await nextTick();
    await nextTick();

    const elements = wrapper.findAll('.p-disabled');
    expect(wrapper.vm.$props?.editable).toBe(false);
    expect(elements.length).toBe(23);
  });

  it('geojson download btn not visible when no geojson', async () => {
    const modifiedSubmission = { ...testSubmission, geoJSON: undefined };

    const wrapper = mount(SubmissionForm, wrapperSettings(modifiedSubmission, false));
    await nextTick();
    await nextTick();

    expect(wrapper.find('#download-geojson').exists()).toBe(false);
  });

  it('geojson download btn visible when geojson is in submission', async () => {
    const modifiedSubmission = { ...testSubmission, geoJSON: {} };

    const wrapper = mount(SubmissionForm, wrapperSettings(modifiedSubmission, false));
    await nextTick();
    await nextTick();

    const downloadBtn = wrapper.find('#download-geojson');
    expect(downloadBtn.exists()).toBe(true);
    expect(downloadBtn.isVisible()).toBe(true);
  });

  it('geojson download btn visible when geojson is in submission', async () => {
    const testGeoJson = { feature: 'POINT', data: 'test' };
    const modifiedSubmission = { ...testSubmission, geoJSON: testGeoJson };

    const wrapper = mount(SubmissionForm, wrapperSettings(modifiedSubmission, false));
    await nextTick();
    await nextTick();

    const downloadBtn = wrapper.find('#download-geojson');
    expect(downloadBtn.exists()).toBe(true);
    expect(downloadBtn.isVisible()).toBe(true);
  });
});
