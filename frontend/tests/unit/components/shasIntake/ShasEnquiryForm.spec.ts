import { createTestingPinia } from '@pinia/testing';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { nextTick } from 'vue';

import ShasEnquiryForm from '@/components/housing/intake/ShasEnquiryForm.vue';

import { StorageKey } from '@/utils/constants';
import {
  BASIC_RESPONSES,
  CONTACT_PREFERENCE_LIST,
  INTAKE_FORM_CATEGORIES,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/enums';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

interface FormValues {
  applicant: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    relationshipToProject?: string;
    contactPreference?: string;
  };
  basic: {
    isRelated?: string;
    relatedActivityId?: string;
    enquiryDescription?: string;
    applyForPermitConnect?: string;
  };
}

function basicValidFormValues(): FormValues {
  return {
    applicant: {
      firstName: 'testFirst',
      lastName: 'testLast',
      email: 'test@email.com',
      phoneNumber: '1234567890',
      relationshipToProject: PROJECT_RELATIONSHIP_LIST.OWNER,
      contactPreference: CONTACT_PREFERENCE_LIST.EMAIL
    },
    basic: {
      isRelated: 'Yes',
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

describe('ShasIntakeForm component tests', () => {
  it('renders component', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());
    expect(wrapper.isVisible()).toBeTruthy();
  });

  it('renders initial form fields', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const firstNameInput = wrapper.get('[name="applicant.firstName"]');
    const lastNameInput = wrapper.get('[name="applicant.lastName"]');
    const phoneInput = wrapper.get('[name="applicant.phoneNumber"]');
    const emailInput = wrapper.get('[name="applicant.email"]');
    const relationsInput = wrapper.get('[name="applicant.relationshipToProject"]');
    const contactInput = wrapper.get('[name="applicant.contactPreference"]');
    const relatedInput = wrapper.findAll('[name="basic.isRelated"]');

    expect(firstNameInput.isVisible()).toBeTruthy();
    expect(lastNameInput.isVisible()).toBeTruthy();
    expect(phoneInput.isVisible()).toBeTruthy();
    expect(emailInput.isVisible()).toBeTruthy();
    expect(relationsInput.isVisible()).toBeTruthy();
    expect(contactInput.isVisible()).toBeTruthy();
    expect(relatedInput[0].isVisible()).toBeTruthy();
    expect(relatedInput[1].isVisible()).toBeTruthy();

    const descriptionInput = wrapper.find('[name="basic.enquiryDescription"]');
    expect(descriptionInput.exists()).toBe(false);
  });

  it('renders the right input fields when isRelated is set to Yes', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());
    const relatedRadio = wrapper.findAll('[name="basic.isRelated"]');
    relatedRadio[0].setValue('Yes');
    await nextTick();

    const descriptionInput = wrapper.find('[name="basic.enquiryDescription"]');
    const activityIdInput = wrapper.find('[name="basic.relatedActivityId"]');

    expect(descriptionInput.isVisible()).toBeTruthy();
    expect(activityIdInput.isVisible()).toBeTruthy();
  });

  it('renders the right input fields when isRelated is set to No', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());
    const relatedRadio = wrapper.findAll('[name="basic.isRelated"]');
    relatedRadio[1].setValue('No');
    await nextTick();

    const descriptionInput = wrapper.find('[name="basic.enquiryDescription"]');
    const applyInput = wrapper.find('[name="basic.applyForPermitConnect"]');

    expect(descriptionInput.isVisible()).toBeTruthy();
    expect(applyInput.exists()).toBe(true);
  });

  it('disables submit when isRelated to existing application is No and applying to PCNS is Yes', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());
    const relatedRadio = wrapper.findAll('[name="basic.isRelated"]');
    relatedRadio[1].setValue('No');
    await nextTick();

    const applyInput = wrapper.findAll('[name="basic.applyForPermitConnect"]');
    applyInput[0].setValue('Yes');
    await nextTick();

    const submitBtn = wrapper.get('[type="submit"]');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('submit is enabled when isRelated to existing application is No applying to PCNS is No', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());
    const relatedRadio = wrapper.findAll('[name="basic.isRelated"]');
    relatedRadio[1].setValue('No');
    await nextTick();

    const applyInput = wrapper.findAll('[name="basic.applyForPermitConnect"]');
    applyInput[1].setValue('No');
    await nextTick();

    const submitBtn = wrapper.get('[type="submit"]');
    expect(submitBtn.attributes('disabled')).not.toBeDefined();
  });

  it('submit is enabled when Yes, No, or not selected for isRelated', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const submitBtn = wrapper.get('[type="submit"]');
    await nextTick();
    expect(submitBtn.attributes('disabled')).not.toBeDefined();

    const relatedRadio = wrapper.findAll('[name="basic.isRelated"]');
    relatedRadio[0].setValue('Yes');
    await nextTick();
    expect(submitBtn.attributes('disabled')).not.toBeDefined();

    relatedRadio[1].setValue('No');
    await nextTick();
    expect(submitBtn.attributes('disabled')).not.toBeDefined();
  });
});

