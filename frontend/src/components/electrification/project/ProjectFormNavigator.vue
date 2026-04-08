<script setup lang="ts">
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { Form, type GenericObject } from 'vee-validate';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ATSInfo from '@/components/ats/ATSInfo.vue';
import { CancelButton, FormNavigationGuard } from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import AstNotesPanel from '@/components/form/panel/AstNotesPanel.vue';
import CompanyProjectNamePanel from '@/components/form/panel/CompanyProjectNamePanel.vue';
import ElectrificationPanel from '@/components/form/panel/ElectrificationPanel.vue';
import LocationDescriptionPanel from '@/components/form/panel/LocationDescriptionPanel.vue';
import ProjectDescriptionPanel from '@/components/form/panel/ProjectDescriptionPanel.vue';
import ProjectAreasUpdatedSection from '@/components/form/section/ProjectAreasUpdatedSection.vue';
import SubmissionStateSection from '@/components/form/section/SubmissionStateSection.vue';
import { Button, Message, useConfirm, useToast } from '@/lib/primevue';
import { atsService, electrificationProjectService, userService } from '@/services';
import { useAppStore, useCodeStore, useFormStore, useProjectStore } from '@/store';
import { ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX, ATS_MANAGING_REGION } from '@/utils/constants/projectCommon';
import { ATSCreateTypes, BasicResponse, GroupName, Initiative } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus, FormState, FormType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { scrollToFirstError, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';
import { createProjectFormNavigatorSchema } from '@/validators/electrification/projectFormNavigatorSchema';

import type { Ref } from 'vue';
import type {
  ATSAddressResource,
  ATSClientResource,
  ATSEnquiryResource,
  Contact,
  DeepPartial,
  ElectrificationProject,
  OrgBookOption,
  User
} from '@/types';
import type { FormSchemaType } from '@/validators/electrification/projectFormNavigatorSchema';

// Props
const { project } = defineProps<{
  project: ElectrificationProject;
}>();

// Constants
const ATS_ENQUIRY_TYPE_CODE = toTitleCase(Initiative.ELECTRIFICATION) + ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX;

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const projectStore = useProjectStore();
const { codeList, enums } = useCodeStore();
const { getActivityContacts } = storeToRefs(projectStore);
const { getEditable } = storeToRefs(useFormStore());

// State
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);
const orgBookOptions: Ref<OrgBookOption[]> = ref([]);
const showCancelMessage: Ref<boolean> = ref(false);

const primaryContact = computed(
  () => getActivityContacts.value.find((ac) => ac.role === ActivityContactRole.PRIMARY)?.contact
);

// Actions
const projectFormNavigatorSchema = computed(() => {
  return createProjectFormNavigatorSchema({
    initiative: getInitiative.value,
    t,
    codeList,
    enums,
    orgBookOptions: orgBookOptions.value
  });
});

const isCompleted = computed(() => {
  return project.applicationStatus === ApplicationStatus.COMPLETED;
});

