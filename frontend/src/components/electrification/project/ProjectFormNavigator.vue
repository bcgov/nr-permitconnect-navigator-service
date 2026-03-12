<script setup lang="ts">
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { Form, type GenericObject } from 'vee-validate';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { createProjectFormSchema } from '../../../validators/electrification/projectFormNavigatorSchema';
import { AdditionalInfo, AstNote, Company, Electrification, Location } from '@/components/common/icons';
import {
  AutoComplete,
  CancelButton,
  Checkbox,
  EditableSelect,
  FormNavigationGuard,
  InputText,
  Select,
  TextArea
} from '@/components/form';
import ATSInfo from '@/components/ats/ATSInfo.vue';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import { useProjectFormNavigator } from '@/composables/useProjectFormNavigator';
import { Button, Message, Panel, useConfirm, useToast } from '@/lib/primevue';
import { electrificationProjectService, userService } from '@/services';
import { useCodeStore, useProjectStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import { ATSCreateTypes, BasicResponse, Initiative } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { omit, setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Maybe } from 'yup';
import type { DeepPartial, ElectrificationProject, User } from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectFormNavigatorSchema';

// Props
const { editable = true, project } = defineProps<{
  editable?: boolean;
  project: ElectrificationProject;
}>();

// Emits
const emit = defineEmits<{
  inputProjectName: [newName: string];
}>();

// Store
const projectStore = useProjectStore();
const { codeList, enums, options } = useCodeStore();
const { getActivityContacts } = storeToRefs(projectStore);

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);

const primaryContact = computed(
  () => getActivityContacts.value.find((ac) => ac.role === ActivityContactRole.PRIMARY)?.contact
);
const projectFormSchema = computed(() => {
  return createProjectFormSchema(codeList, enums, orgBookOptions.value);
});

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const {
  assigneeOptions,
  atsCreateType,
  isCompleted,
  orgBookOptions,
  showCancelMessage,
  handleAtsCreate,
  onAssigneeInput,
  onCancel,
  onInvalidSubmit,
  searchOrgBook,
  setBasicInfo
} = useProjectFormNavigator(formRef, project, Initiative.ELECTRIFICATION);
const toast = useToast();