describe('ShasIntakeForm validation tests', () => {
  it('accepts valid values (isRelated: Yes)', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;
    formRef.setValues(basicValidFormValues());

    const result = await formRef?.validate();
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('accepts valid values (isRelated: No, applyForPermitConnect: No)', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;

    const modifiedFormValues = {
      ...basicValidFormValues()
    };

    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].isRelated = BASIC_RESPONSES.NO;
    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].applyForPermitConnect = BASIC_RESPONSES.NO;
    formRef.setValues(modifiedFormValues);

    const result = await formRef?.validate();
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('accepts valid values (isRelated: No, applyForPermitConnect: No)', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;

    const modifiedFormValues = {
      ...basicValidFormValues()
    };

    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].isRelated = BASIC_RESPONSES.NO;
    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].applyForPermitConnect = BASIC_RESPONSES.NO;
    formRef.setValues(modifiedFormValues);

    const result = await formRef?.validate();
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('form generates email error', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;

    const modifiedFormValues = {
      ...basicValidFormValues()
    };

    modifiedFormValues[INTAKE_FORM_CATEGORIES.APPLICANT].email = 'bad@email';
    formRef.setValues(modifiedFormValues);

    const result = await formRef?.validate();
    expect(Object.keys(result.errors).length).toBe(1);
    expect(result.errors[`${[INTAKE_FORM_CATEGORIES.APPLICANT]}.email`]).toBeTruthy();
  });

  it('form generates missing first and last name missing error', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;

    const modifiedFormValues = {
      ...basicValidFormValues()
    };

    modifiedFormValues[INTAKE_FORM_CATEGORIES.APPLICANT].firstName = '';
    modifiedFormValues[INTAKE_FORM_CATEGORIES.APPLICANT].lastName = '';

    formRef.setValues(modifiedFormValues);

    const result = await formRef?.validate();
    expect(Object.keys(result.errors).length).toBe(2);
    expect(result.errors[`${[INTAKE_FORM_CATEGORIES.APPLICANT]}.firstName`]).toBeTruthy();
    expect(result.errors[`${[INTAKE_FORM_CATEGORIES.APPLICANT]}.lastName`]).toBeTruthy();
  });

  it('form generates errors for isRelated', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;

    const modifiedFormValues = {
      ...basicValidFormValues()
    };

    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].isRelated = 'test';

    formRef.setValues(modifiedFormValues);

    const result1 = await formRef?.validate();
    expect(Object.keys(result1.errors).length).toBe(1);
    expect(result1.errors[`${[INTAKE_FORM_CATEGORIES.BASIC]}.isRelated`]).toBeTruthy();
  });

  it('form generates errors for applyForPermitConnect', async () => {
    const wrapper = mount(ShasEnquiryForm, wrapperSettings());

    const formRef = (wrapper.vm as any)?.formRef;

    const modifiedFormValues = {
      ...basicValidFormValues()
    };
    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].isRelated = BASIC_RESPONSES.NO;
    modifiedFormValues[INTAKE_FORM_CATEGORIES.BASIC].applyForPermitConnect = 'test';

    formRef.setValues(modifiedFormValues);

    const result2 = await formRef?.validate();
    expect(Object.keys(result2.errors).length).toBe(1);
    expect(result2.errors[`${[INTAKE_FORM_CATEGORIES.BASIC]}.applyForPermitConnect`]).toBeTruthy();
  });
});