async function initializeFormValues(project: ElectrificationProject): Promise<DeepPartial<FormSchemaType>> {
  let assigneeOptions: User[] = [];
  if (project.assignedUserId)
    assigneeOptions = (await userService.searchUsers({ userId: [project.assignedUserId] })).data;

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

    companyProjectName: {
      companyIdRegistered: project.companyIdRegistered,
      companyNameRegistered: project.companyNameRegistered,
      projectName: project.projectName
    },

    electrification: {
      bcHydroNumber: project.bcHydroNumber,
      projectType: project.projectType,
      hasEpa: project.hasEpa ? BasicResponse.YES : BasicResponse.NO,
      megawatts: project.megawatts,
      projectCategory: project.projectCategory,
      bcEnvironmentAssessNeeded: project.bcEnvironmentAssessNeeded ? BasicResponse.YES : BasicResponse.NO
    },

    // Additional Info
    projectDescription: { description: project.projectDescription },

    // Location
    locationDescription: { description: project.locationDescription },

    // Automated Status Tool Notes
    astNotes: { notes: project.astNotes },

    // Submission state
    submissionState: {
      queuePriority: project.queuePriority,
      submissionType: project.submissionType,
      assignedUser: assigneeOptions[0] ?? null,
      applicationStatus: project.applicationStatus
    },

    // ATS link
    atsInfo: {
      atsClientId: project.atsClientId,
      atsEnquiryId: project.atsEnquiryId
    },

    // Updates
    projectAreasUpdated: {
      aaiUpdated: project.aaiUpdated,
      addedToAts: project.addedToAts
    }
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
      notes: formRef.value?.values.companyProjectName.projectName,
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

async function handleAtsCreate(values: GenericObject) {
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

function onInvalidSubmit(e: GenericObject) {
  const errors = Object.keys(e.errors);

  if (errors.includes('contact.firstName')) {
    toast.warn(t('i.electrification.projectForm.basicInfoMissing'));
  }
  scrollToFirstError(e.errors);
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

const onSubmit = async (formValues: GenericObject) => {
  try {
    // vee-validate doesn't get transformed data from yup so
    // manually run the form values through it here
    const values: FormSchemaType = projectFormNavigatorSchema.value.cast(formValues);

    await handleAtsCreate(values);

    // Generate final payload
    // TODO: Create a type using Pick instead of Partial?
    const payload: Partial<ElectrificationProject> = {
      // Company and Project Information
      projectName: values.companyProjectName.projectName,
      companyNameRegistered: values.companyProjectName.companyNameRegistered,
      companyIdRegistered: values.companyProjectName.companyIdRegistered,

      // Electrification
      projectType: values.electrification.projectType,
      bcHydroNumber: values.electrification.bcHydroNumber,
      hasEpa: values.electrification.hasEpa,
      megawatts: values.electrification.megawatts,
      bcEnvironmentAssessNeeded: values.electrification.bcEnvironmentAssessNeeded,
      projectCategory: values.electrification.projectCategory,

      // Additional Project Information
      projectDescription: values.projectDescription.description,

      // Additional Location Information
      locationDescription: values.locationDescription.description,

      // AST Notes
      astNotes: values.astNotes.notes,

      // Submission State
      assignedUserId: values.submissionState.assignedUser ? (values.submissionState.assignedUser as User).userId : null,
      applicationStatus: values.submissionState.applicationStatus,
      submissionType: values.submissionState.submissionType,
      queuePriority: values.submissionState.queuePriority,

      // ATS
      atsClientId: values.atsInfo.atsClientId,
      atsEnquiryId: values.atsInfo.atsEnquiryId,

      // Updates
      aaiUpdated: values.projectAreasUpdated.aaiUpdated,
      addedToAts: values.projectAreasUpdated.addedToAts
    };

    // Update project
    const result = await electrificationProjectService.updateProject(project.electrificationProjectId, payload);
    projectStore.setProject(result.data);

    // Wait a tick for store to propagate
    await nextTick();

    // Reinitialize the form
    formRef.value?.resetForm({
      values: await initializeFormValues(result.data)
    });

    toast.success(t('i.common.form.savedMessage'));
  } catch (e) {
    if (isAxiosError(e) || e instanceof Error) toast.error(t('i.common.projectForm.failedMessage'), e.message);
  }
};

// Set basic info, clear it if no contact is provided
function setBasicInfo(contact?: Contact) {
  if (!formRef.value) return;

  const updatedContact = {
    contactId: contact?.contactId,
    firstName: contact?.firstName,
    lastName: contact?.lastName,
    phoneNumber: contact?.phoneNumber,
    email: contact?.email,
    contactApplicantRelationship: contact?.contactApplicantRelationship,
    contactPreference: contact?.contactPreference,
    userId: contact?.userId
  };

  // Reset the entire contact object path to trigger reactivity and set the new baseline
  formRef.value.resetField('contact', { value: updatedContact });
}

watch(primaryContact, (newContact, oldContact) => {
  if (newContact?.contactId !== oldContact?.contactId) {
    setBasicInfo(newContact);
  }
});

onBeforeMount(async () => {
  useFormStore().setFormType(FormType.NAVIGATOR);
  useFormStore().setFormState(FormState.UNLOCKED);

  // Default form values
  initialFormValues.value = await initializeFormValues(project);
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
    :validation-schema="projectFormNavigatorSchema"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!isCompleted" />

    <div class="grid grid-cols-[4fr_1fr] gap-x-9 mt-4">
      <div class="flex flex-col gap-y-9">
        <div class="p-panel flex justify-between items-start px-6 py-4">
          <h2 class="section-header my-0">
            {{ values.companyProjectName.companyNameRegistered }}
          </h2>
          <div class="flex flex-col">
            <span>{{ t('i.electrification.projectForm.submissionDate') }}</span>
            <span class="text-[var(--p-bcblue-900)]">{{ formatDate(project.submittedAt) }}</span>
          </div>
        </div>

        <ContactCardNavForm :form-values="values" />
        <CompanyProjectNamePanel @org-book-options="(e) => (orgBookOptions = e)" />
        <ElectrificationPanel />
        <ProjectDescriptionPanel />
        <LocationDescriptionPanel />
        <AstNotesPanel />
      </div>
      <div class="flex flex-col gap-y-9">
        <SubmissionStateSection />
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
        <ProjectAreasUpdatedSection />
      </div>
    </div>
    <div class="mt-16">
      <Button
        v-if="!isCompleted"
        label="Save"
        type="submit"
        icon="pi pi-check"
        :disabled="!getEditable"
      />
      <CancelButton
        v-if="!isCompleted"
        :editable="getEditable"
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
