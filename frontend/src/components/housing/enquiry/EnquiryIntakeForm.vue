<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string } from 'yup';

import BackButton from '@/components/common/BackButton.vue';
import {
  EditableSelect,
  FormNavigationGuard,
  InputMask,
  InputText,
  RadioList,
  Select,
  StepperNavigation,
  TextArea,
  FormAutosave
} from '@/components/form';
import CollectionDisclaimer from '@/components/housing/CollectionDisclaimer.vue';
import EnquiryIntakeConfirmation from '@/components/housing/enquiry/EnquiryIntakeConfirmation.vue';
import { Button, Card, Divider, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService, submissionService } from '@/services';
import { useConfigStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/housing';
import { BasicResponse, Regex, RouteName } from '@/utils/enums/application';
import { IntakeFormCategory, IntakeStatus } from '@/utils/enums/housing';
import { confirmationTemplateEnquiry } from '@/utils/templates';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Submission } from '@/types';

// Props
const { enquiryId = undefined } = defineProps<{
  enquiryId?: string;
}>();

// Store
const { getConfig } = storeToRefs(useConfigStore());

// State
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const editable: Ref<boolean> = ref(true);
const filteredProjectActivityIds: Ref<Array<string>> = ref([]);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<undefined | object> = ref(undefined);
const projectActivityIds: Ref<Array<string>> = ref([]);
const submissions: Ref<Array<Submission>> = ref([]);
const validationErrors: Ref<string[]> = ref([]);

// Form validation schema
const formSchema = object({
  [IntakeFormCategory.APPLICANT]: object({
    contactFirstName: string().required().max(255).label('First name'),
    contactLastName: string().required().max(255).label('Last name'),
    contactPhoneNumber: string().required().max(255).label('Phone number'),
    contactEmail: string().matches(new RegExp(Regex.EMAIL), 'Email must be valid').required().label('Email'),
    contactApplicantRelationship: string().required().oneOf(PROJECT_RELATIONSHIP_LIST).label('Relationship to project'),
    contactPreference: string().required().oneOf(CONTACT_PREFERENCE_LIST).label('Contact Preference')
  }),
  [IntakeFormCategory.BASIC]: object({
    isRelated: string().required().oneOf(YES_NO_LIST).label('Related to existing application'),
    relatedActivityId: string().when('isRelated', {
      is: (isRelated: string) => isRelated === BasicResponse.YES,
      then: (schema) => schema.required().max(255).label('Confirmation ID'),
      otherwise: (schema) => schema.notRequired().label('Confirmation ID')
    }),
    enquiryDescription: string().required().label('Enquiry'),
    applyForPermitConnect: string()
      .label('Service application')
      .when('isRelated', {
        is: (isRelated: string) => isRelated === BasicResponse.NO,
        then: (schema) => schema.required().oneOf(YES_NO_LIST),
        otherwise: (schema) => schema.notRequired()
      })
  })
});

// Actions
const confirm = useConfirm();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const getBackButtonConfig = computed(() => {
  if (route.query.activityId) {
    return {
      text: 'Back to my drafts and previous entries',
      routeName: RouteName.HOUSING_SUBMISSIONS
    };
  } else {
    return {
      text: 'Back to Housing',
      routeName: RouteName.HOUSING
    };
  }
});

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
    rejectProps: { outlined: true },
    accept: () => onSubmit(toRaw(data))
  });
}

function confirmSubmit(data: any) {
  confirm.require({
    message: 'Are you sure you wish to submit this form? Please review the form before submitting.',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => onSubmit(data)
  });
}

