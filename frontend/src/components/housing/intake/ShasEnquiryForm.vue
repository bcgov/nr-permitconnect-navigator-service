<script setup lang="ts">
import { Form } from 'vee-validate';
import { onBeforeMount, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { object, string } from 'yup';

import { Dropdown, InputMask, RadioList, InputText, StepperNavigation, TextArea } from '@/components/form';
import CollectionDisclaimer from '@/components/housing/intake/CollectionDisclaimer.vue';
import { Button, Card, Divider, Message, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService, submissionService } from '@/services';
import { ContactPreferenceList, ProjectRelationshipList, Regex, RouteNames, YesNo } from '@/utils/constants';
import { BASIC_RESPONSES, INTAKE_FORM_CATEGORIES, INTAKE_STATUS_LIST } from '@/utils/enums';

import type { Ref } from 'vue';

// Props
type Props = {
  activityId?: string;
  enquiryId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  enquiryId: undefined
});

// State
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const validationErrors: Ref<string[]> = ref([]);

// Form validation schema
const formSchema = object({
  [INTAKE_FORM_CATEGORIES.APPLICANT]: object({
    firstName: string().required().max(255).label('First name'),
    lastName: string().required().max(255).label('Last name'),
    phoneNumber: string().required().max(255).label('Phone number'),
    email: string().matches(new RegExp(Regex.EMAIL), 'Email must be valid').required().label('Email'),
    relationshipToProject: string().required().oneOf(ProjectRelationshipList).label('Relationship to project'),
    contactPreference: string().required().oneOf(ContactPreferenceList).label('Contact Preference')
  }),
  [INTAKE_FORM_CATEGORIES.BASIC]: object({
    isRelated: string().required().oneOf(YesNo).label('Related to existing application'),
    relatedActivityId: string().when('isRelated', {
      is: (isRelated: string) => isRelated === BASIC_RESPONSES.YES,
      then: (schema) => schema.required().max(255).label('Confirmation ID')
    }),
    enquiryDescription: string().required().label('Enquiry'),
    applyForPermitConnect: string()
      .label('Service application')
      .when('isRelated', {
        is: (isRelated: string) => isRelated === BASIC_RESPONSES.NO,
        then: (schema) => schema.required().oneOf(YesNo)
      })
  })
});

// Actions
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

function confirmLeave() {
  confirm.require({
    message: 'Are you sure you want to leave this page? Any unsaved changes will be lost. Please save as draft first.',
    header: 'Leave this page?',
    acceptLabel: 'Leave',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => router.push({ name: RouteNames.HOUSING })
  });
}

async function confirmNext(data: any) {
  const validateResult = await formRef?.value?.validate();
  if (!validateResult?.valid) return;

  confirm.require({
    /* eslint-disable max-len */
    message:
      'After confirming, your enquiry will be submitted, and you will be directed to register your project with a Navigator.',
    /*eslint-enable max-len */
    header: 'Please confirm',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onSubmit(toRaw(data))
  });
}

function confirmSubmit(data: any) {
  confirm.require({
    message: 'Are you sure you wish to submit this form? Please review the form before submitting.',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onSubmit(data)
  });
}

