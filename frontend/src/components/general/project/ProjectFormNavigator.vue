<script setup lang="ts">
import { isAxiosError } from 'axios';
import { storeToRefs } from 'pinia';
import { Form, type GenericObject } from 'vee-validate';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { createProjectFormNavigatorSchema } from '@/validators/general/projectFormNavigatorSchema';
import ATSInfo from '@/components/ats/ATSInfo.vue';
import { CancelButton, FormNavigationGuard } from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import AstNotesPanel from '@/components/form/panel/AstNotesPanel.vue';
import CompanyProjectNamePanel from '@/components/form/panel/CompanyProjectNamePanel.vue';
import LocationDescriptionPanel from '@/components/form/panel/LocationDescriptionPanel.vue';
import LocationPanel from '@/components/form/panel/LocationPanel.vue';
import LocationPidsPanel from '@/components/form/panel/LocationPidsPanel.vue';
import ProjectDescriptionPanel from '@/components/form/panel/ProjectDescriptionPanel.vue';
import ProjectAreasUpdatedSection from '@/components/form/section/ProjectAreasUpdatedSection.vue';
import RelatedEnquiriesSection from '@/components/form/section/RelatedEnquiriesSection.vue';
import SubmissionStateSection from '@/components/form/section/SubmissionStateSection.vue';
import { Button, Message, useConfirm, useToast } from '@/lib/primevue';
import { atsService, generalProjectService, mapService, userService } from '@/services';
import { useAppStore, useCodeStore, useFormStore, useProjectStore } from '@/store';
import { ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX, ATS_MANAGING_REGION } from '@/utils/constants/projectCommon';
import { ATSCreateTypes, BasicResponse, GroupName, Initiative } from '@/utils/enums/application';
import {
  ActivityContactRole,
  ApplicationStatus,
  Area,
  BusinessArea,
  FormState,
  FormType,
  Region
} from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { scrollToFirstError, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';

import type { Ref } from 'vue';
import type {
  ATSAddressResource,
  ATSClientResource,
  ATSEnquiryResource,
  Contact,
  DeepPartial,
  GeneralProject,
  OrgBookOption,
  User
} from '@/types';
import type { FormSchemaType } from '@/validators/general/projectFormNavigatorSchema';

// Props
const { editable = true, project } = defineProps<{
  editable?: boolean;
  project: GeneralProject;
}>();

// Constants
const ATS_ENQUIRY_TYPE_CODE = toTitleCase(Initiative.GENERAL) + ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX;

// Composables
const { t } = useI18n();
const { enums } = useCodeStore();
const confirm = useConfirm();
const toast = useToast();

// Store
const projectStore = useProjectStore();
const { getInitiative } = storeToRefs(useAppStore());
const { getActivityContacts } = storeToRefs(projectStore);

// State
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<DeepPartial<FormSchemaType> | undefined> = ref(undefined);
const locationPidsAuto: Ref<string> = ref('');
const orgBookOptions: Ref<OrgBookOption[]> = ref([]);
const showCancelMessage: Ref<boolean> = ref(false);

const primaryContact = computed(
  () => getActivityContacts.value.find((ac) => ac.role === ActivityContactRole.PRIMARY)?.contact
);

// Actions
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
      if (atsEnquiryId) toast.success(t('i.housing.project.projectForm.atsClientEnquiryPushed'));
      else toast.success(t('i.housing.project.projectForm.atsClientPushed'));
      return { atsClientId: response.data.clientId, atsEnquiryId: atsEnquiryId };
    }
  } catch (error) {
    toast.error(t('i.housing.project.projectForm.atsClientPushError') + ' ' + error);
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
      enquiryPartnerAgencies: [Initiative.HOUSING],
      enquiryMethodCodes: [Initiative.PCNS],
      notes: formRef.value?.values.companyProjectName.projectName,
      enquiryTypeCodes: [ATS_ENQUIRY_TYPE_CODE]
    };
    const response = await atsService.createATSEnquiry(ATSEnquiryData);
    if (response.status === 201) {
      if (atsCreateType.value === ATSCreateTypes.ENQUIRY)
        toast.success(t('i.housing.project.projectForm.atsEnquiryPushed'));
      return response.data.enquiryId;
    }
  } catch (error) {
    toast.success(t('i.housing.project.projectForm.atsClientPushed'));
    toast.error(t('i.housing.project.projectForm.atsEnquiryPushError') + ' ' + error);
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

async function initializeFormValues(project: GeneralProject): Promise<DeepPartial<FormSchemaType>> {
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

    location: {
      locationAddress: [project.streetAddress, project.locality, project.province]
        .filter((str) => str?.trim())
        .join(', '),
      streetAddress: project.streetAddress,
      locality: project.locality,
      province: project.province,
      locationPids: project.locationPids,
      latitude: project.latitude,
      longitude: project.longitude,
      geomarkUrl: project.geomarkUrl,
      naturalDisaster: project.naturalDisaster ? BasicResponse.YES : BasicResponse.NO
    },

    locationPids: { auto: locationPidsAuto.value },

    companyProjectName: {
      companyIdRegistered: project.companyIdRegistered,
      companyNameRegistered: project.companyNameRegistered,
      projectName: project.projectName,
      projectNumber: project.projectNumber,
      activityType: project.activityType
    },

    // Additional Info
    projectDescription: { description: project.projectDescription },

    // Location
    locationDescription: { description: project.projectLocationDescription },

    // Automated Status Tool Notes
    astNotes: { notes: project.astNotes },

    // Submission state
    submissionState: {
      queuePriority: project.queuePriority,
      submissionType: project.submissionType,
      assignedUser: assigneeOptions[0]?.fullName ?? null,
      applicationStatus: project.applicationStatus,
      region: String(project.region),
      area: String(project.area)
    },

    // ATS link
    atsInfo: {
      atsClientId: project.atsClientId,
      atsEnquiryId: project.atsEnquiryId,
      businessArea: String(project.businessArea)
    },

    relatedEnquiries: { csv: project.relatedEnquiries },

    // Updates
    projectAreasUpdated: {
      aaiUpdated: project.aaiUpdated
    }
  };
}

