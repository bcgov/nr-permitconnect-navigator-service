<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { projectFormSchema } from './ProjectFormSchema';
import { AdditionalInfo, AstNote, Electrification, Location } from '@/components/common/icons';
import {
  CancelButton,
  Checkbox,
  EditableSelect,
  FormNavigationGuard,
  InputText,
  Select,
  TextArea
} from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import ATSUserLinkModal from '@/components/user/ATSUserLinkModal.vue';
import ATSUserCreateModal from '@/components/user/ATSUserCreateModal.vue';
import ATSUserDetailsModal from '@/components/user/ATSUserDetailsModal.vue';
import { Button, Message, Panel, useConfirm, useToast } from '@/lib/primevue';
import { electrificationProjectService, userService } from '@/services';
import { useProjectStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH, YES_NO_LIST } from '@/utils/constants/application';
import { PROJECT_CATEGORY_OPTIONS, PROJECT_TYPE_OPTIONS } from '@/utils/constants/electrification';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import { IdentityProviderKind, Regex } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { findIdpConfig, omit, setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { ATSClientResource, ElectrificationProject, User } from '@/types';

// Props
const { editable = true, project } = defineProps<{
  editable?: boolean;
  project: ElectrificationProject;
}>();

// Emits
const emit = defineEmits<{
  (e: 'input-project-name', newName: string): void;
}>();

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

// Store
const projectStore = useProjectStore();

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const atsUserLinkModalVisible: Ref<boolean> = ref(false);
const atsUserDetailsModalVisible: Ref<boolean> = ref(false);
const atsUserCreateModalVisible: Ref<boolean> = ref(false);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const showCancelMessage: Ref<boolean> = ref(false);

// Actions
function emitProjectNameChange(e: Event) {
  emit('input-project-name', (e.target as HTMLInputElement).value);
}

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName}`;
};

const isCompleted = computed(() => {
  return project.applicationStatus === ApplicationStatus.COMPLETED;
});

const onAssigneeInput = async (e: IInputEvent) => {
  const input = e.target.value;

  const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);

  if (idpCfg) {
    if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
      assigneeOptions.value = (
        await userService.searchUsers({ email: input, fullName: input, idp: [idpCfg.idp] })
      ).data;
    } else if (input.match(Regex.EMAIL)) {
      assigneeOptions.value = (await userService.searchUsers({ email: input, idp: [idpCfg.idp] })).data;
    } else {
      assigneeOptions.value = [];
    }
  }
};

function initilizeFormValues(project: ElectrificationProject) {
  return {
    contact: {
      contactId: project?.activity?.activityContact?.[0]?.contact?.contactId,
      firstName: project?.activity?.activityContact?.[0]?.contact?.firstName,
      lastName: project?.activity?.activityContact?.[0]?.contact?.lastName,
      phoneNumber: project?.activity?.activityContact?.[0]?.contact?.phoneNumber,
      email: project?.activity?.activityContact?.[0]?.contact?.email,
      contactApplicantRelationship: project?.activity?.activityContact?.[0]?.contact?.contactApplicantRelationship,
      contactPreference: project?.activity?.activityContact?.[0]?.contact?.contactPreference
    },
    project: {
      companyNameRegistered: project.companyNameRegistered,
      projectName: project.projectName,
      bcHydroNumber: project.bcHydroNumber,
      projectType: project.projectType,
      hasEpa: project.hasEpa,
      megawatts: project.megawatts,
      projectCategory: project.projectCategory,
      bcEnvironmentAssessNeeded: project.bcEnvironmentAssessNeeded
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
      submissionType: project.submissionType,
      assignedUser: assigneeOptions.value[0] ?? null,
      applicationStatus: project.applicationStatus,
      intakeStatus: project.intakeStatus
    },

    // ATS link
    atsClientId: project.atsClientId,

    // Updates
    aaiUpdated: project.aaiUpdated
  };
}

function onCancel() {
  formRef.value?.resetForm();
  showCancelMessage.value = true;

  setTimeout(() => {
    document.getElementById('cancelMessage')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
  setTimeout(() => {
    showCancelMessage.value = false;
  }, 6000);
}

function onInvalidSubmit(e: any) {
  const errors = Object.keys(e.errors);

  // Scrolls to the top-most error
  let first: Element | null = null;

  for (let error of errors) {
    const el = document.querySelector(`[name="${error}"]`);
    const rect = el?.getBoundingClientRect();

    if (rect) {
      if (!first) first = el;
      else if (rect.top < first.getBoundingClientRect().top) first = el;
    }
  }

  first?.scrollIntoView({ behavior: 'smooth' });
}

function onReOpen() {
  confirm.require({
    message: t('i.common.projectForm.confirmReopenMessage'),
    header: t('i.common.projectForm.confirmReopenHeader'),
    acceptLabel: t('i.common.projectForm.reopenAccept'),
    rejectLabel: t('i.common.projectForm.reopenReject'),
    accept: () => {
      formRef.value?.setFieldValue('submissionState.applicationStatus', ApplicationStatus.IN_PROGRESS);
      onSubmit(formRef.value?.values);
    }
  });
}

const onSubmit = async (values: any) => {
  try {
    const submitData = omit(
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
          atsClientId: parseInt(values.atsClientId) || '',
          aaiUpdated: values.aaiUpdated
        },
        contacts: [
          {
            contactId: values.contact.contactId,
            firstName: values.contact.firstName,
            lastName: values.contact.lastName,
            phoneNumber: values.contact.phoneNumber,
            email: values.contact.email,
            contactApplicantRelationship: values.contact.contactApplicantRelationship,
            contactPreference: values.contact.contactPreference
          }
        ]
      }),
      ['assignedUser', 'submissionState']
    );

    const result = await electrificationProjectService.updateProject(project.electrificationProjectId, submitData);

    projectStore.setProject(result.data);

    formRef.value?.resetForm({
      values: {
        ...initilizeFormValues(result.data)
      }
    });

    toast.success(t('i.common.form.savedMessage'));
  } catch (e: any) {
    toast.error(t('i.common.projectForm.failedMessage'), e.message);
  }
};

onBeforeMount(async () => {
  if (project.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [project.assignedUserId] })).data;
  }

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
          :initial-form-values="initialFormValues"
        />
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
              :options="PROJECT_TYPE_OPTIONS"
            />
            <InputText
              name="project.bcHydroNumber"
              :label="t('i.electrification.projectForm.bcHydroNumberLabel')"
              :disabled="!editable"
            />
            <InputText
              name="project.projectName"
              :label="t('i.electrification.projectForm.projectNameLabel')"
              :disabled="!editable"
              @on-input="emitProjectNameChange"
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
            <InputText
              name="project.companyNameRegistered"
              :label="t('i.electrification.projectForm.companyLabel')"
              :disabled="!editable"
              @on-change="
                (e) => {
                  if (!e.target.value) {
                    setFieldValue('companyNameRegistered', null);
                    setFieldValue('isDevelopedInBC', null);
                  }
                }
              "
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
              :options="PROJECT_CATEGORY_OPTIONS"
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
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('i.electrification.projectForm.atsHeader') }}
          </h4>
          <div
            v-if="values.atsClientId"
            class="flex flex-col gap-y-3"
          >
            <input
              type="hidden"
              name="atsClientId"
            />
            <div class="flex items-center">
              <p class="text-[var(--p-primary-900)] mr-2">
                <b>{{ t('i.electrification.projectForm.atsClientIdHeader') }}</b>
              </p>
              <a
                class="hover-hand"
                @click="atsUserDetailsModalVisible = true"
              >
                {{ values.atsClientId }}
              </a>
            </div>
          </div>
          <div
            v-else
            class="flex flex-col gap-y-6"
          >
            <Button
              class="ats-button"
              aria-label="Link to ATS"
              outlined
              :label="t('i.electrification.projectForm.atsSearchButton')"
              :disabled="!editable"
              @click="atsUserLinkModalVisible = true"
            />
            <Button
              class="ats-button"
              aria-label="New ATS client"
              outlined
              :label="t('i.electrification.projectForm.atsNewButton')"
              :disabled="!editable"
              @click="atsUserCreateModalVisible = true"
            />
          </div>
        </div>
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('i.electrification.projectForm.updatesHeader') }}
          </h4>
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
    <ATSUserLinkModal
      v-model:visible="atsUserLinkModalVisible"
      :project-or-enquiry="project"
      @ats-user-link:link="
        (atsClientResource: ATSClientResource) => {
          atsUserLinkModalVisible = false;
          setFieldValue('atsClientId', atsClientResource.clientId);
        }
      "
    />
    <ATSUserDetailsModal
      v-model:visible="atsUserDetailsModalVisible"
      :ats-client-id="values.atsClientId"
      @ats-user-details:un-link="
        () => {
          atsUserDetailsModalVisible = false;
          setFieldValue('atsClientId', null);
        }
      "
    />
    <ATSUserCreateModal
      v-model:visible="atsUserCreateModalVisible"
      :project-or-enquiry="project"
      @ats-user-link:link="
        (atsClientId: string) => {
          atsUserCreateModalVisible = false;
          setFieldValue('atsClientId', atsClientId);
        }
      "
    />
  </Form>
</template>
<style scoped lang="scss">
.ats-button {
  background-color: white;
}
</style>
