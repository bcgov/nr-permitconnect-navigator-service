import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';

import EnquiryForm from '@/components/projectCommon/enquiry/EnquiryForm.vue';
import { electrificationProjectService, enquiryService, housingProjectService, userService } from '@/services';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { projectServiceKey } from '@/utils/keys';

import type { AxiosResponse } from 'axios';
import type { IProjectService } from '@/interfaces/IProjectService';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn().mockReturnValue('i18n string')
  })
}));

const searchContactSpy = vi.spyOn(userService, 'searchUsers');
const updateEnquirySpy = vi.spyOn(enquiryService, 'updateEnquiry');
const getHousingActivityIdsSpy = vi.spyOn(housingProjectService, 'getActivityIds');
const getElectrificationActivityIdsSpy = vi.spyOn(electrificationProjectService, 'getActivityIds');

const currentDate = new Date().toISOString();

const exampleContact = {
  contactId: 'contact123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890'
};

// Example Enquiry object
const testEnquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  submissionType: 'General Inquiry',
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  intakeStatus: 'Pending',
  enquiryStatus: ApplicationStatus.NEW,
  contacts: [exampleContact],
  atsClientId: null,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const activityIdMockData = ['activity1', 'activity2'];

vi.mock(import('vue-router'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    push: vi.fn(),
    onBeforeRouteLeave: vi.fn()
  };
});

const wrapperSettings = (
  testEnquiryProp = testEnquiry,
  editableProp?: boolean,
  relatedAtsNumberProp?: number,
  projectServiceMock: IProjectService = housingProjectService
) => ({
  props: {
    editable: editableProp,
    enquiry: testEnquiryProp,
    relatedAtsNumber: relatedAtsNumberProp
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
    provide: {
      [projectServiceKey]: projectServiceMock
    },
    stubs: [
      'font-awesome-icon',
      'router-link',
      'form-navigation-guard',
      'section-header',
      'ats-user-details-modal',
      'ats-user-create-modal',
      'ats-user-link-modal'
    ]
  }
});

describe('EnquiryForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchContactSpy.mockResolvedValue({ data: [{ fullName: 'dummyName' }] } as AxiosResponse);
    updateEnquirySpy.mockResolvedValue({
      data: { enquiryId: 'enquiry123', activityId: 'activity456' }
    } as AxiosResponse);
    getHousingActivityIdsSpy.mockResolvedValue({ data: activityIdMockData } as AxiosResponse);
    getElectrificationActivityIdsSpy.mockResolvedValue({ data: activityIdMockData } as AxiosResponse);
  });

  it('renders the component with the provided props', () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    expect(wrapper).toBeTruthy();
  });

  it('renders the correct amount of dropdowns', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('.p-select-dropdown');
    expect(elements.length).toBe(8);
  });

  it('renders the correct amount of input components', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    // includes datepicker and input mask components, but not dropdowns
    const elements = wrapper.findAll('.p-inputtext');
    expect(elements.length).toBe(6);
  });

  it('renders the correct amount of datepickers components', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('.p-datepicker-input');
    expect(elements.length).toBe(1);
  });

  it('renders the correct amount of input mask components (phone number)', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('.p-inputmask');
    expect(elements.length).toBe(1);
  });

  it('renders the correct amount of text area components', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings());
    await nextTick();

    const elements = wrapper.findAll('textarea');
    expect(elements.length).toBe(1);
  });

  it('searches for users onMount', async () => {
    const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(EnquiryForm, wrapperSettings(mountEnquiry));
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(searchContactSpy).toHaveBeenCalledTimes(1);
    expect(searchContactSpy).toHaveBeenCalledWith({ userId: [mountEnquiry.assignedUserId] });
  });

  it('gets electrification activity Ids onMount', async () => {
    const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(EnquiryForm, wrapperSettings(mountEnquiry, true, undefined, electrificationProjectService));
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(getElectrificationActivityIdsSpy).toHaveBeenCalledTimes(1);
    expect(getElectrificationActivityIdsSpy).toHaveBeenCalledWith(); // No arguments
  });

  it('gets housing activity Ids onMount', async () => {
    const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUseId' };
    const wrapper = mount(EnquiryForm, wrapperSettings(mountEnquiry, true, undefined, housingProjectService));
    await nextTick();

    expect(wrapper.isVisible()).toBeTruthy();
    expect(getHousingActivityIdsSpy).toHaveBeenCalledTimes(1);
    expect(getHousingActivityIdsSpy).toHaveBeenCalledWith(); // No arguments
  });

  it('there are correct numbers of disabled components when editable prop is false', async () => {
    const wrapper = mount(EnquiryForm, wrapperSettings(undefined, false, 123456));
    await nextTick();

    const elements = wrapper.findAll('.p-disabled');
    expect(wrapper.props('editable')).toBe(false);
    expect(elements.length).toBe(9);
  });

  it('displays ATS number as "Unavailable" when relatedActivityId in enquiry, no relatedAtsNumber prop', async () => {
    const mountEnquiry = { ...testEnquiry, relatedActivityId: 'testRAId' };
    const wrapper = mount(EnquiryForm, wrapperSettings(mountEnquiry, true, undefined));
    await nextTick();

    const element = wrapper.find('a.no-underline');
    expect(element.text()).toBe('Unavailable');
  });

  it('displays correct ATS # when relatedActivityId in enquiry and relatedAtsNumber in prop', async () => {
    const testAtsNumber = 123456;
    const mountEnquiry = { ...testEnquiry, relatedActivityId: 'testRAId' };
    const wrapper = mount(EnquiryForm, wrapperSettings(mountEnquiry, true, testAtsNumber));
    await nextTick();

    const element = wrapper.find('a.hover-hand');
    expect(element.text()).toBe(testAtsNumber.toString());
  });
});
