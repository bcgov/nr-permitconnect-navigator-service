import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { nextTick } from 'vue';
import { flushPromises, mount, RouterLinkStub, shallowMount } from '@vue/test-utils';

import EnquiryIntakeForm from '@/components/enquiry/EnquiryIntakeForm.vue';
import { contactService, enquiryService, housingProjectService } from '@/services';
import { StorageKey } from '@/utils/enums/application';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { AxiosResponse } from 'axios';
import type { Contact } from '@/types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {}
  }),
  onBeforeRouteUpdate: vi.fn(),
  onBeforeRouteLeave: vi.fn()
}));
const sampleContact: Contact = {
  contactId: 'contact123',
  userId: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '123-456-7890',
  email: 'john.doe@example.com',
  contactPreference: ContactPreference.EITHER,
  contactApplicantRelationship: ProjectRelationship.CONSULTANT,
  createdBy: 'testCreatedBy',
  createdAt: new Date().toISOString(),
  updatedBy: 'testUpdatedAt',
  updatedAt: new Date().toISOString()
};

const getActivityIds = vi.spyOn(housingProjectService, 'getActivityIds');
const getProjects = vi.spyOn(housingProjectService, 'getProjects');
const getContactSpy = vi.spyOn(contactService, 'searchContacts');

getActivityIds.mockResolvedValue({ data: ['someActivityid'] } as AxiosResponse);
getProjects.mockResolvedValue({ data: [{ activityId: 'someActivityid' }] } as AxiosResponse);
getContactSpy.mockResolvedValue({ data: [sampleContact] } as AxiosResponse);
interface FormValues {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactApplicantRelationship: ProjectRelationship;
  contactPreference: ContactPreference;
  contactId?: string;
  basic: {
    relatedActivityId?: string;
    enquiryDescription?: string;
  };
}

function basicValidFormValues(): FormValues {
  return {
    contactFirstName: 'testFirst',
    contactLastName: 'testLast',
    contactEmail: 'test@email.com',
    contactPhoneNumber: '1234567890',
    contactApplicantRelationship: ProjectRelationship.OWNER,
    contactPreference: ContactPreference.EMAIL,
    contactId: 'someId',
    basic: {
      enquiryDescription: 'test description',
      relatedActivityId: 'some Id'
    }
  };
}

const wrapperSettings = () => ({
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
    stubs: {
      RouterLink: RouterLinkStub,
      'font-awesome-icon': true
    },
    directives: {
      Tooltip: Tooltip
    }
  }
});

beforeEach(() => {
  sessionStorage.setItem(
    StorageKey.CONFIG,
    JSON.stringify({
      oidc: {
        authority: 'abc',
        clientId: '123'
      }
    })
  );

  vi.clearAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('EnquiryIntakeForm', () => {
  describe('component', async () => {
    it('renders component', async () => {
      const wrapper = mount(EnquiryIntakeForm, wrapperSettings());
      await flushPromises();

      expect(wrapper.isVisible()).toBeTruthy();
    });

    it('renders initial form fields', async () => {
      const wrapper = mount(EnquiryIntakeForm, wrapperSettings());
      await flushPromises();

      const firstNameInput = wrapper.get('[name="contactFirstName"]');
      const lastNameInput = wrapper.get('[name="contactLastName"]');
      const phoneInput = wrapper.get('[name="contactPhoneNumber"]');
      const emailInput = wrapper.get('[name="contactEmail"]');

      expect(firstNameInput.isVisible()).toBeTruthy();
      expect(lastNameInput.isVisible()).toBeTruthy();
      expect(phoneInput.isVisible()).toBeTruthy();
      expect(emailInput.isVisible()).toBeTruthy();

      const descriptionInput = wrapper.find('[name="basic.enquiryDescription"]');
      expect(descriptionInput.exists()).toBe(true);
    });
  });

  describe('validation', async () => {
    it('generates email error', async () => {
      const wrapper = mount(EnquiryIntakeForm, wrapperSettings());
      await flushPromises();

      const formRef = (wrapper.vm as any)?.formRef; // eslint-disable-line @typescript-eslint/no-explicit-any

      const modifiedFormValues = {
        ...basicValidFormValues()
      };

      modifiedFormValues.contactEmail = 'bad@email';
      formRef.setValues(modifiedFormValues);

      const result = await formRef?.validate();
      expect(Object.keys(result.errors).length).toBe(1);
      expect(result.errors['contactEmail']).toBeTruthy();
    });

    it('generates missing first name error', async () => {
      const wrapper = mount(EnquiryIntakeForm, wrapperSettings());
      await flushPromises();

      const formRef = (wrapper.vm as any)?.formRef; // eslint-disable-line @typescript-eslint/no-explicit-any

      const modifiedFormValues = {
        ...basicValidFormValues()
      };

      modifiedFormValues.contactFirstName = '';

      formRef.setValues(modifiedFormValues);

      const result = await formRef?.validate();
      expect(Object.keys(result.errors).length).toBe(1);
      expect(result.errors['contactFirstName']).toBeTruthy();
    });
  });
  it('sets editable to false when enquiry ID given', async () => {
    const getEnquirySpy = vi.spyOn(enquiryService, 'getEnquiry');

    getEnquirySpy.mockResolvedValue({ data: { activityId: '123', enquiryId: '456' } } as AxiosResponse);

    const wrapper = shallowMount(EnquiryIntakeForm, {
      ...wrapperSettings(),
      props: { enquiryId: '456' }
    });

    await nextTick();
    await flushPromises();

    const editable = (wrapper.vm as any)?.editable; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(editable).toBeFalsy();
  });
});