async function emailConfirmation(activityId: string, enquiryId: string) {
  const configCC = getConfig.value.ches?.submission?.cc;

  // Get the first two sentences of the enquiry description
  // If there are more than two sentences in enquiryDescription, add '..' to the end
  const enquiryDescription = formRef.value?.values.basic.enquiryDescription || '';
  let firstTwoSentences = enquiryDescription.split('.').slice(0, 2).join('.') + '.';
  const sentences = enquiryDescription.split('.').filter((sentence: string) => sentence.trim().length > 0);
  firstTwoSentences = sentences.length > 2 ? firstTwoSentences.concat('..') : firstTwoSentences;

  const body = confirmationTemplateEnquiry({
    '{{ contactName }}': formRef.value?.values.applicant.contactFirstName,
    '{{ activityId }}': activityId,
    '{{ enquiryDescription }}': firstTwoSentences.trim(),
    '{{ enquiryId }}': enquiryId
  });
  let applicantEmail = formRef.value?.values.applicant.contactEmail;
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: 'Confirmation of Submission', // eslint-disable-line quotes
    bodyType: 'html',
    body: body
  };
  await submissionService.emailConfirmation(emailData);
}

async function loadEnquiry() {
  try {
    let response;

    if (enquiryId) {
      response = (await enquiryService.getEnquiry(enquiryId as string)).data;
      editable.value = response?.intakeStatus === IntakeStatus.DRAFT;
    }

    initialFormValues.value = {
      activityId: response?.activityId,
      enquiryId: response?.enquiryId,
      applicant: {
        contactFirstName: response?.contactFirstName,
        contactLastName: response?.contactLastName,
        contactPhoneNumber: response?.contactPhoneNumber,
        contactEmail: response?.contactEmail,
        contactApplicantRelationship: response?.contactApplicantRelationship,
        contactPreference: response?.contactPreference
      },
      basic: {
        isRelated: response?.isRelated,
        relatedActivityId: response?.relatedActivityId,
        enquiryDescription: response?.enquiryDescription,
        applyForPermitConnect: response?.applyForPermitConnect
      }
    };
  } catch (e: any) {
    router.replace({ name: RouteName.HOUSING_ENQUIRY_INTAKE });
  }
}

