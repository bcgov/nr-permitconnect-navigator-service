<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { object, string } from 'yup';

import Divider from '@/components/common/Divider.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { FormNavigationGuard, InputMask, InputText, Select, TextArea } from '@/components/form';
import { CollectionDisclaimer } from '@/components/form/common';
import { Button, Card, useConfirm, useToast } from '@/lib/primevue';
import { activityContactService, contactService, enquiryService } from '@/services';
import { useAppStore, useConfigStore, useContactStore } from '@/store';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { IntakeFormCategory, IntakeStatus } from '@/utils/enums/projectCommon';
import {
  enquiryConfirmRouteNameKey,
  enquiryPermitConfirmRouteNameKey,
  enquiryProjectConfirmRouteNameKey,
  enquiryRouteNameKey,
  projectServiceKey
} from '@/utils/keys';
import { confirmationTemplateEnquiry } from '@/utils/templates';
import { omit } from '@/utils/utils';
import { contactValidator } from '@/validators';

import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { ElectrificationProject, Enquiry, HousingProject, Permit } from '@/types';
import { Initiative, RouteName } from '@/utils/enums/application';

// Props
const { enquiryId, project, permit } = defineProps<{
  enquiryId?: string;
  project?: ElectrificationProject | HousingProject;
  permit?: Permit;
}>();

// Injections
const enquiryConfirmRouteName = inject(enquiryConfirmRouteNameKey);
const enquiryPermitConfirmRouteName = inject(enquiryPermitConfirmRouteNameKey);
const enquiryProjectConfirmRouteName = inject(enquiryProjectConfirmRouteNameKey);
const enquiryRouteName = inject(enquiryRouteNameKey);
const projectService = inject(projectServiceKey);

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

// Store
const appStore = useAppStore();
const contactStore = useContactStore();
const { getConfig } = storeToRefs(useConfigStore());
const { getInitiative } = storeToRefs(appStore);

// State
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<undefined | GenericObject> = ref(undefined);
const validationErrors: Ref<string[]> = ref([]);

const isOnlyProjectRelated: Ref<boolean> = computed(() => Boolean(project && !permit));
const isPermitRelated: Ref<boolean> = computed(() => Boolean(permit));
const trackingId: Ref<string> = computed(() => {
  return permit?.permitTracking?.find((x) => x.shownToProponent)?.trackingId || t('enquiryIntakeForm.notApplicable');
});

// Form validation schema
const formSchema = object({
  ...contactValidator,
  [IntakeFormCategory.BASIC]: object({
    enquiryDescription: string().required().label('Enquiry')
  })
});

// Actions
function confirmSubmit(data: any) {
  confirm.require({
    message: 'Are you sure you wish to submit this form?',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => onSubmit(data)
  });
}

async function emailConfirmation(activityId: string, enquiryId: string) {
  const configCC = getConfig.value.ches?.submission?.cc;
  let permitDescription: string = '';
  let enquiryDescription: string = formRef.value?.values.basic.enquiryDescription || '';
  let firstTwoSentences: string;

  // If has permit description convert \n to <br>
  if (enquiryDescription.includes('Tracking ID:')) {
    const descriptionSplit = enquiryDescription.split('\n\n');
    permitDescription = descriptionSplit[0]?.replace(/\n/g, '<br>') + '<br><br>';
    enquiryDescription = descriptionSplit.slice(1, descriptionSplit.length).join(' ');
  }

  // Get the first two sentences of the enquiry description
  // If there are more than two sentences in enquiryDescription, add '..' to the end
  firstTwoSentences = enquiryDescription.split('.').slice(0, 2).join('.') + '.';
  const sentences = enquiryDescription.split('.').filter((sentence: string) => sentence.trim().length > 0);
  firstTwoSentences = sentences.length > 2 ? firstTwoSentences.concat('..') : firstTwoSentences;

  if (permitDescription) firstTwoSentences = permitDescription + firstTwoSentences;

  const body = confirmationTemplateEnquiry({
    '{{ contactName }}': formRef.value?.values.contactFirstName,
    '{{ activityId }}': activityId,
    '{{ enquiryDescription }}': firstTwoSentences.trim(),
    '{{ enquiryId }}': enquiryId,
    '{{ projectId }}': project?.projectId ?? undefined,
    '{{ initiative }}': getInitiative.value.toLowerCase()
  });
  let applicantEmail = formRef.value?.values.contactEmail;
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: 'Confirmation of Enquiry Submission',
    bodyType: 'html',
    body: body
  };
  if (!projectService) throw new Error('No service');
  await projectService.emailConfirmation(emailData);
}

