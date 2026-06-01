import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import EnquiryForm from '@/components/enquiry/EnquiryForm.vue';
import i18n from '@/i18n';
import { electrificationProjectService, enquiryService, housingProjectService, userService } from '@/services';
import {
  ApplicationStatus,
  EnquirySubmittedMethod,
  SubmissionType,
  ActivityContactRole,
  ContactPreference,
  ProjectRelationship
} from '@/utils/enums/projectCommon';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';
import { mockAxiosResponse, VEE_FORM_STUB } from '../../../helpers';

import type { Ref } from 'vue';
import type { Enquiry, ProjectService } from '@/types';

const searchContactSpy = vi.spyOn(userService, 'searchUsers');
const updateEnquirySpy = vi.spyOn(enquiryService, 'updateEnquiry');
const getHousingActivityIdsSpy = vi.spyOn(housingProjectService, 'getActivityIds');
const getElectrificationActivityIdsSpy = vi.spyOn(electrificationProjectService, 'getActivityIds');
const searchHousingProjectsSpy = vi.spyOn(housingProjectService, 'searchProjects');

const currentDate = new Date().toISOString();

const testEnquiry: Enquiry = {
  enquiryId: 'enquiry123',
  activityId: 'activity456',
  submissionType: SubmissionType.ASSISTANCE,
  submittedAt: '2023-01-01T12:00:00Z',
  submittedBy: 'user123',
  enquiryStatus: ApplicationStatus.NEW,
  atsClientId: null,
  atsEnquiryId: null,
  addedToAts: false,
  submittedMethod: EnquirySubmittedMethod.EMAIL,
  createdBy: 'testCreatedBy',
  createdAt: currentDate,
  updatedBy: 'testUpdatedAt',
  updatedAt: currentDate
};

const activityIdMockData = ['activity1', 'activity2'];

const testAtsEnquiryPartnerAgencies = 'Electrification';
const testAtsEnquiryTypeCode = 'Electrification - Enquiry Only';

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
  projectServiceMock: Ref<ProjectService> = ref(housingProjectService),
  atsEnquiryPartnerAgencies = testAtsEnquiryPartnerAgencies,
  atsEnquiryTypeCode = testAtsEnquiryTypeCode
) => ({
  props: {
    editable: editableProp,
    enquiry: testEnquiryProp
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
      ToastService,
      i18n
    ],
    provide: {
      [projectServiceKey]: projectServiceMock,
      [atsEnquiryPartnerAgenciesKey]: atsEnquiryPartnerAgencies,
      [atsEnquiryTypeCodeKey]: atsEnquiryTypeCode
    },
    stubs: {
      'font-awesome-icon': true,
      'router-link': true,
      'form-navigation-guard': true,
      'section-header': true,
      'ats-user-details-modal': true,
      'ats-user-create-modal': true,
      'ats-user-link-modal': true,
      Form: VEE_FORM_STUB
    }
  }
});