function onInvalidSubmit(e: any) {
  validationErrors.value = Array.from(new Set(e.errors ? Object.keys(e.errors).map((x) => x.split('.')[0]) : []));
  document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSaveDraft(data: any, isAutoSave = false) {
  editable.value = false;

  autoSaveRef.value?.stopAutoSave();

  try {
    let response = await enquiryService.updateDraft(data);

    if (response.data.activityId && response.data.enquiryId) {
      formRef.value?.setFieldValue('activityId', response.data.activityId);
      formRef.value?.setFieldValue('enquiryId', response.data.enquiryId);

      // Update route query for refreshing
      router.replace({
        name: RouteName.HOUSING_ENQUIRY_INTAKE,
        query: {
          activityId: response.data.activityId,
          enquiryId: response.data.enquiryId
        }
      });
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }

    if (isAutoSave) {
      toast.success('Draft autosaved');
    } else {
      toast.success('Draft saved');
    }
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  } finally {
    editable.value = true;
  }
}

function onRelatedActivityInput(e: IInputEvent) {
  filteredProjectActivityIds.value = projectActivityIds.value.filter((id) =>
    id.toUpperCase().includes(e.target.value.toUpperCase())
  );
}

async function onSubmit(data: any) {
  editable.value = false;

  let enquiryResponse, submissionResponse;

  autoSaveRef.value?.stopAutoSave();

  try {
    // Need to first create the submission to relate to if asking to apply
    if (data.basic.applyForPermitConnect === BasicResponse.YES) {
      submissionResponse = await submissionService.submitDraft({ applicant: data.applicant });
      if (submissionResponse.data.activityId) {
        formRef.value?.setFieldValue('basic.relatedActivityId', submissionResponse.data.activityId);
      } else {
        throw new Error('Failed to retrieve correct submission draft data');
      }
    }

    enquiryResponse = await enquiryService.submitDraft(data);

    if (enquiryResponse.data.activityId && enquiryResponse.data.enquiryId) {
      assignedActivityId.value = enquiryResponse.data.activityId;
      formRef.value?.setFieldValue('activityId', enquiryResponse.data.activityId);
      formRef.value?.setFieldValue('enquiryId', enquiryResponse.data.enquiryId);

      // Update route query for refreshing
      router.replace({
        name: RouteName.HOUSING_ENQUIRY_INTAKE,
        query: {
          activityId: enquiryResponse.data.activityId,
          enquiryId: enquiryResponse.data.enquiryId
        }
      });

      // Send confirmation email
      emailConfirmation(enquiryResponse.data.activityId, enquiryResponse.data.enquiryId);
    } else {
      throw new Error('Failed to retrieve correct enquiry draft data');
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;

    if (data.basic.applyForPermitConnect === BasicResponse.YES) {
      router.push({
        name: RouteName.HOUSING_SUBMISSION_INTAKE,
        query: {
          activityId: submissionResponse?.data.activityId,
          submissionId: submissionResponse?.data.submissionId
        }
      });
    }
  }
}

onBeforeMount(async () => {
  loadEnquiry();
  projectActivityIds.value = filteredProjectActivityIds.value = (await submissionService.getActivityIds()).data;
  submissions.value = (await submissionService.getSubmissions()).data;
});
</script>

<template>
  <div v-if="!assignedActivityId">
    <div class="mb-2 p-0">
      <BackButton
        :route-name="getBackButtonConfig.routeName"
        :text="getBackButtonConfig.text"
      />
    </div>
    <div class="flex justify-content-center align-items-center app-primary-color mb-2 mt-3">
      <h3>Enquiry Form</h3>
    </div>

    <CollectionDisclaimer />

    <Form
      v-if="initialFormValues"
      v-slot="{ values }"
      ref="formRef"
      keep-values
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @invalid-submit="(e) => onInvalidSubmit(e)"
      @submit="confirmSubmit"
    >
      <FormNavigationGuard v-if="editable" />
      <FormAutosave
        ref="autoSaveRef"
        :callback="() => onSaveDraft(values, true)"
      />

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
              name="applicant.contactFirstName"
              label="First name"
              :bold="false"
              :disabled="!editable"
            />
            <InputText
              class="col-6"
              name="applicant.contactLastName"
              label="Last name"
              :bold="false"
              :disabled="!editable"
            />
            <InputMask
              class="col-6"
              name="applicant.contactPhoneNumber"
              mask="(999) 999-9999"
              label="Phone number"
              :bold="false"
              :disabled="!editable"
            />
            <InputText
              class="col-6"
              name="applicant.contactEmail"
              label="Email"
              :bold="false"
              :disabled="!editable"
            />
            <Select
              class="col-6"
              name="applicant.contactApplicantRelationship"
              label="Relationship to project"
              :bold="false"
              :disabled="!editable"
              :options="PROJECT_RELATIONSHIP_LIST"
            />
            <Select
              class="col-6"
              name="applicant.contactPreference"
              label="Preferred contact method"
              :bold="false"
              :disabled="!editable"
              :options="CONTACT_PREFERENCE_LIST"
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
              :options="YES_NO_LIST"
              @on-click="
                (e: string) => {
                  if (e === BasicResponse.YES) formRef?.setFieldValue('basic.relatedActivityId', null);
                  else if (e === BasicResponse.NO) formRef?.setFieldValue('basic.applyForPermitConnect', null);
                }
              "
            />
          </div>
        </template>
      </Card>
      <Card v-if="values.basic?.isRelated === BasicResponse.YES">
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
            <EditableSelect
              class="col-3"
              name="basic.relatedActivityId"
              label="Confirmation ID"
              :disabled="!editable"
              :options="filteredProjectActivityIds"
              :get-option-label="
                (e: string) => {
                  const name = submissions.find((x) => x.activityId === e)?.projectName;
                  if (name) return `${e} - ${name}`;
                  else return e;
                }
              "
              @on-input="onRelatedActivityInput"
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
      <Card v-if="values.basic?.isRelated === BasicResponse.NO">
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
              :options="YES_NO_LIST"
            />
            <div
              v-if="values.basic?.applyForPermitConnect === BasicResponse.YES && editable"
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
        :next-disabled="values.basic?.applyForPermitConnect !== BasicResponse.YES || !editable"
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
          :disabled="!editable || values.basic?.applyForPermitConnect === BasicResponse.YES"
        />
      </div>
    </Form>
  </div>
  <EnquiryIntakeConfirmation
    v-else
    :assigned-activity-id="assignedActivityId"
  />
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