function getEnquiryConfirmationRoute(enquiry: Enquiry) {
  if (isOnlyProjectRelated.value) {
    return {
      name: enquiryProjectConfirmRouteName,
      params: {
        enquiryId: enquiry.enquiryId
      }
    };
  } else if (isPermitRelated.value) {
    return {
      name: enquiryPermitConfirmRouteName,
      params: {
        enquiryId: enquiry.enquiryId
      }
    };
  } else {
    return {
      name: enquiryConfirmRouteName,
      params: {
        enquiryId: enquiry.enquiryId
      }
    };
  }
}

async function loadEnquiry() {
  try {
    let firstContact, response;

    if (enquiryId) {
      response = (await enquiryService.getEnquiry(enquiryId)).data;
      firstContact = response?.activity?.activityContact?.[0]?.contact;
      editable.value = response?.intakeStatus !== IntakeStatus.SUBMITTED;
    } else {
      // Load contact data for new enquiry
      firstContact = contactStore.getContact;
    }

    initialFormValues.value = {
      activityId: response?.activityId,
      enquiryId: response?.enquiryId,
      contactFirstName: firstContact?.firstName,
      contactLastName: firstContact?.lastName,
      contactPhoneNumber: firstContact?.phoneNumber,
      contactEmail: firstContact?.email,
      contactApplicantRelationship: firstContact?.contactApplicantRelationship,
      contactPreference: firstContact?.contactPreference,
      contactId: firstContact?.contactId,
      basic: {
        relatedActivityId: response?.relatedActivityId,
        enquiryDescription: response?.enquiryDescription
      }
    };
  } catch (e: any) {
    if (getInitiative.value === Initiative.HOUSING) router.replace({ name: enquiryRouteName });
    else router.replace({ name: RouteName.EXT_ELECTRIFICATION });
    toast.error('Failed to load enquiry', e);
  }
}

