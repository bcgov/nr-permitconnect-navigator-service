<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import Divider from '@/components/common/Divider.vue';
import { AutoComplete, FormAutosave, FormNavigationGuard, InputText, RadioList, TextArea } from '@/components/form';
import ContactCardIntakeForm from '@/components/form/common/ContactCardIntakeForm.vue';
import CollectionDisclaimer from '@/components/housing/CollectionDisclaimer.vue';
import { createProjectIntakeSchema } from '@/components/electrification/project/ProjectIntakeSchema';
import { Button, Card, Message, useConfirm, useToast } from '@/lib/primevue';
import { documentService, electrificationProjectService, externalApiService } from '@/services';
import { useConfigStore, useCodeStore, useContactStore, useProjectStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { confirmationTemplateElectrificationSubmission, confirmationTemplateEnquiry } from '@/utils/templates';
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
const projectStore = useProjectStore();
const { codeValues, enums, options } = useCodeStore();
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
const validationSchema = computed(() => {
  return createProjectIntakeSchema(codeValues, enums, orgBookOptions.value);
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

async function emailConfirmation(actId: string, subId: string, forProjectSubmission: boolean) {
  try {
    const configCC = getConfig.value.ches?.submission?.cc;
    const applicantName = formRef.value?.values.contacts.contactFirstName;
    const applicantEmail = formRef.value?.values.contacts.contactEmail;
    const subject = `Confirmation of ${forProjectSubmission ? 'Project' : 'Enquiry'} Submission`;
    let body: string;

    if (forProjectSubmission) {
      body = confirmationTemplateElectrificationSubmission({
        '{{ contactName }}': applicantName,
        '{{ activityId }}': actId,
        '{{ projectId }}': subId
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

// Callback function for FormNavigationGuard
// Cannot be directly added to the vue router lifecycle or things get out of sync
async function onBeforeRouteLeaveCallback() {
  // draftId and activityId are not stored in the draft json until first save
  // If they do not exist we can safely delete on leave as it means the user hasn't done anything
  if (draftId && editable.value) {
    const response = (await electrificationProjectService.getDraft(draftId)).data;
    if (response && !response.data.draftId && !response.data.activityId) {
      await electrificationProjectService.deleteDraft(draftId);
    }
  }
}

async function onInvalidSubmit() {
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook(e.query))?.data?.results ?? [];
    orgBookOptions.value = results
      .filter((x: { [key: string]: string }) => x.type === 'name')
      .map((x: { [key: string]: string }) => x?.value);
  }
}

async function onSaveDraft(data: GenericObject, isAutoSave: boolean = false, showToast: boolean = true) {
  try {
    autoSaveRef.value?.stopAutoSave();

    await electrificationProjectService.updateDraft({
      draftId: draftId,
      activityId: data.activityId,
      data: data
    });

    if (showToast)
      toast.success(
        isAutoSave
          ? t('e.electrification.projectIntakeForm.draftAutoSaved')
          : t('e.electrification.projectIntakeForm.draftSaved')
      );
  } catch (e: any) {
    toast.error(t('e.electrification.projectIntakeForm.failedSaveDraft'), e);
  }
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
          projectId: response.data.electrificationProjectId
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

onBeforeMount(async () => {
  try {
    // Clearing the document store on page load
    projectStore.setDocuments([]);

    let response,
      documents: Array<Document> = [];

    if (draftId) {
      response = (await electrificationProjectService.getDraft(draftId)).data;

      initialFormValues.value = {
        contacts: {
          ...response.data.contacts
        },
        project: {
          ...response.data.project,
          activityId: response.activityId
        }
      };

      if (response.activityId) {
        activityId.value = response.activityId;
        documents = (await documentService.listDocuments(response.activityId)).data;
        documents.forEach((d: Document) => {
          d.filename = decodeURI(d.filename);
        });
        projectStore.setDocuments(documents);
      }
    } else {
      if (electrificationProjectId && activityId) {
        response = (await electrificationProjectService.getProject(electrificationProjectId)).data;

        if (response.activityId) {
          activityId.value = response.activityId;
          documents = (await documentService.listDocuments(response.activityId)).data;
        }

        // Set form to read-only on non draft form reopening
        editable.value = false;
        documents.forEach((d: Document) => {
          d.filename = decodeURI(d.filename);
        });
        projectStore.setDocuments(documents);
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
    router.replace({ name: RouteName.EXT_ELECTRIFICATION });
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
    :validation-schema="validationSchema"
    @invalid-submit="onInvalidSubmit"
    @submit="confirmSubmit"
  >
    <FormNavigationGuard
      v-if="editable"
      :auto-save-ref="autoSaveRef"
      :callback="onBeforeRouteLeaveCallback"
    />
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

    <ContactCardIntakeForm
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
          :options="options.ElectrificationProjectType"
          @on-change="
            (e: string) => {
              if (e === enums.ElectrificationProjectType.OTHER) setFieldValue('bcHydroNumber', null);
            }
          "
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
          <span v-if="values.project.projectType === enums.ElectrificationProjectType.OTHER">
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
          :activity-id="activityId"
          :disabled="!editable"
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
