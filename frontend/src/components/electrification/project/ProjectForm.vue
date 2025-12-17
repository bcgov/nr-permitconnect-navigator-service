<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createProjectFormSchema } from './ProjectFormSchema';
import { AdditionalInfo, AstNote, Electrification, Location } from '@/components/common/icons';
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
import { Button, Message, Panel, useConfirm, useToast } from '@/lib/primevue';
import { atsService, electrificationProjectService, externalApiService, userService } from '@/services';
import { useCodeStore, useProjectStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH, YES_NO_LIST } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX,
  ATS_MANAGING_REGION,
  QUEUE_PRIORITY,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/projectCommon';
import {
  ATSCreateTypes,
  BasicResponse,
  GroupName,
  IdentityProviderKind,
  Initiative,
  Regex
} from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { findIdpConfig, omit, scrollToFirstError, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type {
  ATSAddressResource,
  ATSClientResource,
  ATSEnquiryResource,
  Contact,
  ElectrificationProject,
  OrgBookOption,
  User
} from '@/types';

// Props
const { editable = true, project } = defineProps<{
  editable?: boolean;
  project: ElectrificationProject;
}>();

// Emits
const emit = defineEmits<{
  (e: 'input-project-name', newName: string): void;
}>();

// Constants
const ATS_ENQUIRY_TYPE_CODE = toTitleCase(Initiative.ELECTRIFICATION) + ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX;

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

// Store
const projectStore = useProjectStore();
const { codeList, enums, options } = useCodeStore();

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const orgBookOptions: Ref<Array<OrgBookOption>> = ref([]);
const showCancelMessage: Ref<boolean> = ref(false);

// Actions
const projectFormSchema = createProjectFormSchema(codeList, enums);

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
  const firstContact = project?.activity?.activityContact?.[0]?.contact;

  return {
    contact: {
      contactId: firstContact?.contactId,
      firstName: firstContact?.firstName,
      lastName: firstContact?.lastName,
      phoneNumber: firstContact?.phoneNumber,
      email: firstContact?.email,
      contactApplicantRelationship: firstContact?.contactApplicantRelationship,
      contactPreference: firstContact?.contactPreference,
      userId: firstContact?.userId
    },
    project: {
      companyIdRegistered: project.companyIdRegistered,
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
    atsEnquiryId: project.atsEnquiryId,

    // Updates
    aaiUpdated: project.aaiUpdated,
    addedToAts: project.addedToAts
  };
}

async function createATSClientEnquiry() {
  try {
    const address: Partial<ATSAddressResource> = {
      '@type': 'AddressResource',
      primaryPhone: formRef.value?.values.contact.phoneNumber ?? '',
      email: formRef.value?.values?.contact.email ?? ''
    };

    const data = {
      '@type': 'ClientResource',
      address: address,
      firstName: formRef.value?.values.contact.firstName,
      surName: formRef.value?.values.contact.lastName,
      regionName: GroupName.NAVIGATOR,
      optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase()
    };

    const submitData: ATSClientResource = setEmptyStringsToNull(data);
    const response = await atsService.createATSClient(submitData);
    if (response.status === 201) {
      let atsEnquiryId = undefined;
      if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY)
        atsEnquiryId = await createATSEnquiry(response.data.clientId);
      if (atsEnquiryId) toast.success(t('i.electrification.projectForm.atsClientEnquiryPushed'));
      else toast.success(t('i.electrification.projectForm.atsClientPushed'));
      return { atsClientId: response.data.clientId, atsEnquiryId: atsEnquiryId };
    }
  } catch (error) {
    toast.error(t('i.electrification.projectForm.atsClientPushError') + ' ' + error);
  }
}

async function createATSEnquiry(atsClientId?: number) {
  try {
    const ATSEnquiryData: ATSEnquiryResource = {
      '@type': 'EnquiryResource',
      clientId: (atsClientId as number) ?? formRef.value?.values.atsClientId,
      contactFirstName: formRef.value?.values.contact.firstName,
      contactSurname: formRef.value?.values.contact.lastName,
      regionName: ATS_MANAGING_REGION,
      subRegionalOffice: GroupName.NAVIGATOR,
      enquiryFileNumbers: [project.activityId],
      enquiryPartnerAgencies: [Initiative.ELECTRIFICATION],
      enquiryMethodCodes: [Initiative.PCNS],
      notes: formRef.value?.values.project.projectName,
      enquiryTypeCodes: [ATS_ENQUIRY_TYPE_CODE]
    };
    const response = await atsService.createATSEnquiry(ATSEnquiryData);
    if (response.status === 201) {
      if (atsCreateType.value === ATSCreateTypes.ENQUIRY)
        toast.success(t('i.electrification.projectForm.atsEnquiryPushed'));
      return response.data.enquiryId;
    }
  } catch (error) {
    toast.success(t('i.electrification.projectForm.atsClientPushed'));
    toast.error(t('i.electrification.projectForm.atsEnquiryPushError') + ' ' + error);
  }
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

  if (errors.includes('contact.firstName')) {
    toast.warn(t('i.electrification.projectForm.basicInfoMissing'));
  }
  scrollToFirstError(e.errors);
}

