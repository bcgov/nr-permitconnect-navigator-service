<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { boolean, number, object, string } from 'yup';

import { formatDateFilename } from '@/utils/formatters';

import {
  CancelButton,
  Checkbox,
  DatePicker,
  EditableSelect,
  FormNavigationGuard,
  InputMask,
  InputNumber,
  InputText,
  Select,
  SectionHeader,
  TextArea
} from '@/components/form';
import ATSUserLinkModal from '@/components/user/ATSUserLinkModal.vue';
import ATSUserCreateModal from '@/components/user/ATSUserCreateModal.vue';
import ATSUserDetailsModal from '@/components/user/ATSUserDetailsModal.vue';
import ContactSearchModal from '@/components/contact/ContactSearchModal.vue';
import { Button, Message, useConfirm, useToast } from '@/lib/primevue';
import {
  activityContactService,
  atsService,
  contactService,
  housingProjectService,
  mapService,
  userService
} from '@/services';
import { useProjectStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH, YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import {
  APPLICATION_STATUS_LIST,
  ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX,
  ATS_MANAGING_REGION,
  CONTACT_PREFERENCE_LIST,
  INTAKE_STATUS_LIST,
  QUEUE_PRIORITY,
  PROJECT_RELATIONSHIP_LIST,
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
import { ApplicationStatus, IntakeStatus } from '@/utils/enums/projectCommon';
import { findIdpConfig, omit, scrollToFirstError, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';
import {
  assignedToValidator,
  atsClientIdValidator,
  contactValidator,
  latitudeValidator,
  longitudeValidator
} from '@/validators';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { ATSAddressResource, ATSClientResource, ATSEnquiryResource, Contact, HousingProject, User } from '@/types';

// Props
const { editable = true, housingProject } = defineProps<{
  editable?: boolean;
  housingProject: HousingProject;
}>();

// Constants
const ATS_ENQUIRY_TYPE_CODE = toTitleCase(Initiative.HOUSING) + ATS_ENQUIRY_TYPE_CODE_PROJECT_INTAKE_SUFFIX;

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
const basicInfoManualEntry: Ref<boolean> = ref(false);
const geoJson = ref(null);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const searchContactModalVisible: Ref<boolean> = ref(false);
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const showCancelMessage: Ref<boolean> = ref(false);

// Form validation schema
const formSchema = object({
  queuePriority: number()
    .required()
    .integer()
    .min(0)
    .max(3)
    .typeError('Queue Priority must be a number')
    .label('Queue Priority'),
  submissionType: string().required().oneOf(SUBMISSION_TYPE_LIST).label('Submission type'),
  submittedAt: string().required().label('Submission date'),
  relatedEnquiries: string().notRequired().label('Related enquiries'),
  ...contactValidator,
  companyNameRegistered: string().notRequired().max(255).label('Company'),
  consentToFeedback: string().notRequired().nullable().label('Consent to feedback'),
  isDevelopedInBc: string().when('companyNameRegistered', {
    is: (val: string) => val,
    then: (schema) => schema.required().oneOf(YES_NO_LIST).label('Company registered in B.C'),
    otherwise: () => string().notRequired()
  }),
  projectName: string().required().label('Project Name'),
  projectDescription: string().notRequired().label('Additional information about project'),
  singleFamilyUnits: string().notRequired().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Single family units'),
  multiFamilyUnits: string().notRequired().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Multi-family units'),
  otherUnitsDescription: string().notRequired().max(255).label('Other type'),
  otherUnits: string().when('otherUnitsDescription', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Other type units'),
    otherwise: () => string().notRequired()
  }),
  hasRentalUnits: string().required().oneOf(YES_NO_UNSURE_LIST).label('Rental included'),
  rentalUnits: string().when('hasRentalUnits', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Rental units'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedBc: string().required().oneOf(YES_NO_UNSURE_LIST).label('BC Housing'),
  financiallySupportedIndigenous: string().required().oneOf(YES_NO_UNSURE_LIST).label('Indigenous Housing Provider'),
  indigenousDescription: string().when('financiallySupportedIndigenous', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().max(255).label('Name of Indigenous Housing Provider'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedNonProfit: string().required().oneOf(YES_NO_UNSURE_LIST).label('Non-profit housing society'),
  nonProfitDescription: string().when('financiallySupportedNonProfit', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().max(255).label('Name of Non-profit housing society'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedHousingCoop: string().required().oneOf(YES_NO_UNSURE_LIST).label('Housing co-operative'),
  housingCoopDescription: string().when('financiallySupportedHousingCoop', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().max(255).label('Name of Housing co-operative'),
    otherwise: () => string().notRequired()
  }),
  streetAddress: string().notRequired().max(255).label('Street address'),
  locality: string().notRequired().max(255).label('Locality'),
  province: string().notRequired().max(255).label('Province'),
  locationPids: string().notRequired().max(255).label('Location PID(s)'),
  latitude: latitudeValidator,
  longitude: longitudeValidator,
  geomarkUrl: string().notRequired().max(255).label('Geomark URL'),
  naturalDisaster: string().oneOf(YES_NO_LIST).required().label('Affected by natural disaster'),
  projectLocationDescription: string().notRequired().max(4000).label('Additional information about location'),
  addedToAts: boolean().required().label('Authorized Tracking System (ATS) updated'),
  atsClientId: atsClientIdValidator,
  ltsaCompleted: boolean().required().label('Land Title Survey Authority (LTSA) completed'),
  bcOnlineCompleted: boolean().required().label('BC Online completed'),
  aaiUpdated: boolean().required().label('Authorization and Approvals Insight (AAI) updated'),
  astNotes: string().notRequired().max(4000).label('Automated Status Tool (AST) Notes'),
  intakeStatus: string().oneOf(INTAKE_STATUS_LIST).label('Intake state'),
  user: assignedToValidator('intakeStatus', IntakeStatus.SUBMITTED),
  applicationStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Project state'),
  waitingOn: string().notRequired().max(255).label('waiting on')
});

// Actions
const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName} [${e.email}]`;
};

const isCompleted = computed(() => {
  return housingProject.applicationStatus === ApplicationStatus.COMPLETED;
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

  if (errors.includes('contactFirstName')) {
    toast.warn(t('submissionForm.basicInfoMissing'));
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
      formRef.value?.setFieldValue('applicationStatus', ApplicationStatus.IN_PROGRESS);
      onSubmit(formRef.value?.values);
    }
  });
}

const onSaveGeoJson = () => {
  if (!geoJson.value) return;

  const file = new Blob([JSON.stringify(geoJson.value, null, 2)], {
    type: 'application/geo+json'
  });

  const downloadLink = URL.createObjectURL(file);
  const downloadElement = document.createElement('a');
  downloadElement.href = downloadLink;

  const currentDateTime = formatDateFilename(new Date().toISOString());
  const projectName = projectStore?.getProject?.projectName ?? '';
  const projectActivityId = projectStore?.getProject?.activityId ?? '';

  downloadElement.download = `${currentDateTime}_${projectName}_${projectActivityId}.geojson`;
  downloadElement.click();
  URL.revokeObjectURL(downloadLink);
};

// Set basic info, clear it if no contact is provided
function setBasicInfo(contact?: Contact) {
  formRef.value?.setFieldValue('contactId', contact?.contactId);
  formRef.value?.setFieldValue('contactFirstName', contact?.firstName);
  formRef.value?.setFieldValue('contactLastName', contact?.lastName);
  formRef.value?.setFieldValue('contactPhoneNumber', contact?.phoneNumber);
  formRef.value?.setFieldValue('contactEmail', contact?.email);
  formRef.value?.setFieldValue('contactApplicantRelationship', contact?.contactApplicantRelationship);
  formRef.value?.setFieldValue('contactPreference', contact?.contactPreference);
  formRef.value?.setFieldValue('contactUserId', contact?.userId);
  basicInfoManualEntry.value = false;
}

function onNewATSEnquiry() {
  confirm.require({
    message: t('submissionForm.atsEnquiryConfirmMsg'),
    header: t('submissionForm.atsEnquiryConfirmTitle'),
    acceptLabel: t('submissionForm.confirm'),
    rejectLabel: t('submissionForm.cancel'),
    rejectProps: { outlined: true },
    accept: () => {
      atsCreateType.value = ATSCreateTypes.ENQUIRY;
    }
  });
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
      'contactPreference',
      'contactUserId',
      'locationPidsAuto',
      'locationAddress',
      'relatedEnquiries',
      'user'
    ]);

    // Generate final submission object
    const submitData: HousingProject = setEmptyStringsToNull({
      ...dataOmitted,
      atsClientId: parseInt(values.atsClientId) || ''
    });

    submitData.assignedUserId = values.user?.userId ?? undefined;
    submitData.consentToFeedback = values.consentToFeedback === BasicResponse.YES;
    submitData.naturalDisaster = values.naturalDisaster === BasicResponse.YES;

    // Update project - order of calls is important
    const contactResponse = (await contactService.updateContact(contact)).data;
    await activityContactService.updateActivityContact(values.activityId, [
      { ...contact, contactId: contactResponse.contactId }
    ]);
    const result = await housingProjectService.updateProject(values.housingProjectId, submitData);

    // Update store with returned data
    projectStore.setProject(result.data);

    // TODO: Create one function for creating initial values and reset values
    const firstContact = result.data?.activity?.activityContact?.[0]?.contact;
    formRef.value?.resetForm({
      values: {
        ...submitData,
        contactId: firstContact.contactId,
        contactFirstName: firstContact.firstName,
        contactLastName: firstContact.lastName,
        contactPhoneNumber: firstContact.phoneNumber,
        contactEmail: firstContact.email,
        contactApplicantRelationship: firstContact.contactApplicantRelationship,
        contactPreference: firstContact.contactPreference,
        contactUserId: firstContact.userId,
        locationAddress: values.locationAddress,
        naturalDisaster: values.naturalDisaster,
        user: values.user,
        consentToFeedback: values.consentToFeedback
      }
    });
    basicInfoManualEntry.value = false;
    toast.success(t('i.common.form.savedMessage'));
  } catch (e: any) {
    toast.error(t('i.common.projectForm.failedMessage'), e.message);
  }
};

function updateLocationAddress(values: any, setFieldValue?: Function) {
  const locationAddressStr = [values.streetAddress, values.locality, values.province]
    .filter((str) => str?.trim())
    .join(', ');

  if (setFieldValue) setFieldValue('locationAddress', locationAddressStr);

  return locationAddressStr;
}

async function createATSClientEnquiry() {
  try {
    const address: Partial<ATSAddressResource> = {
      '@type': 'AddressResource',
      primaryPhone: formRef.value?.values.contactPhoneNumber ?? '',
      email: formRef.value?.values?.contactEmail ?? '',
      addressLine1: formRef.value?.values.streetAddress,
      city: formRef.value?.values.locality,
      provinceCode: formRef.value?.values.province
    };

    const data = {
      '@type': 'ClientResource',
      address: address,
      firstName: formRef.value?.values.contactFirstName,
      surName: formRef.value?.values.contactLastName,
      regionName: GroupName.NAVIGATOR,
      optOutOfBCStatSurveyInd: BasicResponse.NO.toUpperCase()
    };

    const submitData: ATSClientResource = setEmptyStringsToNull(data);
    const response = await atsService.createATSClient(submitData);
    if (response.status === 201) {
      const atsEnquiryId = await createATSEnquiry(response.data.clientId);
      if (atsEnquiryId) toast.success(t('submissionForm.atsClientEnquiryPushed'));
      else toast.success(t('submissionForm.atsClientPushed'));
      return { atsClientId: response.data.clientId, atsEnquiryId: atsEnquiryId };
    }
  } catch (error) {
    toast.error(t('submissionForm.atsClientPushError') + ' ' + error);
  }
}

async function createATSEnquiry(atsClientId?: number) {
  try {
    const ATSEnquiryData: ATSEnquiryResource = {
      '@type': 'EnquiryResource',
      clientId: (atsClientId as number) ?? formRef.value?.values.atsClientId,
      contactFirstName: formRef.value?.values.contactFirstName,
      contactSurname: formRef.value?.values.contactLastName,
      regionName: ATS_MANAGING_REGION,
      subRegionalOffice: GroupName.NAVIGATOR,
      enquiryFileNumbers: [formRef.value?.values.activityId],
      enquiryPartnerAgencies: [Initiative.HOUSING],
      enquiryMethodCodes: [Initiative.PCNS],
      notes: formRef.value?.values.projectName,
      enquiryTypeCodes: [ATS_ENQUIRY_TYPE_CODE]
    };
    const response = await atsService.createATSEnquiry(ATSEnquiryData);
    if (response.status === 201) {
      if (atsCreateType.value === ATSCreateTypes.ENQUIRY) toast.success(t('submissionForm.atsEnquiryPushed'));
      return response.data.enquiryId;
    }
  } catch (error) {
    toast.error(t('submissionForm.atsEnquiryPushError') + ' ' + error);
  }
}

onBeforeMount(async () => {
  if (housingProject.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [housingProject.assignedUserId] })).data;
  }

  const locationPidsAuto = (await mapService.getPIDs(housingProject.housingProjectId)).data;

  if (housingProject.geoJson) geoJson.value = housingProject.geoJson;

  const firstContact = housingProject?.activity?.activityContact?.[0]?.contact;

  // Default form values
  initialFormValues.value = {
    activityId: housingProject.activityId,
    housingProjectId: housingProject.housingProjectId,
    queuePriority: housingProject.queuePriority,
    submissionType: housingProject.submissionType,
    submittedAt: new Date(housingProject.submittedAt),
    relatedEnquiries: housingProject.relatedEnquiries,
    companyNameRegistered: housingProject.companyNameRegistered,
    isDevelopedInBc: housingProject.isDevelopedInBc,
    consentToFeedback: housingProject.consentToFeedback ? BasicResponse.YES : BasicResponse.NO,
    projectName: housingProject.projectName,
    projectDescription: housingProject.projectDescription,
    projectLocationDescription: housingProject.projectLocationDescription,
    singleFamilyUnits: housingProject.singleFamilyUnits,
    multiFamilyUnits: housingProject.multiFamilyUnits,
    otherUnitsDescription: housingProject.otherUnitsDescription,
    otherUnits: housingProject.otherUnits,
    hasRentalUnits: housingProject.hasRentalUnits,
    rentalUnits: housingProject.rentalUnits,
    financiallySupportedBc: housingProject.financiallySupportedBc,
    financiallySupportedIndigenous: housingProject.financiallySupportedIndigenous,
    indigenousDescription: housingProject.indigenousDescription,
    financiallySupportedNonProfit: housingProject.financiallySupportedNonProfit,
    nonProfitDescription: housingProject.nonProfitDescription,
    financiallySupportedHousingCoop: housingProject.financiallySupportedHousingCoop,
    housingCoopDescription: housingProject.housingCoopDescription,
    locationAddress: updateLocationAddress(housingProject),
    streetAddress: housingProject.streetAddress,
    locality: housingProject.locality,
    province: housingProject.province,
    locationPids: housingProject.locationPids,
    locationPidsAuto: locationPidsAuto,
    latitude: housingProject.latitude,
    longitude: housingProject.longitude,
    geomarkUrl: housingProject.geomarkUrl,
    naturalDisaster: housingProject.naturalDisaster ? BasicResponse.YES : BasicResponse.NO,
    addedToAts: housingProject.addedToAts,
    atsClientId: housingProject.atsClientId,
    atsEnquiryId: housingProject.atsEnquiryId,
    ltsaCompleted: housingProject.ltsaCompleted,
    bcOnlineCompleted: housingProject.bcOnlineCompleted,
    aaiUpdated: housingProject.aaiUpdated,
    astNotes: housingProject.astNotes,
    intakeStatus: housingProject.intakeStatus,
    contactId: firstContact?.contactId,
    contactFirstName: firstContact?.firstName,
    contactLastName: firstContact?.lastName,
    contactPhoneNumber: firstContact?.phoneNumber,
    contactEmail: firstContact?.email,
    contactApplicantRelationship: firstContact?.contactApplicantRelationship,
    contactPreference: firstContact?.contactPreference,
    contactUserId: firstContact?.userId,
    user: assigneeOptions.value[0] ?? null,
    applicationStatus: housingProject.applicationStatus,
    waitingOn: housingProject.waitingOn
  };
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
    :validation-schema="formSchema"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!isCompleted" />

    <div class="grid grid-cols-12 gap-4">
      <Select
        class="col-span-3"
        name="queuePriority"
        label="Priority"
        :disabled="!editable"
        :options="QUEUE_PRIORITY"
      />
      <Select
        class="col-span-3"
        name="submissionType"
        label="Submission type"
        :disabled="!editable"
        :options="SUBMISSION_TYPE_LIST"
      />
      <DatePicker
        class="col-span-3"
        name="submittedAt"
        label="Submission date"
        :disabled="true"
      />
      <InputText
        class="col-span-3"
        name="relatedEnquiries"
        label="Related enquiries"
        :disabled="true"
      />

      <SectionHeader title="Basic information" />
      <Button
        class="col-span-2"
        outlined
        aria-label="Search Contacts"
        :disabled="!editable"
        @click="searchContactModalVisible = true"
      >
        {{ t('i.common.projectForm.searchContacts') }}
      </Button>
      <div
        v-if="!values.contactUserId && values.contactId"
        class="col-span-12 mt-2"
      >
        <Message
          severity="warn"
          class="text-center"
          :closable="false"
        >
          {{ t('i.common.projectForm.manualContactHint') }}
        </Message>
      </div>
      <div
        v-if="values.contactId || basicInfoManualEntry"
        class="grid grid-cols-subgrid gap-4 col-span-12"
      >
        <InputText
          class="col-span-3"
          name="contactFirstName"
          label="First name"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <InputText
          class="col-span-3"
          name="contactLastName"
          label="Last name"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <InputText
          class="col-span-3"
          name="companyNameRegistered"
          label="Company"
          :disabled="!editable"
          @on-change="
            (e) => {
              if (!e.target.value) {
                setFieldValue('companyNameRegistered', null);
                setFieldValue('isDevelopedInBc', null);
              }
            }
          "
        />
        <Select
          class="col-span-3"
          name="isDevelopedInBc"
          label="Company registered in B.C?"
          :disabled="!editable || !values.companyNameRegistered"
          :options="YES_NO_LIST"
        />
        <Select
          class="col-span-3"
          name="contactApplicantRelationship"
          label="Relationship to project"
          :disabled="!editable || !basicInfoManualEntry"
          :options="PROJECT_RELATIONSHIP_LIST"
        />
        <Select
          class="col-span-3"
          name="contactPreference"
          label="Preferred contact method"
          :disabled="!editable || !basicInfoManualEntry"
          :options="CONTACT_PREFERENCE_LIST"
        />
        <InputMask
          class="col-span-3"
          name="contactPhoneNumber"
          mask="(999) 999-9999"
          label="Contact phone"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <InputText
          class="col-span-3"
          name="contactEmail"
          label="Contact email"
          :disabled="!editable || !basicInfoManualEntry"
        />
        <Select
          class="col-span-3"
          name="consentToFeedback"
          label="Research opt-in"
          :disabled="!editable"
          :options="YES_NO_LIST"
        />
      </div>
      <ContactSearchModal
        v-model:visible="searchContactModalVisible"
        @contact-search:pick="
          (contact: Contact) => {
            searchContactModalVisible = false;
            setBasicInfo(contact);
            basicInfoManualEntry = false;
          }
        "
        @contact-search:manual-entry="
          () => {
            searchContactModalVisible = false;
            setBasicInfo();
            basicInfoManualEntry = true;
          }
        "
      />

      <SectionHeader title="Housing" />

      <InputText
        class="col-span-3"
        name="projectName"
        label="Project name"
        :disabled="!editable"
      />
      <div class="col-span-9" />
      <TextArea
        class="col-span-12"
        name="projectDescription"
        label="Additional information about project"
        :disabled="!editable"
      />
      <Select
        class="col-span-3"
        name="singleFamilyUnits"
        label="Single family units"
        :disabled="!editable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Select
        class="col-span-3"
        name="multiFamilyUnits"
        label="Multi-family units"
        :disabled="!editable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <InputText
        class="col-span-3"
        name="otherUnitsDescription"
        label="Other type"
        :disabled="!editable"
        @on-change="
          (e) => {
            if (!e.target.value) {
              setFieldValue('otherUnitsDescription', null);
              setFieldValue('otherUnits', null);
            }
          }
        "
      />
      <Select
        class="col-span-3"
        name="otherUnits"
        label="Other type units"
        :disabled="!editable || !values.otherUnitsDescription"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Select
        class="col-span-3"
        name="hasRentalUnits"
        label="Rental included?"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e: SelectChangeEvent) => {
            if (e.value !== BasicResponse.YES) setFieldValue('rentalUnits', null);
          }
        "
      />
      <Select
        class="col-span-3"
        name="rentalUnits"
        label="Rental units"
        :disabled="!editable || values.hasRentalUnits !== BasicResponse.YES"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />

      <SectionHeader title="Financially supported" />

      <Select
        class="col-span-3"
        name="financiallySupportedBc"
        label="BC Housing"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
      />
      <div class="col-span-9" />
      <Select
        class="col-span-3"
        name="financiallySupportedIndigenous"
        label="Indigenous Housing Provider"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e: SelectChangeEvent) => {
            if (e.value !== BasicResponse.YES) setFieldValue('indigenousDescription', null);
          }
        "
      />
      <InputText
        class="col-span-3"
        name="indigenousDescription"
        label="Name of Indigenous Housing Provider"
        :disabled="!editable || values.financiallySupportedIndigenous !== BasicResponse.YES"
      />
      <div class="col-span-6" />
      <Select
        class="col-span-3"
        name="financiallySupportedNonProfit"
        label="Non-profit housing society"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e: SelectChangeEvent) => {
            if (e.value !== BasicResponse.YES) setFieldValue('nonProfitDescription', null);
          }
        "
      />
      <InputText
        class="col-span-3"
        name="nonProfitDescription"
        label="Name of Non-profit housing society"
        :disabled="!editable || values.financiallySupportedNonProfit !== BasicResponse.YES"
      />
      <div class="col-span-6" />
      <Select
        class="col-span-3"
        name="financiallySupportedHousingCoop"
        label="Housing co-operative"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e: SelectChangeEvent) => {
            if (e.value !== BasicResponse.YES) setFieldValue('housingCoopDescription', null);
          }
        "
      />
      <InputText
        class="col-span-3"
        name="housingCoopDescription"
        label="Name of Housing co-operative"
        :disabled="!editable || values.financiallySupportedHousingCoop !== BasicResponse.YES"
      />
      <div class="col-span-6" />

      <SectionHeader title="Location" />

      <InputText
        class="col-span-3"
        name="locationAddress"
        label="Location address"
        :disabled="true"
      />
      <InputText
        class="col-span-3"
        name="streetAddress"
        label="Street address"
        :disabled="!editable"
        @on-change="updateLocationAddress(values, setFieldValue)"
      />
      <InputText
        class="col-span-3"
        name="locality"
        label="Locality"
        :disabled="!editable"
        @on-change="updateLocationAddress(values, setFieldValue)"
      />
      <InputText
        class="col-span-3"
        name="province"
        label="Province"
        :disabled="!editable"
        @on-change="updateLocationAddress(values, setFieldValue)"
      />
      <InputText
        class="col-span-3"
        name="locationPids"
        label="Location PID(s)"
        :disabled="!editable"
      />
      <InputNumber
        class="col-span-3"
        name="latitude"
        label="Location latitude"
        help-text="Optionally provide a number between 48 and 60"
        :disabled="!editable"
      />
      <InputNumber
        class="col-span-3"
        name="longitude"
        label="Location longitude"
        help-text="Optionally provide a number between -114 and -139"
        :disabled="!editable"
      />
      <InputText
        class="col-span-3"
        name="geomarkUrl"
        label="Geomark URL"
        :disabled="!editable"
      />
      <Select
        class="col-span-3"
        name="naturalDisaster"
        label="Affected by natural disaster?"
        :disabled="!editable"
        :options="YES_NO_LIST"
      />
      <TextArea
        class="col-span-12"
        name="locationPidsAuto"
        label="Auto generated location PID(s)"
        :disabled="true"
      />
      <Button
        v-if="geoJson"
        id="download-geojson"
        class="col-start-1 col-span-2 mb-2"
        aria-label="Download GeoJSON"
        @click="onSaveGeoJson"
      >
        Download GeoJSON
      </Button>
      <TextArea
        class="col-span-12"
        name="projectLocationDescription"
        label="Additional information about location"
        :disabled="!editable"
      />
      <div class="col-span-6" />

      <SectionHeader title="ATS" />
      <div class="grid grid-cols-subgrid gap-4 col-span-12">
        <div
          v-if="values.atsClientId || atsCreateType !== undefined"
          class="col-start-1 col-span-12"
        >
          <div class="flex items-center">
            <h5 class="mr-3">{{ t('submissionForm.clientId') }}</h5>
            <a
              class="hover-hand"
              @click="atsUserDetailsModalVisible = true"
            >
              {{ values.atsClientId }}
            </a>
            <span v-if="atsCreateType === ATSCreateTypes.CLIENT_ENQUIRY">{{ t('submissionForm.pendingSave') }}</span>
          </div>
        </div>
        <input
          type="hidden"
          name="atsClientId"
        />
        <div
          v-if="values.atsEnquiryId || atsCreateType !== undefined"
          class="col-start-1 col-span-12"
        >
          <div class="flex items-center">
            <h5 class="mr-2">{{ t('submissionForm.enquiry#') }}</h5>
            {{ values.atsEnquiryId }}
            <span v-if="atsCreateType !== undefined">
              {{ t('submissionForm.pendingSave') }}
            </span>
          </div>
        </div>
        <input
          type="hidden"
          name="atsEnquiryId"
        />
        <Button
          v-if="!values.atsClientId && atsCreateType === undefined"
          class="col-start-1 col-span-2"
          aria-label="Link to ATS"
          :disabled="!editable"
          @click="atsUserLinkModalVisible = true"
        >
          {{ t('submissionForm.atsSearchBtn') }}
        </Button>
        <Button
          v-if="!values.atsClientId && atsCreateType === undefined"
          class="grid-col-start-3 col-span-2"
          aria-label="New ATS client"
          :disabled="!editable"
          @click="atsUserCreateModalVisible = true"
        >
          {{ t('submissionForm.atsNewClientBtn') }}
        </Button>
        <Button
          v-if="values.atsClientId && !values.atsEnquiryId && atsCreateType === undefined"
          class="grid-col-start-3 col-span-2"
          aria-label="New ATS enquiry"
          :disabled="!editable"
          @click="onNewATSEnquiry()"
        >
          {{ t('submissionForm.atsNewEnquiryBtn') }}
        </Button>
      </div>
      <Checkbox
        class="col-span-12 mt-2"
        name="addedToAts"
        label="Authorized Tracking System (ATS) updated"
        :disabled="!editable"
        :bold="true"
      />

      <SectionHeader
        title="Other"
        class="mt-2"
      />

      <Checkbox
        class="col-span-12"
        name="ltsaCompleted"
        label="Land Title Survey Authority (LTSA) completed"
        :disabled="!editable"
      />
      <Checkbox
        class="col-span-12"
        name="bcOnlineCompleted"
        label="BC Online completed"
        :disabled="!editable"
      />
      <Checkbox
        class="col-span-12"
        name="aaiUpdated"
        label="Authorization and Approvals Insight (AAI) updated"
        :disabled="!editable"
      />
      <TextArea
        class="col-span-12"
        name="astNotes"
        label="Automated Status Tool (AST) Notes"
        :disabled="!editable"
      />

      <SectionHeader title="Submission state" />

      <Select
        class="col-span-3"
        name="intakeStatus"
        label="Intake state"
        :disabled="!editable"
        :options="INTAKE_STATUS_LIST"
      />
      <EditableSelect
        class="col-span-3"
        name="user"
        label="Assigned to"
        :disabled="!editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Select
        class="col-span-3"
        name="applicationStatus"
        label="Project state"
        :disabled="!editable"
        :options="APPLICATION_STATUS_LIST"
      />
      <InputText
        class="col-span-3"
        name="waitingOn"
        label="Waiting on"
        :disabled="!editable"
      />

      <div class="field col-span-12 mt-8">
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
    </div>
    <ATSUserLinkModal
      v-model:visible="atsUserLinkModalVisible"
      :f-name="values.contactFirstName"
      :l-name="values.contactLastName"
      :phone-number="values.contactPhoneNumber"
      :email-id="values.contactEmail"
      @ats-user-link:link="
        (atsClientResource: ATSClientResource) => {
          atsUserLinkModalVisible = false;
          setFieldValue('atsClientId', atsClientResource.clientId);
          atsCreateType = ATSCreateTypes.ENQUIRY;
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
          setFieldValue('atsEnquiryId', null);
          setFieldValue('addedToAts', false);
          atsCreateType = undefined;
        }
      "
    />
    <ATSUserCreateModal
      v-model:visible="atsUserCreateModalVisible"
      :address="[values.streetAddress, values.locality, values.province].filter((str) => str?.trim()).join(', ')"
      :first-name="values.contactFirstName"
      :last-name="values.contactLastName"
      :phone="values.contactPhoneNumber"
      :email="values.contactEmail"
      @ats-user-create:create="
        () => {
          atsUserCreateModalVisible = false;
          atsCreateType = ATSCreateTypes.CLIENT_ENQUIRY;
        }
      "
    />
  </Form>
</template>
