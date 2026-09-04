import { flushPromises, mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import EnquiryForm from '@/components/enquiry/EnquiryForm.vue';
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
import { PRIMEVUE_STUBS, VEE_FORM_STUB } from '../../../helpers';
import { mountComponent } from '../../../mountComponent';
import { mockRouter, resetMockRouter } from '../../../mockRouter';

import type { Ref } from 'vue';
import type { Enquiry, HousingProject, Project, ProjectService, User } from '@/types';

// Mocks

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}));

// Fixtures

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

// Mount

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');
const patchEnquirySpy = vi.spyOn(enquiryService, 'patchEnquiry');
const listHousingActivityIdsSpy = vi.spyOn(housingProjectService, 'listActivityIds');
const listElectrificationActivityIdsSpy = vi.spyOn(electrificationProjectService, 'listActivityIds');
const searchHousingProjectsSpy = vi.spyOn(housingProjectService, 'searchProjects');

function mountEnquiryForm({
  enquiry = testEnquiry,
  editable,
  projectService = ref(housingProjectService),
  atsEnquiryPartnerAgencies = testAtsEnquiryPartnerAgencies,
  atsEnquiryTypeCode = testAtsEnquiryTypeCode
}: {
  enquiry?: Enquiry;
  editable?: boolean;
  projectService?: Ref<ProjectService<Project>>;
  atsEnquiryPartnerAgencies?: string;
  atsEnquiryTypeCode?: string;
} = {}) {
  const { wrapper } = mountComponent(EnquiryForm, {
    props: { editable, enquiry },
    piniaState: {},
    provide: {
      [projectServiceKey]: projectService,
      [atsEnquiryPartnerAgenciesKey]: atsEnquiryPartnerAgencies,
      [atsEnquiryTypeCodeKey]: atsEnquiryTypeCode
    },
    stubs: {
      ATSInfo: true,
      ContactCardNavForm: true,
      'font-awesome-icon': true,
      'router-link': true,
      'form-navigation-guard': true,
      'section-header': true,
      'ats-user-details-modal': true,
      'ats-user-create-modal': true,
      'ats-user-link-modal': true,
      Form: VEE_FORM_STUB,
      CancelButton: true,
      SubmissionStateSection: true,
      ...PRIMEVUE_STUBS
    }
  });

  return { wrapper };
}

// Tests

