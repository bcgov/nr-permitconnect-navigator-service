<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, onBeforeMount, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import Divider from '@/components/common/Divider.vue';
import { AutoComplete, FormAutosave, FormNavigationGuard, InputText, RadioList, TextArea } from '@/components/form';
import ContactCard from '@/components/form/common/ContactCard.vue';
import CollectionDisclaimer from '@/components/housing/CollectionDisclaimer.vue';
import { projectIntakeSchema } from '@/components/electrification/project/ProjectIntakeSchema';
import { Button, Card, Message, useConfirm, useToast } from '@/lib/primevue';
import { documentService, electrificationProjectService, externalApiService } from '@/services';
import { useConfigStore, useContactStore, useElectrificationProjectStore } from '@/store';
import { PROJECT_TYPES } from '@/utils/constants/electrification';
import { RouteName } from '@/utils/enums/application';
import { ProjectType } from '@/utils/enums/electrification';
import { confirmationTemplateEnquiry, confirmationTemplateSubmission } from '@/utils/templates';
import { setEmptyStringsToNull } from '@/utils/utils';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { GenericObject } from 'vee-validate';
import type { Ref } from 'vue';
import type { Contact, Document } from '@/types';

// Props
const { draftId = undefined, electrificationProjectId = undefined } = defineProps<{
  draftId?: string;
  electrificationProjectId?: string;
}>();

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

// Constants
const VALIDATION_BANNER_TEXT = t('e.electrification.projectIntakeForm.validationBanner');

// Store
const contactStore = useContactStore();
const electrificationProjectStore = useElectrificationProjectStore();
const { getConfig } = storeToRefs(useConfigStore());

// State
const activityId: Ref<string | undefined> = ref(undefined);
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const orgBookOptions: Ref<Array<any>> = ref([]);
const validationErrors = computed(() => {
  // Parse errors from vee-validate into a string[] of category headings
  if (!formRef?.value?.errors) return [];
  else return Array.from(new Set(Object.keys(formRef.value.errors).flatMap((x) => x.split('.')[0].split('[')[0])));
});

// Actions
function confirmSubmit(data: GenericObject) {
  confirm.require({
    message: t('e.electrification.projectIntakeForm.confirmSubmitMessage'),
    header: t('e.electrification.projectIntakeForm.confirmSubmitHeader'),
    acceptLabel: t('e.electrification.projectIntakeForm.confirm'),
    rejectLabel: t('e.electrification.projectIntakeForm.cancel'),
    rejectProps: { outlined: true },
    accept: () => onSubmit(data)
  });
}

async function generateActivityId() {
  try {
    const response = await electrificationProjectService.updateDraft({
      draftId: undefined,
      activityId: undefined,
      data: formRef?.value?.values
    });

    if (response.data?.activityId && response.data?.draftId) {
      // Disable the navigation guard temporarily to allow a route change
      editable.value = false;
      await nextTick();
      syncFormAndRoute(response.data.activityId, response.data.draftId);
      editable.value = true;

      return response.data.activityId;
    } else {
      return undefined;
    }
  } catch (error) {
    toast.error(t('e.electrification.projectIntakeForm.failedGenerateActivity'));
    return undefined;
  }
}