describe('EnquiryForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.searchUsers).mockResolvedValue(mockAxiosResponse([{ fullName: 'dummyName' }]));
    vi.mocked(enquiryService.updateEnquiry).mockResolvedValue(
      mockAxiosResponse({ enquiryId: 'enquiry123', activityId: 'activity456' })
    );
    vi.mocked(housingProjectService.getActivityIds).mockResolvedValue(mockAxiosResponse(activityIdMockData));
    vi.mocked(electrificationProjectService.getActivityIds).mockResolvedValue(mockAxiosResponse(activityIdMockData));
    vi.mocked(housingProjectService.searchProjects).mockResolvedValue(mockAxiosResponse([]));
  });

  describe('Rendering and Initialization', () => {
    it('renders primary contact name when form initializes', async () => {
      const mountEnquiry = {
        ...testEnquiry,
        activity: {
          activityId: 'activity456',
          initiativeId: 'initiative123',
          activityContact: [
            {
              activityId: 'activity456',
              contactId: 'contact123',
              role: ActivityContactRole.PRIMARY,
              contact: {
                contactId: 'contact123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phoneNumber: '555-1234'
              }
            }
          ]
        }
      } as unknown as typeof testEnquiry;
      const wrapper = mount(EnquiryForm, wrapperSettings(mountEnquiry));
      await flushPromises();
      await nextTick();

      expect(wrapper.html()).toContain('John Doe');
    });

    it('renders the form only when initialFormValues is set', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings());
      await flushPromises();
      await nextTick();

      const form = wrapper.find('.vee-form-stub');
      expect(form.exists()).toBe(true);
    });

    it('searches for users onMount when assignedUserId exists', async () => {
      const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUserId' };
      mount(EnquiryForm, wrapperSettings(mountEnquiry));
      await flushPromises();
      await nextTick();

      expect(searchContactSpy).toHaveBeenCalledTimes(1);
      expect(searchContactSpy).toHaveBeenCalledWith({ userId: [mountEnquiry.assignedUserId] });
    });

    it('gets housing activity Ids onMount', async () => {
      const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUserId' };
      mount(EnquiryForm, wrapperSettings(mountEnquiry, true, ref(housingProjectService)));
      await flushPromises();
      await nextTick();

      expect(getHousingActivityIdsSpy).toHaveBeenCalledTimes(1);
    });

    it('gets electrification activity Ids onMount', async () => {
      const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUserId' };
      mount(EnquiryForm, wrapperSettings(mountEnquiry, true, ref(electrificationProjectService)));
      await flushPromises();
      await nextTick();

      expect(getElectrificationActivityIdsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Buttons - DOM Directed Testing', () => {
    it('displays Save and Cancel buttons when enquiry is not completed', async () => {
      const notCompletedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.NEW };
      const wrapper = mount(EnquiryForm, wrapperSettings(notCompletedEnquiry, true));
      await flushPromises();
      await nextTick();

      const submitButton = wrapper.find('button[type="submit"]');
      const cancelButton = wrapper.findComponent({ name: 'CancelButton' });
      expect(submitButton.exists()).toBe(true);
      expect(cancelButton.exists()).toBe(true);
    });

    it('disables Save button when editable prop is false', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, false));
      await flushPromises();
      await nextTick();

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.attributes('disabled')).toBeDefined();
    });

    it('hides Save and Cancel buttons when enquiry is completed', async () => {
      const completedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.COMPLETED };
      const wrapper = mount(EnquiryForm, wrapperSettings(completedEnquiry, true));
      await flushPromises();
      await nextTick();

      const submitButton = wrapper.find('button[type="submit"]');
      const cancelButton = wrapper.findComponent({ name: 'CancelButton' });
      expect(submitButton.exists()).toBe(false);
      expect(cancelButton.exists()).toBe(false);
    });
  });

  describe('Form Fields - DOM Directed Testing', () => {
    it('populates enquiry description with initial value', async () => {
      const enquiryWithDescription = {
        ...testEnquiry,
        enquiryDescription: 'Test enquiry details'
      };
      const wrapper = mount(EnquiryForm, wrapperSettings(enquiryWithDescription));
      await flushPromises();
      await nextTick();

      const formComponent = wrapper.findComponent({ name: 'VeeFormStub' });
      expect(formComponent.exists()).toBe(true);

      const formValues = (formComponent.vm as { values: { enquiryDescription?: string } }).values;
      expect(formValues.enquiryDescription).toBe('Test enquiry details');
    });

    it('disables enquiry description field when not editable', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, false));
      await flushPromises();
      await nextTick();

      const disabledTextareas = wrapper.findAll('textarea[disabled]');
      expect(disabledTextareas.length).toBeGreaterThan(0);
    });

    it('enables enquiry description field when editable', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      const textareas = wrapper.findAll('textarea');
      const enquiryDescField = textareas[0];
      expect(enquiryDescField.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Form Submission - DOM Directed Testing', () => {
    const submitValues = {
      enquiryDescription: 'Test enquiry details',
      relatedActivityId: null,
      contact: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '555-1234',
        email: 'john@example.com',
        contactApplicantRelationship: ProjectRelationship.CONSULTANT,
        contactPreference: ContactPreference.EITHER
      },
      submissionState: {
        assignedUser: null,
        enquiryStatus: ApplicationStatus.NEW,
        submittedMethod: EnquirySubmittedMethod.EMAIL,
        submissionType: SubmissionType.ASSISTANCE
      },
      atsInfo: {
        atsClientId: null,
        atsEnquiryId: null
      },
      addedToAts: false
    };

    async function submitViaComponent(wrapper: ReturnType<typeof mount>, values = submitValues) {
      const setupState = (
        wrapper.vm as unknown as {
          $: { setupState: { onSubmit: (payload: typeof submitValues) => Promise<void> } };
        }
      ).$.setupState;
      await setupState.onSubmit(values);
    }

    it('calls updateEnquiry service when form is submitted', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(updateEnquirySpy).toHaveBeenCalledTimes(1);
      expect(updateEnquirySpy).toHaveBeenCalledWith(
        'enquiry123',
        expect.objectContaining({
          enquiryDescription: submitValues.enquiryDescription,
          relatedActivityId: null,
          assignedUserId: null,
          enquiryStatus: submitValues.submissionState.enquiryStatus,
          submissionType: submitValues.submissionState.submissionType,
          submittedMethod: submitValues.submissionState.submittedMethod,
          atsClientId: null,
          atsEnquiryId: null,
          addedToAts: false
        })
      );
    });

    it('emits enquiryForm:saved event after successful submission', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(wrapper.emitted('enquiryForm:saved')).toBeTruthy();
    });

    it('passes correct enquiryId to updateEnquiry on form submission', async () => {
      const testEnquiryCustom = { ...testEnquiry, enquiryId: 'custom-enquiry-id' };
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiryCustom, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(updateEnquirySpy).toHaveBeenCalledWith('custom-enquiry-id', expect.any(Object));
    });

    it('maps assigned user id from submissionState.assignedUser', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper, {
        ...submitValues,
        submissionState: {
          ...submitValues.submissionState,
          assignedUser: { userId: 'user-789' }
        }
      } as unknown as typeof submitValues);
      await flushPromises();
      await nextTick();

      expect(updateEnquirySpy).toHaveBeenCalledWith(
        'enquiry123',
        expect.objectContaining({
          assignedUserId: 'user-789'
        })
      );
    });

    it('sets atsClientId to null when a related activity id is submitted', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper, {
        ...submitValues,
        relatedActivityId: 'activity1',
        atsInfo: {
          atsClientId: 999,
          atsEnquiryId: null
        }
      } as unknown as typeof submitValues);
      await flushPromises();
      await nextTick();

      expect(updateEnquirySpy).toHaveBeenCalledWith(
        'enquiry123',
        expect.objectContaining({
          relatedActivityId: 'activity1',
          atsClientId: null
        })
      );
    });

    it('coerces empty-string relatedActivityId to null on submit', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper, {
        ...submitValues,
        relatedActivityId: '' as unknown as null,
        atsInfo: {
          atsClientId: null,
          atsEnquiryId: null
        }
      } as unknown as typeof submitValues);
      await flushPromises();
      await nextTick();

      expect(updateEnquirySpy).toHaveBeenCalledWith(
        'enquiry123',
        expect.objectContaining({
          relatedActivityId: null,
          atsClientId: null
        })
      );
    });

    it('does not emit saved event when updateEnquiry fails', async () => {
      vi.mocked(enquiryService.updateEnquiry).mockRejectedValueOnce(new Error('save failed'));
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(wrapper.emitted('enquiryForm:saved')).toBeUndefined();
    });
  });

  describe('Cancel Functionality - DOM Directed Testing', () => {
    it('displays cancel message when CancelButton emits clicked', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      const cancelButton = wrapper.findComponent({ name: 'CancelButton' });
      expect(cancelButton.exists()).toBe(true);
      cancelButton.vm.$emit('clicked');
      await nextTick();

      const message = wrapper.find('#cancelMessage');
      expect(message.exists()).toBe(true);
    });

    it('hides cancel message after timeout', async () => {
      vi.useFakeTimers();
      const scrollIntoViewSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => undefined);

      const wrapper = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      const cancelButton = wrapper.findComponent({ name: 'CancelButton' });
      cancelButton.vm.$emit('clicked');
      await nextTick();
      expect(wrapper.find('#cancelMessage').exists()).toBe(true);

      vi.advanceTimersByTime(6000);
      await nextTick();

      expect(wrapper.find('#cancelMessage').exists()).toBe(false);

      scrollIntoViewSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe('Related Activity Selection - DOM Directed Testing', () => {
    it('loads related activity options from project service', async () => {
      const component = mount(EnquiryForm, wrapperSettings());
      await flushPromises();
      await nextTick();

      const relatedActivitySelect = component.findComponent({ name: 'EditableSelect' });
      expect(relatedActivitySelect.exists()).toBe(true);
      expect(relatedActivitySelect.props('options')).toEqual(activityIdMockData);
      expect(getHousingActivityIdsSpy).toHaveBeenCalled();
    });

    it('filters related activity options on EditableSelect input', async () => {
      const component = mount(EnquiryForm, wrapperSettings());
      await flushPromises();
      await nextTick();

      const relatedActivitySelect = component.findComponent({ name: 'EditableSelect' });
      relatedActivitySelect.vm.$emit('onInput', { target: { value: '2' } });
      await flushPromises();
      await nextTick();

      expect(relatedActivitySelect.props('options')).toEqual(['activity2']);
    });

    it('searches projects and updates related ATS info on EditableSelect change', async () => {
      vi.mocked(housingProjectService.searchProjects).mockResolvedValueOnce(
        mockAxiosResponse([
          {
            atsClientId: 345,
            activity: {
              activityContact: [
                {
                  contact: {
                    contactId: 'contact123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneNumber: '555-1234',
                    email: 'john@example.com',
                    contactApplicantRelationship: ProjectRelationship.CONSULTANT,
                    contactPreference: ContactPreference.EITHER
                  }
                }
              ]
            }
          }
        ])
      );

      const component = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      const relatedActivitySelect = component.findComponent({ name: 'EditableSelect' });
      relatedActivitySelect.vm.$emit('onChange', { value: 'activity1' });
      await flushPromises();
      await nextTick();

      expect(searchHousingProjectsSpy).toHaveBeenCalledWith({ activityId: ['activity1'] });

      const formComponent = component.findComponent({ name: 'VeeFormStub' });
      const formValues = (
        formComponent.vm as unknown as {
          values: { atsClientId?: number; contact?: { firstName?: string; lastName?: string } };
        }
      ).values;
      expect(formValues.atsClientId).toBe(345);
      expect(formValues.contact?.firstName).toBe('John');
      expect(formValues.contact?.lastName).toBe('Doe');
    });

    it('does not search projects when related activity change value is empty', async () => {
      const component = mount(EnquiryForm, wrapperSettings(testEnquiry, true));
      await flushPromises();
      await nextTick();

      const relatedActivitySelect = component.findComponent({ name: 'EditableSelect' });
      relatedActivitySelect.vm.$emit('onChange', { value: '' });
      await flushPromises();
      await nextTick();

      expect(searchHousingProjectsSpy).not.toHaveBeenCalled();
    });
  });

  describe('Completion Status - DOM Directed Testing', () => {
    it('hides FormNavigationGuard when enquiry is completed', async () => {
      const completedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.COMPLETED };
      const wrapper = mount(EnquiryForm, wrapperSettings(completedEnquiry));
      await flushPromises();
      await nextTick();

      const navigationGuard = wrapper.findComponent({ name: 'FormNavigationGuard' });
      expect(navigationGuard.exists()).toBe(false);
    });

    it('shows FormNavigationGuard when enquiry is not completed', async () => {
      const notCompletedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.IN_PROGRESS };
      const wrapper = mount(EnquiryForm, wrapperSettings(notCompletedEnquiry));
      await flushPromises();
      await nextTick();

      const navigationGuard = wrapper.findComponent({ name: 'FormNavigationGuard' });
      expect(navigationGuard.exists()).toBe(true);
    });
  });

  describe('Nested Components - DOM Directed Testing', () => {
    it('renders core child components', async () => {
      const wrapper = mount(EnquiryForm, wrapperSettings());
      await flushPromises();
      await nextTick();

      const contactCard = wrapper.findComponent({ name: 'ContactCardNavForm' });
      const submissionState = wrapper.findComponent({ name: 'SubmissionStateSection' });
      const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
      expect(contactCard.exists()).toBe(true);
      expect(submissionState.exists()).toBe(true);
      expect(atsInfo.exists()).toBe(true);
    });

    it('renders ATSInfo component with correct props', async () => {
      const enquiryWithATS = {
        ...testEnquiry,
        atsClientId: 12345,
        atsEnquiryId: 67890
      };
      const wrapper = mount(EnquiryForm, wrapperSettings(enquiryWithATS));
      await flushPromises();
      await nextTick();

      const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
      expect(atsInfo.exists()).toBe(true);
      expect(atsInfo.props('atsClientId')).toBe(12345);
      expect(atsInfo.props('atsEnquiryId')).toBe(67890);
    });

    it('passes contact information to ATSInfo component', async () => {
      const enquiryWithContact = {
        ...testEnquiry,
        activity: {
          activityId: 'activity456',
          initiativeId: 'initiative123',
          activityContact: [
            {
              activityId: 'activity456',
              contactId: 'contact123',
              role: ActivityContactRole.PRIMARY,
              contact: {
                contactId: 'contact123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phoneNumber: '555-1234'
              }
            }
          ]
        }
      } as unknown as typeof testEnquiry;
      const wrapper = mount(EnquiryForm, wrapperSettings(enquiryWithContact));
      await flushPromises();
      await nextTick();

      const atsInfo = wrapper.findComponent({ name: 'ATSInfo' });
      expect(atsInfo.props('firstName')).toBe('John');
      expect(atsInfo.props('lastName')).toBe('Doe');
      expect(atsInfo.props('email')).toBe('john@example.com');
      expect(atsInfo.props('phoneNumber')).toBe('555-1234');
    });
  });
});