describe('EnquiryForm.vue', () => {
  beforeEach(() => {
    resetMockRouter();
    vi.clearAllMocks();
    vi.mocked(userService.searchUsers).mockResolvedValue([{ fullName: 'dummyName' }] as User[]);
    vi.mocked(enquiryService.patchEnquiry).mockResolvedValue({
      enquiryId: 'enquiry123',
      activityId: 'activity456'
    } as Enquiry);
    vi.mocked(housingProjectService.listActivityIds).mockResolvedValue(activityIdMockData);
    vi.mocked(electrificationProjectService.listActivityIds).mockResolvedValue(activityIdMockData);
    vi.mocked(housingProjectService.searchProjects).mockResolvedValue([]);
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
      const { wrapper } = mountEnquiryForm({ enquiry: mountEnquiry });
      await flushPromises();
      await nextTick();

      expect(wrapper.html()).toContain('John Doe');
    });

    it('renders the form only when initialFormValues is set', async () => {
      const { wrapper } = mountEnquiryForm();
      await flushPromises();
      await nextTick();

      const form = wrapper.find('.vee-form-stub');
      expect(form.exists()).toBe(true);
    });

    it('searches for users onMount when assignedUserId exists', async () => {
      const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUserId' };
      mountEnquiryForm({ enquiry: mountEnquiry });
      await flushPromises();
      await nextTick();

      expect(searchUsersSpy).toHaveBeenCalledTimes(1);
      expect(searchUsersSpy).toHaveBeenCalledWith({ userId: [mountEnquiry.assignedUserId] });
    });

    it('gets housing activity Ids onMount', async () => {
      const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUserId' };
      mountEnquiryForm({ enquiry: mountEnquiry, editable: true, projectService: ref(housingProjectService) });
      await flushPromises();
      await nextTick();

      expect(listHousingActivityIdsSpy).toHaveBeenCalledTimes(1);
    });

    it('gets electrification activity Ids onMount', async () => {
      const mountEnquiry = { ...testEnquiry, assignedUserId: 'testAssignedUserId' };
      mountEnquiryForm({ enquiry: mountEnquiry, editable: true, projectService: ref(electrificationProjectService) });
      await flushPromises();
      await nextTick();

      expect(listElectrificationActivityIdsSpy).toHaveBeenCalledTimes(1);
    });
    describe('mandatory fields', () => {
      describe('enquiryDescription', () => {
        it('displays asterisk', async () => {
          const { wrapper } = mountEnquiryForm();
          await flushPromises();
          await nextTick();

          // Find the h3 containing the enquiry detail header and verify asterisk
          const headers = wrapper.findAll('h3');
          let foundAsterisk = false;
          for (const header of headers) {
            const spans = header.findAll('span');
            if (spans.some((span) => span.text() === '*')) {
              foundAsterisk = true;
              break;
            }
          }

          expect(foundAsterisk).toBe(true);
        });
      });
    });
  });

  describe('Form Buttons - DOM Directed Testing', () => {
    it('displays Save and Cancel buttons when enquiry is not completed', async () => {
      const notCompletedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.NEW };
      const { wrapper } = mountEnquiryForm({ enquiry: notCompletedEnquiry, editable: true });
      await flushPromises();
      await nextTick();

      const submitButton = wrapper.find('button[type="submit"]');
      const cancelButton = wrapper.findComponent({ name: 'CancelButton' });
      expect(submitButton.exists()).toBe(true);
      expect(cancelButton.exists()).toBe(true);
    });

    it('disables Save button when editable prop is false', async () => {
      const { wrapper } = mountEnquiryForm({ editable: false });
      await flushPromises();
      await nextTick();

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.attributes('disabled')).toBeDefined();
    });

    it('hides Save and Cancel buttons when enquiry is completed', async () => {
      const completedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.COMPLETED };
      const { wrapper } = mountEnquiryForm({ enquiry: completedEnquiry, editable: true });
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
      const { wrapper } = mountEnquiryForm({ enquiry: enquiryWithDescription });
      await flushPromises();
      await nextTick();

      const formComponent = wrapper.findComponent({ name: 'VeeFormStub' });
      expect(formComponent.exists()).toBe(true);

      const formValues = (formComponent.vm as { values: { enquiryDescription?: string } }).values;
      expect(formValues.enquiryDescription).toBe('Test enquiry details');
    });

    it('disables enquiry description field when not editable', async () => {
      const { wrapper } = mountEnquiryForm({ editable: false });
      await flushPromises();
      await nextTick();

      const disabledTextareas = wrapper.findAll('textarea[disabled]');
      expect(disabledTextareas.length).toBeGreaterThan(0);
    });

    it('enables enquiry description field when editable', async () => {
      const { wrapper } = mountEnquiryForm({ editable: true });
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
      const { wrapper } = mountEnquiryForm({ editable: true });
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(patchEnquirySpy).toHaveBeenCalledTimes(1);
      expect(patchEnquirySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          enquiryId: 'enquiry123',
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
      const { wrapper } = mountEnquiryForm({ editable: true });
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(wrapper.emitted('enquiryForm:saved')).toBeTruthy();
    });

    it('passes correct enquiryId to updateEnquiry on form submission', async () => {
      const testEnquiryCustom = { ...testEnquiry, enquiryId: 'custom-enquiry-id' };
      const { wrapper } = mountEnquiryForm({ enquiry: testEnquiryCustom, editable: true });
      await flushPromises();
      await nextTick();

      await submitViaComponent(wrapper);
      await flushPromises();
      await nextTick();

      expect(patchEnquirySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          enquiryId: 'custom-enquiry-id'
        })
      );
    });

    it('maps assigned user id from submissionState.assignedUser', async () => {
      const { wrapper } = mountEnquiryForm({ editable: true });
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

      expect(patchEnquirySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          enquiryId: 'enquiry123',
          assignedUserId: 'user-789'
        })
      );
    });

    it('sets atsClientId to null when a related activity id is submitted', async () => {
      const { wrapper } = mountEnquiryForm({ editable: true });
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

      expect(patchEnquirySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          enquiryId: 'enquiry123',
          relatedActivityId: 'activity1',
          atsClientId: null
        })
      );
    });

    it('coerces empty-string relatedActivityId to null on submit', async () => {
      const { wrapper } = mountEnquiryForm({ editable: true });
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

      expect(patchEnquirySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          enquiryId: 'enquiry123',
          relatedActivityId: null,
          atsClientId: null
        })
      );
    });

    it('does not emit saved event when updateEnquiry fails', async () => {
      vi.mocked(enquiryService.patchEnquiry).mockRejectedValueOnce(new Error('save failed'));
      const { wrapper } = mountEnquiryForm({ editable: true });
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
      const { wrapper } = mountEnquiryForm({ editable: true });
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

      const { wrapper } = mountEnquiryForm({ editable: true });
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
      const { wrapper: component } = mountEnquiryForm();
      await flushPromises();
      await nextTick();

      const relatedActivitySelect = component.findComponent({ name: 'EditableSelect' });
      expect(relatedActivitySelect.exists()).toBe(true);
      expect(relatedActivitySelect.props('options')).toEqual(activityIdMockData);
      expect(listHousingActivityIdsSpy).toHaveBeenCalled();
    });

    it('filters related activity options on EditableSelect input', async () => {
      const { wrapper: component } = mountEnquiryForm();
      await flushPromises();
      await nextTick();

      const relatedActivitySelect = component.findComponent({ name: 'EditableSelect' });
      relatedActivitySelect.vm.$emit('onInput', { target: { value: '2' } });
      await flushPromises();
      await nextTick();

      expect(relatedActivitySelect.props('options')).toEqual(['activity2']);
    });

    it('searches projects and updates related ATS info on EditableSelect change', async () => {
      vi.mocked(housingProjectService.searchProjects).mockResolvedValueOnce([
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
        } as HousingProject
      ]);

      const { wrapper: component } = mountEnquiryForm({ editable: true });
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
          values: { atsInfo: { atsClientId?: number }; contact?: { firstName?: string; lastName?: string } };
        }
      ).values;
      expect(formValues.atsInfo.atsClientId).toBe(345);
      expect(formValues.contact?.firstName).toBe('John');
      expect(formValues.contact?.lastName).toBe('Doe');
    });

    it('does not search projects when related activity change value is empty', async () => {
      const { wrapper: component } = mountEnquiryForm({ editable: true });
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
      const { wrapper } = mountEnquiryForm({ enquiry: completedEnquiry });
      await flushPromises();
      await nextTick();

      const navigationGuard = wrapper.findComponent({ name: 'FormNavigationGuard' });
      expect(navigationGuard.exists()).toBe(false);
    });

    it('shows FormNavigationGuard when enquiry is not completed', async () => {
      const notCompletedEnquiry = { ...testEnquiry, enquiryStatus: ApplicationStatus.IN_PROGRESS };
      const { wrapper } = mountEnquiryForm({ enquiry: notCompletedEnquiry });
      await flushPromises();
      await nextTick();

      const navigationGuard = wrapper.findComponent({ name: 'FormNavigationGuard' });
      expect(navigationGuard.exists()).toBe(true);
    });
  });

  describe('Nested Components - DOM Directed Testing', () => {
    it('renders core child components', async () => {
      const { wrapper } = mountEnquiryForm();
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
      const { wrapper } = mountEnquiryForm({ enquiry: enquiryWithATS });
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
      const { wrapper } = mountEnquiryForm({ enquiry: enquiryWithContact });
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