function onInvalidSubmit(e: any) {
  validationErrors.value = Array.from(new Set(e.errors ? Object.keys(e.errors).map((x) => x.split('.')[0]!) : []));
  document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSubmit(values: any) {
  editable.value = false;

  try {
    // Set related activity id if project activity id is passed in as a prop
    if (project) {
      values.basic.relatedActivityId = project.activityId;
    }

    // Grab the contact information
    const contact = {
      contactId: values.contactId,
      firstName: values.contactFirstName,
      lastName: values.contactLastName,
      phoneNumber: values.contactPhoneNumber,
      email: values.contactEmail,
      contactApplicantRelationship: values.contactApplicantRelationship,
      contactPreference: values.contactPreference
    };

    // Omit all the fields we dont want to send
    const dataOmitted = omit({ ...values }, [
      'contactId',
      'contactFirstName',
      'contactLastName',
      'contactPhoneNumber',
      'contactEmail',
      'contactApplicantRelationship',
      'contactPreference'
    ]);

    if (permit) {
      let permitDescription =
        t('enquiryIntakeForm.re') + ': ' + permit.permitType.name + '\n' + t('enquiryIntakeForm.trackingId') + ': ';
      const trackingId =
        permit.permitTracking?.find((pt) => pt.shownToProponent)?.trackingId ?? t('enquiryIntakeForm.notApplicable');
      const authState = t('enquiryIntakeForm.authStatus') + ': ' + permit.state;
      permitDescription = permitDescription + trackingId + '\n' + authState + '\n\n';
      dataOmitted.basic.enquiryDescription = permitDescription + dataOmitted.basic.enquiryDescription;
      formRef.value?.setFieldValue('basic.enquiryDescription', dataOmitted.basic.enquiryDescription);
    }

    // Create enquiry
    const result = await enquiryService.createEnquiry(dataOmitted);

    // Link activity contact
    const contactResponse = (await contactService.updateContact(contact)).data;
    await activityContactService.updateActivityContact(result.data.activityId, [contactResponse]);

    // Save contact data to store
    contactStore.setContact(contactResponse);

    // Send confirmation email
    emailConfirmation(result.data.activityId, result.data.enquiryId);

    router.push(getEnquiryConfirmationRoute(result.data));
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;
  }
}

onBeforeMount(async () => {
  loadEnquiry();
});
</script>

<template>
  <div>
    <div class="flex justify-center items-center app-primary-color mb-2 mt-4">
      <h3
        role="heading"
        aria-level="1"
      >
        {{ t('enquiryIntakeForm.header') }}
      </h3>
    </div>

    <CollectionDisclaimer />

    <Form
      v-if="initialFormValues"
      ref="formRef"
      keep-values
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @invalid-submit="(e) => onInvalidSubmit(e)"
      @submit="confirmSubmit"
    >
      <FormNavigationGuard v-if="editable" />

      <input
        type="hidden"
        name="activityId"
      />

      <input
        type="hidden"
        name="enquiryId"
      />
      <Card v-if="isOnlyProjectRelated">
        <template #title>
          <span class="section-header">
            {{ t('enquiryIntakeForm.about') }}
            <span class="text-primary">
              {{ project?.projectName }}| {{ t('enquiryIntakeForm.projectId') }}:
              {{ project?.activityId }}
            </span>
          </span>
        </template>
      </Card>

      <Card v-if="isPermitRelated">
        <template #title>
          <span class="section-header">
            {{ t('enquiryIntakeForm.about') }}
            <span class="text-primary">
              {{ t('enquiryIntakeForm.permit') }}: {{ permit?.permitType.name }}|
              {{ t('enquiryIntakeForm.trackingId') }}: {{ trackingId }}| {{ t('enquiryIntakeForm.authStatus') }}:
              {{ permit?.state ?? 'No authorization status.' }}
            </span>
          </span>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="flex">
            <span
              class="section-header"
              role="heading"
              aria-level="2"
            >
              {{ t('enquiryIntakeForm.contactInformation') }}
            </span>
            <Tooltip
              right
              :text="t('enquiryIntakeForm.contactTooltip')"
            />
          </div>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="grid grid-cols-12 gap-4">
            <InputText
              class="col-span-6"
              name="contactFirstName"
              label="First name"
              :bold="false"
              :disabled="!!initialFormValues?.contactFirstName || !editable"
            />
            <InputText
              class="col-span-6"
              name="contactLastName"
              label="Last name"
              :bold="false"
              :disabled="!!initialFormValues?.contactLastName || !editable"
            />
            <InputMask
              class="col-span-6"
              name="contactPhoneNumber"
              mask="(999) 999-9999"
              label="Phone number"
              :bold="false"
              :disabled="!!initialFormValues?.contactPhoneNumber || !editable"
            />
            <InputText
              class="col-span-6"
              name="contactEmail"
              label="Email"
              :bold="false"
              :disabled="!!initialFormValues?.contactEmail || !editable"
            />
            <Select
              class="col-span-6"
              name="contactApplicantRelationship"
              label="Relationship to project"
              :bold="false"
              :disabled="!!initialFormValues?.contactApplicantRelationship || !editable"
              :options="PROJECT_RELATIONSHIP_LIST"
            />
            <Select
              class="col-span-6"
              :name="`contactPreference`"
              label="Preferred contact method"
              :bold="false"
              :disabled="!!initialFormValues?.contactPreference || !editable"
              :options="CONTACT_PREFERENCE_LIST"
            />
          </div>
        </template>
      </Card>
      <Card>
        <template #title>
          <span
            class="section-header"
            role="heading"
            aria-level="2"
          >
            Tell us about your enquiry
          </span>
          <Divider type="solid" />
        </template>
        <template #content>
          <div class="grid grid-cols-12 gap-4">
            <TextArea
              class="col-span-12"
              name="basic.enquiryDescription"
              placeholder="Type here..."
              :disabled="!editable"
            />
          </div>
        </template>
      </Card>
      <div class="flex align-center justify-center mt-4">
        <Button
          label="Submit"
          type="submit"
          icon="pi pi-upload"
          :disabled="!editable"
        />
      </div>
    </Form>
  </div>
</template>

<style scoped lang="scss">
.disclaimer {
  font-weight: 500;
}

:deep(.p-message-wrapper) {
  padding: 0.5rem;
}

:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: var(--p-red-500) !important;
}
</style>