// Actions
function emitProjectNameChange(e: Event) {
  emit('inputProjectName', (e.target as HTMLInputElement).value);
}

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName}`;
};

function initilizeFormValues(project: ElectrificationProject): DeepPartial<FormSchemaType> {
  return {
    contact: {
      contactId: primaryContact.value?.contactId,
      firstName: primaryContact.value?.firstName,
      lastName: primaryContact.value?.lastName,
      phoneNumber: primaryContact.value?.phoneNumber,
      email: primaryContact.value?.email,
      contactApplicantRelationship: primaryContact.value?.contactApplicantRelationship,
      contactPreference: primaryContact.value?.contactPreference,
      userId: primaryContact.value?.userId
    },
    project: {
      companyIdRegistered: project.companyIdRegistered,
      companyNameRegistered: project.companyNameRegistered,
      projectName: project.projectName,
      bcHydroNumber: project.bcHydroNumber,
      projectType: project.projectType,
      hasEpa: project.hasEpa as BasicResponse | null | undefined,
      megawatts: project.megawatts as Maybe<number | undefined>,
      projectCategory: project.projectCategory,
      bcEnvironmentAssessNeeded: project.bcEnvironmentAssessNeeded as BasicResponse | null | undefined
    },

    // Additional Info
    projectDescription: project.projectDescription,

    // Location
    locationDescription: project.locationDescription,

    // Automated Status Tool Notes
    astNotes: project.astNotes,

    // Submission state
    submissionState: {
      queuePriority: project.queuePriority,
      submissionType: project.submissionType as SubmissionType | undefined,
      assignedUser: assigneeOptions.value[0] ?? null,
      applicationStatus: project.applicationStatus
    },

    // ATS link
    atsClientId: project.atsClientId,
    atsEnquiryId: project.atsEnquiryId,

    // Updates
    aaiUpdated: project.aaiUpdated,
    addedToAts: project.addedToAts
  };
}

function onReOpen() {
  confirm.require({
    message: t('i.common.projectForm.confirmReopenMessage'),
    header: t('i.common.projectForm.confirmReopenHeader'),
    acceptLabel: t('i.common.projectForm.reopenAccept'),
    rejectLabel: t('i.common.projectForm.reopenReject'),
    rejectProps: { outlined: true },
    accept: () => {
      formRef.value?.setFieldValue('submissionState.applicationStatus', ApplicationStatus.IN_PROGRESS);
      if (formRef.value?.values) onSubmit(formRef.value?.values);
    }
  });
}

const onSubmit = async (values: GenericObject) => {
  try {
    await handleAtsCreate(values);

    // Generate final submission object
    const dataOmitted = omit(
      setEmptyStringsToNull({
        project: {
          ...values.project,
          activityId: project.activityId,
          electrificationProjectId: project.electrificationProjectId,
          projectDescription: values.projectDescription,
          locationDescription: values.locationDescription,
          astNotes: values.astNotes,
          queuePriority: values.submissionState.queuePriority,
          submissionType: values.submissionState.submissionType,
          assignedUserId: values.submissionState.assignedUser?.userId,
          applicationStatus: values.submissionState.applicationStatus,
          atsClientId: Number.parseInt(values.atsClientId) || '',
          atsEnquiryId: Number.parseInt(values.atsEnquiryId) || '',
          aaiUpdated: values.aaiUpdated,
          addedToAts: values.addedToAts
        }
      }),
      ['contact', 'assignedUser', 'submissionState']
    );

    // Update project
    const result = await electrificationProjectService.updateProject(project.electrificationProjectId, dataOmitted);
    projectStore.setProject(result.data);

    // Wait a tick for store to propagate
    await nextTick();

    // Reinitialize the form
    formRef.value?.resetForm({
      values: {
        ...initilizeFormValues(result.data)
      }
    });

    toast.success(t('i.common.form.savedMessage'));
  } catch (e) {
    if (isAxiosError(e) || e instanceof Error) toast.error(t('i.common.projectForm.failedMessage'), e.message);
  }
};

watch(primaryContact, (newContact, oldContact) => {
  if (newContact?.contactId !== oldContact?.contactId) {
    setBasicInfo(newContact);
  }
});

onBeforeMount(async () => {
  if (project.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [project.assignedUserId] })).data;
  }

  // Load options for org book autocomplete to prevent schema validation errors on existing values
  if (project.companyNameRegistered) await searchOrgBook(project.companyNameRegistered);

  // Default form values
  initialFormValues.value = initilizeFormValues(project);
});
</script>

<template>
  <Message
    v-if="showCancelMessage"
    id="cancelMessage"
    severity="warn"
    :closable="false"
    :life="5500"
  >
    {{ t('i.common.form.cancelMessage') }}
  </Message>
  <Form
    v-if="initialFormValues"
    v-slot="{ setFieldValue, values }"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="projectFormSchema"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!isCompleted" />

    <div class="grid grid-cols-[4fr_1fr] gap-x-9 mt-4">
      <div class="flex flex-col gap-y-9">
        <div class="p-panel flex justify-between items-start px-6 py-4">
          <h2 class="section-header my-0">
            {{ values.project.companyNameRegistered }}
          </h2>
          <div class="flex flex-col">
            <span>{{ t('i.electrification.projectForm.submissionDate') }}</span>
            <span class="text-[var(--p-bcblue-900)]">{{ formatDate(project.submittedAt) }}</span>
          </div>
        </div>

        <ContactCardNavForm
          :editable="editable"
          :form-values="values"
        />
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <Company />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.companyProject') }}
              </h3>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-x-6 gap-y-6">
            <InputText
              name="project.projectName"
              :label="t('i.electrification.projectForm.projectNameLabel')"
              :disabled="!editable"
              @on-input="emitProjectNameChange"
            />
            <AutoComplete
              name="project.companyNameRegistered"
              :label="t('i.electrification.projectForm.companyLabel')"
              :bold="true"
              :disabled="!editable"
              :editable="true"
              :placeholder="t('i.common.projectForm.searchBCRegistered')"
              :get-option-label="(option) => option.registeredName"
              :suggestions="orgBookOptions"
              @on-complete="(e) => searchOrgBook(e.query)"
              @on-select="
                (orgBookOption) => {
                  setFieldValue('project.companyIdRegistered', orgBookOption.registeredId);
                  setFieldValue('project.companyNameRegistered', orgBookOption.registeredName);
                }
              "
            />
            <InputText
              name="project.companyIdRegistered"
              :label="t('i.common.projectForm.bcRegistryId')"
              :disabled="true"
            />
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <Electrification />
              <h3 class="section-header m-0">
                {{ t('i.electrification.projectForm.projectHeader') }}
              </h3>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-x-6 gap-y-6">
            <Select
              name="project.projectType"
              option-label="label"
              option-value="value"
              :label="t('i.electrification.projectForm.projectTypeLabel')"
              :disabled="!editable"
              :options="options.ElectrificationProjectType"
            />
            <InputText
              name="project.bcHydroNumber"
              :label="t('i.electrification.projectForm.bcHydroNumberLabel')"
              :disabled="!editable"
            />
            <Select
              name="project.hasEpa"
              :label="t('i.electrification.projectForm.hasEpaLabel')"
              :disabled="!editable"
              :options="YES_NO_LIST"
            />
            <InputText
              name="project.megawatts"
              :label="t('i.electrification.projectForm.megawattsLabel')"
              :disabled="!editable"
            />
            <Select
              name="project.bcEnvironmentAssessNeeded"
              :label="t('i.electrification.projectForm.bcEnvironmentAssessNeededLabel')"
              :disabled="!editable"
              :options="YES_NO_LIST"
            />
            <Select
              name="project.projectCategory"
              option-label="label"
              option-value="value"
              :label="t('i.electrification.projectForm.projectCategoryLabel')"
              :disabled="!editable"
              :options="options.ElectrificationProjectCategory"
            />
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <AdditionalInfo />
              <h3 class="section-header m-0">
                {{ t('i.electrification.projectForm.additionalInfoHeader') }}
              </h3>
            </div>
          </template>
          <TextArea
            name="projectDescription"
            :disabled="!editable"
          />
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <Location />
              <h3 class="section-header m-0">
                {{ t('i.electrification.projectForm.locationHeader') }}
              </h3>
            </div>
          </template>
          <InputText
            name="locationDescription"
            :disabled="!editable"
          />
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <AstNote />
              <h3 class="section-header m-0">
                {{ t('i.electrification.projectForm.astNotesHeader') }}
              </h3>
            </div>
          </template>
          <TextArea
            name="astNotes"
            :disabled="!editable"
          />
        </Panel>
      </div>
      <div class="flex flex-col gap-y-9">
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('i.electrification.projectForm.submissionStateHeader') }}
          </h4>
          <div class="flex flex-col gap-y-4">
            <EditableSelect
              name="submissionState.assignedUser"
              :label="t('i.electrification.projectForm.assignedToLabel')"
              :disabled="!editable"
              :options="assigneeOptions"
              :get-option-label="getAssigneeOptionLabel"
              @on-input="onAssigneeInput"
            />
            <Select
              name="submissionState.applicationStatus"
              :label="t('i.electrification.projectForm.projectStateLabel')"
              :disabled="!editable"
              :options="APPLICATION_STATUS_LIST"
            />
            <Select
              name="submissionState.submissionType"
              :label="t('i.electrification.projectForm.submissionTypeLabel')"
              :disabled="!editable"
              :options="SUBMISSION_TYPE_LIST"
            />
            <Select
              name="submissionState.queuePriority"
              :label="t('i.electrification.projectForm.priorityLabel')"
              :disabled="!editable"
              :options="QUEUE_PRIORITY"
            />
          </div>
        </div>
        <ATSInfo
          :ats-client-id="values.atsClientId"
          :ats-enquiry-id="values.atsEnquiryId"
          :first-name="values.contact.firstName"
          :last-name="values.contact.lastName"
          :phone-number="values.contact.phoneNumber"
          :email="values.contact.email"
          @ats-info:set-client-id="(atsClientId: number | null) => setFieldValue('atsClientId', atsClientId)"
          @ats-info:set-added-to-ats="(addedToATS: boolean) => setFieldValue('addedToAts', addedToATS)"
          @ats-info:create="(value: ATSCreateTypes) => (atsCreateType = value)"
          @ats-info:create-enquiry="atsCreateType = ATSCreateTypes.ENQUIRY"
        />
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('i.electrification.projectForm.updatesHeader') }}
          </h4>
          <Checkbox
            name="addedToAts"
            class="mb-4"
            :label="t('i.electrification.projectForm.atsUpdated')"
            :disabled="!editable"
          />
          <Checkbox
            name="aaiUpdated"
            :label="t('i.electrification.projectForm.aaiUpdateLabel')"
            :disabled="!editable"
          />
        </div>
      </div>
    </div>
    <div class="mt-16">
      <Button
        v-if="!isCompleted"
        label="Save"
        type="submit"
        icon="pi pi-check"
        :disabled="!editable"
      />
      <CancelButton
        v-if="!isCompleted"
        :editable="editable"
        @clicked="onCancel"
      />
      <Button
        v-if="isCompleted"
        label="Re-open submission"
        icon="pi pi-check"
        @click="onReOpen()"
      />
    </div>
  </Form>
</template>