const isCompleted = computed(() => {
  return project.applicationStatus === ApplicationStatus.COMPLETED;
});

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
    toast.warn(t('i.housing.project.projectForm.basicInfoMissing'));
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
    const values: FormSchemaType = projectFormNavigatorSchema.cast(formValues);

    await handleAtsCreate(values);

    // Generate final payload
    // TODO: Create a type using Pick instead of Partial?
    const payload: Partial<GeneralProject> = {
      // Company and Project Information
      projectName: values.companyProjectName.projectName,
      companyNameRegistered: values.companyProjectName.companyNameRegistered,
      companyIdRegistered: values.companyProjectName.companyIdRegistered,
      activityType: values.companyProjectName.activityType!, // Req for General but the type doesnt know until runtime

      // Location
      locality: values.location.locality,
      province: values.location.province,
      locationPids: values.location.locationPids,
      latitude: values.location.latitude,
      longitude: values.location.longitude,
      streetAddress: values.location.streetAddress,
      geomarkUrl: values.location.geomarkUrl,
      naturalDisaster: values.location.naturalDisaster === BasicResponse.YES,

      // Additional Location Information
      projectLocationDescription: values.locationDescription.description,

      // Additional Project Information
      projectDescription: values.projectDescription.description,

      // AST Notes
      astNotes: values.astNotes.notes,

      // Submission State
      assignedUserId: values.submissionState.assignedUser ? (values.submissionState.assignedUser as User).userId : null,
      region: values.submissionState.region as Region,
      area: values.submissionState.area as Area,
      applicationStatus: values.submissionState.applicationStatus,
      submissionType: values.submissionState.submissionType,
      queuePriority: values.submissionState.queuePriority,

      // ATS
      businessArea: values.atsInfo.businessArea as BusinessArea,

      // Updates
      aaiUpdated: values.projectAreasUpdated.aaiUpdated
    };

    // Update project
    const result = await generalProjectService.updateProject(project.generalProjectId, payload);
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

const projectFormNavigatorSchema = createProjectFormNavigatorSchema({
  initiative: getInitiative.value,
  t,
  enums,
  orgBookOptions: orgBookOptions.value
});

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
  locationPidsAuto.value = (await mapService.getPIDs(project.generalProjectId)).data;

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
          <h2 class="section-header my-0">{{ values.contact.firstName }} {{ values.contact.lastName }}</h2>
          <div class="flex flex-col">
            <span>{{ t('i.housing.project.projectForm.submissionDate') }}</span>
            <span class="text-[var(--p-bcblue-900)]">{{ formatDate(project.submittedAt) }}</span>
          </div>
        </div>
        <ContactCardNavForm
          :editable="editable"
          :form-values="values"
        />
        <CompanyProjectNamePanel @org-book-options="(e) => (orgBookOptions = e)" />
        <LocationPanel />
        <LocationPidsPanel />
        <LocationDescriptionPanel />
        <ProjectDescriptionPanel />
        <AstNotesPanel />
      </div>
      <div class="flex flex-col gap-y-9">
        <SubmissionStateSection />
        <RelatedEnquiriesSection />
        <ATSInfo
          :ats-client-id="values.atsClientId"
          :ats-enquiry-id="values.atsEnquiryId"
          :first-name="values.contact.firstName"
          :last-name="values.contact.lastName"
          :phone-number="values.contact.phoneNumber"
          :email="values.contact.email"
          @ats-info:set-client-id="(atsClientId: number | null) => setFieldValue('atsInfo.atsClientId', atsClientId)"
          @ats-info:set-added-to-ats="(addedToATS: boolean) => setFieldValue('atsInfo.addedToAts', addedToATS)"
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
        :disabled="!editable"
      />
      <CancelButton
        v-if="!isCompleted"
        :editable="editable"
        @clicked="onCancel"
      />
      <Button
        v-if="isCompleted"
        :label="t('i.housing.project.projectForm.reopenSubmission')"
        icon="pi pi-check"
        @click="onReOpen()"
      />
    </div>
  </Form>
</template>