async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook(e.query))?.data?.results ?? [];
    orgBookOptions.value = results
      .filter((x: { [key: string]: string }) => x.type === 'name')
      // map value and topic_source_id for AutoComplete display and selection
      .map((x: { [key: string]: string }) => ({
        registeredName: x.value,
        registeredId: x.topic_source_id
      }));
  }
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
      onSubmit(formRef.value?.values);
    }
  });
}

// Set basic info, clear it if no contact is provided
function setBasicInfo(contact?: Contact) {
  formRef.value?.setFieldValue('contact.contactId', contact?.contactId);
  formRef.value?.setFieldValue('contact.firstName', contact?.firstName);
  formRef.value?.setFieldValue('contact.lastName', contact?.lastName);
  formRef.value?.setFieldValue('contact.phoneNumber', contact?.phoneNumber);
  formRef.value?.setFieldValue('contact.email', contact?.email);
  formRef.value?.setFieldValue('contact.contactApplicantRelationship', contact?.contactApplicantRelationship);
  formRef.value?.setFieldValue('contact.contactPreference', contact?.contactPreference);
  formRef.value?.setFieldValue('contact.userId', contact?.userId);
}

const onSubmit = async (values: any) => {
  try {
    if (atsCreateType.value === ATSCreateTypes.CLIENT_ENQUIRY) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      values.atsEnquiryId = response?.atsEnquiryId;
      if (values.atsEnquiryId && values.atsClientId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.ENQUIRY) {
      values.atsEnquiryId = await createATSEnquiry();
      if (values.atsEnquiryId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    } else if (atsCreateType.value === ATSCreateTypes.CLIENT) {
      const response = await createATSClientEnquiry();
      values.atsClientId = response?.atsClientId;
      if (values.atsEnquiryId && values.atsClientId) {
        values.addedToAts = true;
      }
      atsCreateType.value = undefined;
    }

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
          atsClientId: parseInt(values.atsClientId) || '',
          atsEnquiryId: parseInt(values.atsEnquiryId) || '',
          aaiUpdated: values.aaiUpdated,
          addedToAts: values.addedToAts
        }
      }),
      [
        'contactId',
        'contactFirstName',
        'contactLastName',
        'contactPhoneNumber',
        'contactEmail',
        'contactApplicantRelationship',
        'contactPreference',
        'contactUserId',
        'assignedUser',
        'submissionState'
      ]
    );

    // Update project
    const result = await electrificationProjectService.updateProject(project.electrificationProjectId, dataOmitted);

    // Update store with returned data
    projectStore.setProject(result.data);

    // Reinitialize the form
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
          :form-values="initialFormValues"
          @contact-card-nav-form:pick="
            (contact: Contact) => {
              setBasicInfo(contact);
            }
          "
          @contact-card-nav-form:manual-entry="
            () => {
              setBasicInfo();
            }
          "
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
            <AutoComplete
              name="project.companyNameRegistered"
              :label="t('i.electrification.projectForm.companyLabel')"
              :bold="true"
              :disabled="!editable"
              :editable="true"
              :placeholder="'Type to search the B.C registered name'"
              :get-option-label="(option: OrgBookOption) => option.registeredName"
              :suggestions="orgBookOptions"
              @on-complete="onRegisteredNameInput"
              @on-select="
                (orgBookOption: OrgBookOption) => {
                  setFieldValue('project.companyIdRegistered', orgBookOption.registeredId);
                  setFieldValue('project.companyNameRegistered', orgBookOption.registeredName);
                }
              "
            />
            <InputText
              name="project.projectName"
              :label="t('i.electrification.projectForm.projectNameLabel')"
              :disabled="!editable"
              @on-input="emitProjectNameChange"
            />
            <InputText
              name="project.companyIdRegistered"
              :label="t('i.common.projectForm.orgBookRegistration')"
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