function displayErrors(a: any) {
  validationErrors.value = Array.from(new Set(a.errors ? Object.keys(a.errors).map((x) => x.split('.')[0]) : []));
  document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSaveDraft(data: any) {
  editable.value = false;

  try {
    let response;
    if (data.enquiryId) {
      response = await enquiryService.updateDraft(data.enquiryId, data);
    } else {
      response = await enquiryService.createDraft(data);
    }

    if (response.data.enquiryId && response.data.activityId) {
      formRef.value?.setFieldValue('enquiryId', response.data.enquiryId);
      formRef.value?.setFieldValue('activityId', response.data.activityId);
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }

    toast.success('Draft saved');
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  } finally {
    editable.value = true;
  }
}

async function onSubmit(data: any) {
  editable.value = false;

  let enquiryResponse, submissionResponse;

  try {
    // Need to first create the submission to relate to if asking to apply
    if (data.basic.applyForPermitConnect) {
      submissionResponse = await submissionService.createDraft({ applicant: data.applicant });
      if (submissionResponse.data.activityId) {
        formRef.value?.setFieldValue('basic.relatedActivityId', submissionResponse.data.activityId);
      } else {
        throw new Error('Failed to retrieve correct submission draft data');
      }
    }

    if (data.enquiryId) {
      enquiryResponse = await enquiryService.updateDraft(data.enquiryId, { ...data, submit: true });
    } else {
      enquiryResponse = await enquiryService.createDraft({ ...data, submit: true });
    }

    if (enquiryResponse.data.activityId) {
      assignedActivityId.value = enquiryResponse.data.activityId;
      formRef.value?.setFieldValue('activityId', enquiryResponse.data.activityId);
      formRef.value?.setFieldValue('enquiryId', enquiryResponse.data.enquiryId);
    } else {
      throw new Error('Failed to retrieve correct enquiry draft data');
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;

    if (data.basic.applyForPermitConnect === BASIC_RESPONSES.YES) {
      router.push({
        name: RouteNames.HOUSING_INTAKE,
        query: {
          activityId: submissionResponse?.data.activityId,
          submissionId: submissionResponse?.data.submissionId
        }
      });
    }
  }
}

onBeforeMount(async () => {
  let response;
  if (props.activityId) {
    response = (await enquiryService.getEnquiry(props.activityId)).data;
    editable.value = response.intakeStatus === INTAKE_STATUS_LIST.DRAFT;
  }

  // Default form values
  initialFormValues.value = {
    activityId: response?.activityId,
    enquiryId: response?.enquiryId,
    applicant: {
      firstName: response?.contactFirstName,
      lastName: response?.contactLastName,
      phoneNumber: response?.contactPhoneNumber,
      email: response?.contactEmail,
      relationshipToProject: response?.contactApplicantRelationship,
      contactPreference: response?.contactPreference
    }
  };
});
</script>

<template>
  <div v-if="!assignedActivityId">
    <Button
      class="mb-3 p-0"
      text
      @click="confirmLeave"
    >
      <font-awesome-icon
        icon="fa fa-arrow-circle-left"
        class="mr-1"
      />
      <span>Back to Housing</span>
    </Button>

    <CollectionDisclaimer />

    <Form
      v-if="initialFormValues"
      v-slot="{ values }"
      ref="formRef"
      keep-values
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @invalid-submit="(e) => displayErrors(e)"
      @submit="confirmSubmit"
    >
      <input
        type="hidden"
        name="activityId"
      />

      <input
        type="hidden"
        name="enquiryId"
      />

      <Card>
        <template #title>
          <span class="section-header">Who is the primary contact regarding this project?</span>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="formgrid grid">
            <InputText
              class="col-6"
              name="applicant.firstName"
              label="First name"
              :bold="false"
              :disabled="!editable"
            />
            <InputText
              class="col-6"
              name="applicant.lastName"
              label="Last name"
              :bold="false"
              :disabled="!editable"
            />
            <InputMask
              class="col-6"
              name="applicant.phoneNumber"
              mask="(999) 999-9999"
              label="Phone number"
              :bold="false"
              :disabled="!editable"
            />
            <InputText
              class="col-6"
              name="applicant.email"
              label="Email"
              :bold="false"
              :disabled="!editable"
            />
            <Dropdown
              class="col-6"
              name="applicant.relationshipToProject"
              label="Relationship to project"
              :bold="false"
              :disabled="!editable"
              :options="ProjectRelationshipList"
            />
            <Dropdown
              class="col-6"
              name="applicant.contactPreference"
              label="Preferred contact method"
              :bold="false"
              :disabled="!editable"
              :options="ContactPreferenceList"
            />
          </div>
        </template>
      </Card>
      <Card>
        <template #title>
          <span class="section-header">
            Is this enquiry related to an existing project that you are working on with a Navigator?
          </span>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="formgrid grid">
            <RadioList
              class="col-12"
              name="basic.isRelated"
              :bold="false"
              :disabled="!editable"
              :options="YesNo"
            />
          </div>
        </template>
      </Card>
      <Card v-if="values.basic?.isRelated === BASIC_RESPONSES.YES">
        <template #title>
          <div class="flex">
            <span class="section-header">
              Enter the confirmation ID given to you when you registered your project with a Navigator
            </span>
            <div
              v-tooltip.right="
                `Confirmation ID can be found in the confirmation email you received at the time of submission.`
              "
            >
              <font-awesome-icon icon="fa-solid fa-circle-question" />
            </div>
          </div>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="formgrid grid">
            <InputText
              class="col-6"
              name="basic.relatedActivityId"
              placeholder="Confirmation ID"
              :disabled="!editable"
            />
          </div>
        </template>
      </Card>
      <Card v-if="values.basic?.isRelated !== undefined">
        <template #title>
          <span class="section-header">Tell us about your enquiry</span>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="formgrid grid">
            <TextArea
              class="col-12"
              name="basic.enquiryDescription"
              placeholder="Type here..."
              :disabled="!editable"
            />
          </div>
        </template>
      </Card>
      <Card v-if="values.basic?.isRelated === BASIC_RESPONSES.NO">
        <template #title>
          <div class="flex">
            <span class="section-header">Would you like to register your project with a Navigator?</span>
            <div v-tooltip.right="`Consider registering if you are working or getting started on a housing project.`">
              <font-awesome-icon icon="fa-solid fa-circle-question" />
            </div>
          </div>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="formgrid grid">
            <RadioList
              class="col-12"
              name="basic.applyForPermitConnect"
              :bold="false"
              :disabled="!editable"
              :options="YesNo"
            />
            <div
              v-if="values.basic?.applyForPermitConnect === BASIC_RESPONSES.YES"
              class="col-12 text-blue-500"
            >
              Please proceed to the next page to register your project with a Navigator.
            </div>
          </div>
        </template>
      </Card>
      <StepperNavigation
        :editable="editable"
        :next-callback="() => confirmNext(values)"
        :prev-disabled="true"
        :next-disabled="values.basic?.applyForPermitConnect !== BASIC_RESPONSES.YES"
      >
        <template #content>
          <Button
            class="p-button-sm"
            outlined
            label="Save draft"
            :disabled="!editable"
            @click="onSaveDraft(values)"
          />
        </template>
      </StepperNavigation>
      <div class="flex align-items-center justify-content-center mt-4">
        <Button
          label="Submit"
          type="submit"
          icon="pi pi-upload"
          :disabled="!editable || values.basic?.applyForPermitConnect === BASIC_RESPONSES.YES"
        />
      </div>
    </Form>
  </div>
  <div v-else>
    <h2>Confirmation of Submission</h2>
    <Message
      class="border-none"
      severity="success"
      :closable="false"
    >
      Your enquiry has been succesfully submitted.
    </Message>
    <h3>Confirmation ID: {{ assignedActivityId }}</h3>
    <div>
      A Housing Navigator will review your submission and contact you. Please check your email for the confirmation
      email and keep the confirmation ID for future reference.
    </div>
    <div class="mt-4"><router-link :to="{ name: RouteNames.HOME }">Go to Homepage</router-link></div>
  </div>
</template>

<style scoped lang="scss">
.disclaimer {
  font-weight: 500;
}

.p-card {
  border-color: rgb(242, 241, 241);
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 1rem;

  .section-header {
    padding-left: 1rem;
    padding-right: 0.5rem;
  }

  :deep(.p-card-title) {
    font-size: 1rem;
  }

  :deep(.p-card-body) {
    padding-bottom: 0.5rem;

    padding-left: 0;
    padding-right: 0;
  }

  :deep(.p-card-content) {
    padding-bottom: 0;
    padding-top: 0;

    padding-left: 1rem;
    padding-right: 1rem;
  }
}

:deep(.p-message-wrapper) {
  padding: 0.5rem;
}

:deep(.p-invalid),
:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: $app-error !important;
}
</style>