async function onInvalidSubmit() {
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

async function onSaveDraft(data: GenericObject, isAutoSave: boolean = false, showToast: boolean = true) {
  autoSaveRef.value?.stopAutoSave();

  let response;
  try {
    response = await electrificationProjectService.updateDraft({
      draftId: draftId,
      activityId: data.activityId,
      data: data
    });

    // Disable the navigation guard temporarily to allow a route change
    editable.value = false;
    await nextTick();
    syncFormAndRoute(response?.data.activityId, response?.data.draftId);
    editable.value = true;

    if (showToast)
      toast.success(
        isAutoSave
          ? t('e.electrification.projectIntakeForm.draftAutoSaved')
          : t('e.electrification.projectIntakeForm.draftSaved')
      );
  } catch (e: any) {
    toast.error(t('e.electrification.projectIntakeForm.failedSaveDraft'), e);
  }

  return { activityId: response?.data.activityId, draftId: response?.data.draftId };
}

async function onSubmit(data: any) {
  // If there is a change to contact fields,
  // please update onAssistanceRequest() as well.
  editable.value = false;

  try {
    autoSaveRef.value?.stopAutoSave();

    // Convert contact fields into contacts array object
    const submissionData = {
      project: {
        ...data.project
      },
      contacts: [
        {
          contactId: data.contacts.contactId,
          firstName: data.contacts.contactFirstName,
          lastName: data.contacts.contactLastName,
          phoneNumber: data.contacts.contactPhoneNumber,
          email: data.contacts.contactEmail,
          contactApplicantRelationship: data.contacts.contactApplicantRelationship,
          contactPreference: data.contacts.contactPreference
        }
      ]
    };

    submissionData.contacts = submissionData.contacts.map((x: Contact) => setEmptyStringsToNull(x));

    const response = await electrificationProjectService.submitDraft({ ...submissionData, draftId });

    if (response.data.activityId && response.data.electrificationProjectId) {
      assignedActivityId.value = response.data.activityId;

      // Send confirmation email
      emailConfirmation(response.data.activityId, response.data.electrificationProjectId, true);

      // Save contact data to store
      contactStore.setContact(submissionData.contacts[0]);

      router.push({
        name: RouteName.EXT_ELECTRIFICATION_INTAKE_CONFIRMATION,
        params: {
          electrificationProjectId: response.data.electrificationProjectId
        }
      });
    } else {
      throw new Error(t('e.electrification.projectIntakeForm.failedRetrieveDraft'));
    }
  } catch (e: any) {
    toast.error(t('e.electrification.projectIntakeForm.failedSaveIntake'), e);
    editable.value = true;
  }
}

async function emailConfirmation(actId: string, subId: string, forProjectSubmission: boolean) {
  try {
    const configCC = getConfig.value.ches?.submission?.cc;
    const applicantName = formRef.value?.values.contacts.contactFirstName;
    const applicantEmail = formRef.value?.values.contacts.contactEmail;
    const subject = `Confirmation of ${forProjectSubmission ? 'Project' : 'Enquiry'} Submission`;
    let body: string;

    if (forProjectSubmission) {
      body = confirmationTemplateSubmission({
        '{{ contactName }}': applicantName,
        '{{ activityId }}': actId,
        '{{ electrificationProjectId }}': subId
      });
    } else {
      body = confirmationTemplateEnquiry({
        '{{ contactName }}': applicantName,
        '{{ activityId }}': actId,
        '{{ enquiryDescription }}': t('e.electrification.projectIntakeForm.assistanceMessage'),
        '{{ enquiryId }}': subId
      });
    }
    const emailData = {
      from: configCC,
      to: [applicantEmail],
      cc: configCC,
      subject: subject,
      bodyType: 'html',
      body: body
    };
    await electrificationProjectService.emailConfirmation(emailData);
  } catch (e: any) {
    toast.error(t('e.electrification.projectIntakeForm.failedConfirmationEmail'), e);
  }
}

async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook(e.query))?.data?.results ?? [];
    orgBookOptions.value = results
      .filter((x: { [key: string]: string }) => x.type === 'name')
      .map((x: { [key: string]: string }) => x?.value);
  }
}

function syncFormAndRoute(actId: string, drftId: string) {
  if (drftId) {
    // Update route query for refreshing
    router.replace({
      name: RouteName.EXT_ELECTRIFICATION_INTAKE_DRAFT,
      params: { draftId: drftId }
    });
  }

  if (actId) {
    formRef.value?.setFieldValue('activityId', actId);
    activityId.value = actId;
  }
}

onBeforeMount(async () => {
  try {
    // Clearing the document store on page load
    electrificationProjectStore.setDocuments([]);

    let response,
      documents: Array<Document> = [];

    if (draftId) {
      response = (await electrificationProjectService.getDraft(draftId)).data;

      initialFormValues.value = {
        ...response.data,
        activityId: response.activityId
      };

      if (response.activityId) {
        activityId.value = response.activityId;
        documents = (await documentService.listDocuments(response.activityId)).data;
        documents.forEach((d: Document) => {
          d.filename = decodeURI(d.filename);
        });
        electrificationProjectStore.setDocuments(documents);
      }
    } else {
      if (electrificationProjectId && activityId) {
        response = (await electrificationProjectService.getElectrificationProject(electrificationProjectId)).data;

        if (response.activityId) {
          activityId.value = response.activityId;
          documents = (await documentService.listDocuments(response.activityId)).data;
        }

        // Set form to read-only on non draft form reopening
        editable.value = false;
        documents.forEach((d: Document) => {
          d.filename = decodeURI(d.filename);
        });
        electrificationProjectStore.setDocuments(documents);
      } else {
        // Load contact data for new submission
        response = { contacts: [contactStore.getContact] };
      }

      initialFormValues.value = {
        contacts: {
          contactFirstName: response?.contacts[0]?.firstName,
          contactLastName: response?.contacts[0]?.lastName,
          contactPhoneNumber: response?.contacts[0]?.phoneNumber,
          contactEmail: response?.contacts[0]?.email,
          contactApplicantRelationship: response?.contacts[0]?.contactApplicantRelationship,
          contactPreference: response?.contacts[0]?.contactPreference,
          contactId: response?.contacts[0]?.contactId
        },
        project: {
          activityId: response?.activityId,
          electrificationProjectId: response?.electrificationProjectId,
          companyNameRegistered: response?.companyNameRegistered,
          projectName: response?.projectName,
          projectType: response?.projectType,
          bcHydroNumber: response?.bcHydroNumber,
          projectDescription: response?.projectDescription
        }
      };
    }
  } catch (e) {
    router.replace({ name: RouteName.EXT_ELECTRIFICATION_INTAKE });
  }
});
</script>

<template>
  <div class="flex justify-center">
    <h2
      role="heading"
      aria-level="1"
    >
      Project Intake Form
    </h2>
  </div>
  <Form
    v-if="initialFormValues"
    id="form"
    v-slot="{ isSubmitting, setFieldValue, values }"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="projectIntakeSchema"
    @invalid-submit="onInvalidSubmit"
    @submit="confirmSubmit"
  >
    <FormNavigationGuard v-if="editable" />
    <FormAutosave
      v-if="editable"
      ref="autoSaveRef"
      :callback="() => onSaveDraft(values, true)"
    />

    <input
      type="hidden"
      name="draftId"
    />

    <input
      type="hidden"
      name="project.activityId"
    />

    <CollectionDisclaimer />

    <Message
      v-if="validationErrors.length"
      severity="error"
      icon="pi pi-exclamation-circle"
      :closable="false"
      class="message-banner text-center"
    >
      {{ VALIDATION_BANNER_TEXT }}
    </Message>

    <ContactCard
      :editable="editable"
      :initial-form-values="initialFormValues"
    />

    <Card>
      <template #title>
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('e.electrification.projectIntakeForm.declareBusinessName') }}
        </span>
        <Divider type="solid" />
      </template>
      <template #content>
        <AutoComplete
          name="project.companyNameRegistered"
          :bold="false"
          :disabled="!editable"
          :editable="true"
          :force-selection="true"
          :placeholder="t('e.electrification.projectIntakeForm.searchBCRegistered')"
          :suggestions="orgBookOptions"
          @on-complete="onRegisteredNameInput"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('e.electrification.projectIntakeForm.projectNameCard') }}
        </span>
        <Divider type="solid" />
      </template>
      <template #content>
        <InputText
          name="project.projectName"
          :bold="false"
          :disabled="!editable"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('e.electrification.projectIntakeForm.projectTypeCard') }}
        </span>
        <Divider type="solid" />
      </template>
      <template #content>
        <RadioList
          name="project.projectType"
          :disabled="!editable"
          :options="PROJECT_TYPES"
          @on-change="
            (e: string) => {
              if (e === ProjectType.NCTL || e === ProjectType.OTHER) setFieldValue('bcHydroNumber', null);
            }
          "
        />
      </template>
    </Card>

    <Card
      v-if="values.project.projectType === ProjectType.IPP_WIND || values.project.projectType === ProjectType.IPP_SOLAR"
    >
      <template #title>
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('e.electrification.projectIntakeForm.bcHydroNumber') }}
        </span>
        <Divider type="solid" />
      </template>
      <template #content>
        <InputText
          name="project.bcHydroNumber"
          :bold="false"
          :disabled="!editable"
        />
      </template>
    </Card>

    <Card>
      <template #title>
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          <span v-if="values.project.projectType === ProjectType.OTHER">
            {{ t('e.electrification.projectIntakeForm.projectDescriptionCard') }}
          </span>
          <span v-else>
            {{ t('e.electrification.projectIntakeForm.projectDescriptionCardOptional') }}
          </span>
        </span>
        <Divider type="solid" />
      </template>
      <template #content>
        <!-- eslint-disable max-len -->
        <TextArea
          class="col-span-12 mb-0 pb-0"
          name="project.projectDescription"
          :placeholder="t('e.electrification.projectIntakeForm.provideDetails')"
          :disabled="!editable"
        />
        <!-- eslint-enable max-len -->

        <label class="col-span-12 mt-0 pt-0">
          {{ t('e.electrification.projectIntakeForm.upload1') }}
          <a
            href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
            target="_blank"
            class="text-blue-500 underline"
          >
            {{ t('e.electrification.projectIntakeForm.upload2') }}
          </a>
          {{ t('e.electrification.projectIntakeForm.upload3') }}
        </label>
        <AdvancedFileUpload
          :activity-id="values.activityId"
          :disabled="!editable"
          :generate-activity-id="generateActivityId"
        />
      </template>
    </Card>

    <div class="flex items-center justify-center mt-6">
      <Button
        :label="t('e.electrification.projectIntakeForm.submit')"
        type="submit"
        icon="pi pi-upload"
        :disabled="!editable || isSubmitting"
      />
    </div>
  </Form>
</template>

<style scoped lang="scss">
.app-error-color {
  color: var(--p-red-500) !important;
}

.message-banner {
  border-left-color: var(--p-red-500);
  border-left-width: 5px;
  border-left-style: solid;
  border-radius: 3px;
  margin-bottom: 1rem;

  :deep(.p-message-content) {
    padding: 0.5rem;
    background-color: var(--p-red-50) !important;
  }
}

.no-shadow {
  box-shadow: none;
}

:deep(.p-step) {
  button {
    padding: 0;
  }
}

:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: var(--p-red-500) !important;
}
</style>
