<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createProjectFormSchema } from './ProjectFormSchema';
import {
  AddLocation,
  AdditionalInfo,
  AstNote,
  AutoPids,
  Company,
  FinanciallySupported,
  HousingUnits,
  Location
} from '@/components/common/icons';
import {
  CancelButton,
  Checkbox,
  EditableSelect,
  FormNavigationGuard,
  InputNumber,
  InputText,
  Select,
  TextArea
} from '@/components/form';
import ContactCardNavForm from '@/components/form/common/ContactCardNavForm.vue';
import ATSInfo from '@/components/ats/ATSInfo.vue';
import { Button, Message, Panel, useConfirm, useToast } from '@/lib/primevue';
import { atsService, externalApiService, housingProjectService, mapService, userService } from '@/services';
import { useProjectStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH, YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
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
import { formatDate, formatDateFilename } from '@/utils/formatters';
import { findIdpConfig, omit, scrollToFirstError, setEmptyStringsToNull, toTitleCase } from '@/utils/utils';

import type { SelectChangeEvent } from 'primevue/select';
import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type {
  ATSAddressResource,
  ATSClientResource,
  ATSEnquiryResource,
  Contact,
  GeocoderEntry,
  HousingProject,
  User
} from '@/types';

// Props
const { editable = true, project } = defineProps<{
  editable?: boolean;
  project: HousingProject;
}>();

// Emits
const emit = defineEmits<{
  (e: 'input-project-name', newName: string): void;
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
const addressGeocoderOptions: Ref<Array<any>> = ref([]);
const assigneeOptions: Ref<User[]> = ref([]);
const atsCreateType: Ref<ATSCreateTypes | undefined> = ref(undefined);
const geoJson = ref(null);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const locationPidsAuto: Ref<string> = ref('');
const showCancelMessage: Ref<boolean> = ref(false);

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
      notes: formRef.value?.values.project.projectName,
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

function emitProjectNameChange(e: Event) {
  emit('input-project-name', (e.target as HTMLInputElement).value);
}

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName}`;
};

function initializeFormValues(project: HousingProject) {
  const firstContact = project?.activity?.activityContact?.[0]?.contact;

  return {
    consentToFeedback: project.consentToFeedback ? BasicResponse.YES : BasicResponse.NO,
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
    finance: {
      financiallySupportedBc: project.financiallySupportedBc,
      financiallySupportedIndigenous: project.financiallySupportedIndigenous,
      indigenousDescription: project.indigenousDescription,
      financiallySupportedNonProfit: project.financiallySupportedNonProfit,
      nonProfitDescription: project.nonProfitDescription,
      financiallySupportedHousingCoop: project.financiallySupportedHousingCoop,
      housingCoopDescription: project.housingCoopDescription
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
    locationPidsAuto: locationPidsAuto.value,
    project: {
      companyNameRegistered: project.companyNameRegistered,
      isDevelopedInBc: project.isDevelopedInBc,
      projectName: project.projectName
    },

    // Additional Info
    projectDescription: project.projectDescription,

    // Location
    projectLocationDescription: project.projectLocationDescription,

    // Automated Status Tool Notes
    astNotes: project.astNotes,

    // Submission state
    submissionState: {
      queuePriority: project.queuePriority,
      submissionType: project.submissionType,
      assignedUser: assigneeOptions.value[0] ?? null,
      applicationStatus: project.applicationStatus
    },

    units: {
      singleFamilyUnits: project.singleFamilyUnits,
      multiFamilyUnits: project.multiFamilyUnits,
      otherUnitsDescription: project.otherUnitsDescription,
      otherUnits: project.otherUnits,
      hasRentalUnits: project.hasRentalUnits,
      rentalUnits: project.rentalUnits
    },

    // ATS link
    atsClientId: project.atsClientId,
    atsEnquiryId: project.atsEnquiryId,

    // Updates
    aaiUpdated: project.aaiUpdated,
    addedToAts: project.addedToAts,
    ltsaCompleted: project.ltsaCompleted,
    bcOnlineCompleted: project.bcOnlineCompleted,
    submittedAt: new Date(project.submittedAt),
    relatedEnquiries: project.relatedEnquiries
  };
}

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
    toast.warn(t('i.housing.project.projectForm.basicInfoMissing'));
  }
  scrollToFirstError(e.errors);
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

const getAddressSearchLabel = (e: GeocoderEntry) => {
  return e?.properties?.fullAddress;
};

async function onAddressSearchInput(e: IInputEvent) {
  const input = e.target.value;
  if (input.length == 0) {
    formRef.value?.setFieldValue('location.streetAddress', null);
    formRef.value?.setFieldValue('location.locality', null);
    formRef.value?.setFieldValue('location.province', null);
  } else {
    addressGeocoderOptions.value =
      ((await externalApiService.searchAddressCoder(input))?.data?.features as Array<GeocoderEntry>) ?? [];
  }
}

async function onAddressSelect(e: SelectChangeEvent) {
  if (e.originalEvent instanceof InputEvent) return;
  if (e.value as GeocoderEntry) {
    const properties = e.value?.properties;
    formRef.value?.setFieldValue(
      'location.streetAddress',
      `${properties?.civicNumber} ${properties?.streetName} ${properties?.streetType}`
    );
    formRef.value?.setFieldValue('location.locality', properties?.localityName);
    formRef.value?.setFieldValue('location.province', properties?.provinceCode);
  }
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
        ...values.project,
        ...values.units,
        ...values.location,
        ...values.finance,
        ...values.submissionState,
        activityId: project.activityId,
        housingProjectId: project.housingProjectId,
        projectDescription: values.projectDescription,
        projectLocationDescription: values.projectLocationDescription,
        astNotes: values.astNotes,
        atsClientId: parseInt(values.atsClientId) || '',
        atsEnquiryId: parseInt(values.atsEnquiryId) || '',
        aaiUpdated: values.aaiUpdated,
        addedToAts: values.addedToAts,
        ltsaCompleted: values.ltsaCompleted,
        bcOnlineCompleted: values.bcOnlineCompleted,
        submittedAt: values.submittedAt,
        consentToFeedback: values.consentToFeedback === BasicResponse.YES,
        naturalDisaster: values.location.naturalDisaster === BasicResponse.YES,
        assignedUserId: values.submissionState.assignedUser?.userId ?? undefined
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
        'submissionState',
        'locationAddress',
        'relatedEnquiries'
      ]
    );

    // Update project
    const result = await housingProjectService.updateProject(project.housingProjectId, dataOmitted);

    // Update store with returned data
    projectStore.setProject(result.data);

    // Reinitialize the form
    formRef.value?.resetForm({
      values: {
        ...initializeFormValues(result.data)
      }
    });

    toast.success(t('i.common.form.savedMessage'));
  } catch (e: any) {
    toast.error(t('i.common.projectForm.failedMessage'), e.message);
  }
};

const projectFormSchema = createProjectFormSchema();

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

function updateLocationAddress(values: any, setFieldValue?: Function) {
  const locationAddressStr = [values.location?.streetAddress, values.location?.locality, values.location?.province]
    .filter((str) => str?.trim())
    .join(', ');

  if (setFieldValue) setFieldValue('location.locationAddress', locationAddressStr);

  return locationAddressStr;
}

onBeforeMount(async () => {
  if (project.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [project.assignedUserId] })).data;
  }

  locationPidsAuto.value = (await mapService.getPIDs(project.housingProjectId)).data;
  if (project.geoJson) geoJson.value = project.geoJson;

  // Default form values
  initialFormValues.value = initializeFormValues(project);
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
          <h2 class="section-header my-0">{{ values.contact.firstName }} {{ values.contact.lastName }}</h2>
          <div class="flex flex-col">
            <span>{{ t('i.housing.project.projectForm.submissionDate') }}</span>
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
              <Company />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.companyProject') }}
              </h3>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-x-6 gap-y-6">
            <InputText
              name="project.companyNameRegistered"
              :label="t('i.housing.project.projectForm.companyLabel')"
              :disabled="!editable"
              @on-change="
                (e) => {
                  if (!e.target.value) {
                    setFieldValue('project.companyNameRegistered', null);
                    setFieldValue('project.isDevelopedInBc', null);
                  }
                }
              "
            />
            <Select
              name="project.isDevelopedInBc"
              :label="t('i.housing.project.projectForm.companyRegisteredInBC')"
              :disabled="!editable || !values.project.companyNameRegistered"
              :options="YES_NO_LIST"
            />
            <InputText
              name="project.projectName"
              :label="t('i.housing.project.projectForm.projectNameLabel')"
              :disabled="!editable"
              @on-input="emitProjectNameChange"
            />
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <HousingUnits />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.housingUnits') }}
              </h3>
            </div>
          </template>
          <div class="grid grid-cols-3 gap-x-6 gap-y-6">
            <Select
              name="units.singleFamilyUnits"
              :label="t('i.housing.project.projectForm.singleFamilyUnits')"
              :disabled="!editable"
              :options="NUM_RESIDENTIAL_UNITS_LIST"
            />
            <Select
              name="units.multiFamilyUnits"
              :label="t('i.housing.project.projectForm.multiFamilyUnits')"
              :disabled="!editable"
              :options="NUM_RESIDENTIAL_UNITS_LIST"
            />
            <Select
              name="units.hasRentalUnits"
              :label="t('i.housing.project.projectForm.rentalIncluded')"
              :disabled="!editable"
              :options="YES_NO_UNSURE_LIST"
              @on-change="
                (e: SelectChangeEvent) => {
                  if (e.value !== BasicResponse.YES) setFieldValue('units.rentalUnits', null);
                }
              "
            />
            <Select
              name="units.rentalUnits"
              :label="t('i.housing.project.projectForm.rentalUnits')"
              :disabled="!editable || values.units.hasRentalUnits !== BasicResponse.YES"
              :options="NUM_RESIDENTIAL_UNITS_LIST"
            />
            <InputText
              name="units.otherUnitsDescription"
              :label="t('i.housing.project.projectForm.otherType')"
              :disabled="!editable"
              @on-change="
                (e) => {
                  if (!e.target.value) {
                    setFieldValue('units.otherUnitsDescription', null);
                    setFieldValue('units.otherUnits', null);
                  }
                }
              "
            />
            <Select
              name="units.otherUnits"
              :label="t('i.housing.project.projectForm.otherTypeUnits')"
              :disabled="!editable || !values.units.otherUnitsDescription"
              :options="NUM_RESIDENTIAL_UNITS_LIST"
            />
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <FinanciallySupported />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.financiallySupported') }}
              </h3>
            </div>
          </template>
          <div class="col-span-1 grid grid-cols-2 gap-x-6 gap-y-6">
            <Select
              class="col-span-1"
              name="finance.financiallySupportedBc"
              :label="t('i.housing.project.projectForm.bcHousing')"
              :disabled="!editable"
              :options="YES_NO_UNSURE_LIST"
            />

            <div class="col-span-1 grid grid-row">
              <h6 class="font-bold mb-2">{{ t('i.housing.project.projectForm.indigenousHousingProvider') }}</h6>
              <div class="grid grid-cols-4 gap-x-3">
                <Select
                  class="col-span-1"
                  name="finance.financiallySupportedIndigenous"
                  :disabled="!editable"
                  :options="YES_NO_UNSURE_LIST"
                  @on-change="
                    (e: SelectChangeEvent) => {
                      if (e.value !== BasicResponse.YES) setFieldValue('finance.indigenousDescription', null);
                    }
                  "
                />
                <InputText
                  class="col-span-3"
                  name="finance.indigenousDescription"
                  :placeholder="t('i.housing.project.projectForm.nameOfOrganization')"
                  :disabled="!editable || values.finance.financiallySupportedIndigenous !== BasicResponse.YES"
                />
              </div>
            </div>
            <div class="col-span-1 grid grid-row">
              <h6 class="font-bold mb-2">{{ t('i.housing.project.projectForm.nonProfitHousingSociety') }}</h6>
              <div class="grid grid-cols-4 gap-x-3">
                <Select
                  class="col-span-1"
                  name="finance.financiallySupportedNonProfit"
                  :disabled="!editable"
                  :options="YES_NO_UNSURE_LIST"
                  @on-change="
                    (e: SelectChangeEvent) => {
                      if (e.value !== BasicResponse.YES) setFieldValue('finance.nonProfitDescription', null);
                    }
                  "
                />
                <InputText
                  class="col-span-3"
                  name="finance.nonProfitDescription"
                  :placeholder="t('i.housing.project.projectForm.nameOfOrganization')"
                  :disabled="!editable || values.finance.financiallySupportedNonProfit !== BasicResponse.YES"
                />
              </div>
            </div>

            <div class="col-span-1 grid grid-row">
              <h6 class="font-bold mb-2">{{ t('i.housing.project.projectForm.housingCoop') }}</h6>
              <div class="grid grid-cols-4 gap-x-3">
                <Select
                  class="col-span-1"
                  name="finance.financiallySupportedHousingCoop"
                  :disabled="!editable"
                  :options="YES_NO_UNSURE_LIST"
                  @on-change="
                    (e: SelectChangeEvent) => {
                      if (e.value !== BasicResponse.YES) setFieldValue('finance.housingCoopDescription', null);
                    }
                  "
                />
                <InputText
                  class="col-span-3"
                  name="finance.housingCoopDescription"
                  :placeholder="t('i.housing.project.projectForm.nameOfOrganization')"
                  :disabled="!editable || values.finance.financiallySupportedHousingCoop !== BasicResponse.YES"
                />
              </div>
            </div>
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <Location />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.location') }}
              </h3>
            </div>
          </template>
          <EditableSelect
            class="mb-6"
            name="addressSearch"
            :get-option-label="getAddressSearchLabel"
            :options="addressGeocoderOptions"
            :placeholder="t('i.housing.project.projectForm.addressSearchPlaceholder')"
            :bold="false"
            :disabled="!editable"
            @on-input="onAddressSearchInput"
            @on-change="onAddressSelect"
          />
          <div class="grid grid-row-3 gap-y-6">
            <div class="grid grid-cols-4 gap-x-6 gap-y-6">
              <InputText
                class="col-span-2"
                name="location.streetAddress"
                :label="t('i.housing.project.projectForm.streetAddress')"
                :disabled="true"
                @on-change="updateLocationAddress(values, setFieldValue)"
              />
              <InputText
                class="col-span-1"
                name="location.locality"
                :label="t('i.housing.project.projectForm.locality')"
                :disabled="true"
                @on-change="updateLocationAddress(values, setFieldValue)"
              />
              <InputText
                class="col-span-1"
                name="location.province"
                :label="t('i.housing.project.projectForm.province')"
                :disabled="true"
                @on-change="updateLocationAddress(values, setFieldValue)"
              />
            </div>
            <InputText
              class="col-span-3"
              name="location.locationPids"
              :label="t('i.housing.project.projectForm.locationPIDs')"
              :disabled="!editable"
            />
            <div class="grid grid-cols-3 gap-x-6">
              <InputNumber
                name="location.latitude"
                :label="t('i.housing.project.projectForm.locationLatitude')"
                :help-text="t('i.housing.project.projectForm.locationLatitudeHelp')"
                :disabled="!editable"
              />
              <InputNumber
                name="location.longitude"
                :label="t('i.housing.project.projectForm.locationLongitude')"
                :help-text="t('i.housing.project.projectForm.locationLongitudeHelp')"
                :disabled="!editable"
              />

              <Select
                name="location.naturalDisaster"
                :label="t('i.housing.project.projectForm.affectedByNaturalDisaster')"
                :disabled="!editable"
                :options="YES_NO_LIST"
              />
            </div>
            <InputText
              class="col-span-3"
              name="location.geomarkUrl"
              :label="t('i.housing.project.projectForm.geomarkUrl')"
              :disabled="!editable"
            />
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <AutoPids />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.autoGenPids') }}
              </h3>
            </div>
          </template>
          <div>
            <TextArea
              name="locationPidsAuto"
              :disabled="true"
            />
            <Button
              v-if="geoJson"
              id="download-geojson"
              class="col-start-1 col-span-2 mb-2"
              outlined
              :aria-label="t('i.housing.project.projectForm.downloadGeoJson')"
              @click="onSaveGeoJson"
            >
              {{ t('i.housing.project.projectForm.downloadGeoJson') }}
            </Button>
          </div>
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <AddLocation />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.locationAdditionalInfo') }}
              </h3>
            </div>
          </template>
          <InputText
            name="projectLocationDescription"
            :disabled="!editable"
          />
        </Panel>
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-x-2.5">
              <AdditionalInfo />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.additionalInfoHeader') }}
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
              <AstNote />
              <h3 class="section-header m-0">
                {{ t('i.housing.project.projectForm.astNotesHeader') }}
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
            {{ t('i.housing.project.projectForm.submissionStateHeader') }}
          </h4>
          <div class="flex flex-col gap-y-4">
            <EditableSelect
              name="submissionState.assignedUser"
              :label="t('i.housing.project.projectForm.assignedToLabel')"
              :disabled="!editable"
              :options="assigneeOptions"
              :get-option-label="getAssigneeOptionLabel"
              @on-input="onAssigneeInput"
            />
            <Select
              name="submissionState.applicationStatus"
              :label="t('i.housing.project.projectForm.projectStateLabel')"
              :disabled="!editable"
              :options="APPLICATION_STATUS_LIST"
            />

            <Select
              name="submissionState.submissionType"
              :label="t('i.housing.project.projectForm.submissionTypeLabel')"
              :disabled="!editable"
              :options="SUBMISSION_TYPE_LIST"
            />
            <Select
              name="submissionState.queuePriority"
              :label="t('i.housing.project.projectForm.priorityLabel')"
              :disabled="!editable"
              :options="QUEUE_PRIORITY"
            />
          </div>
        </div>
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('i.housing.project.projectForm.relatedEnquiries') }}
          </h4>
          <InputText
            name="relatedEnquiries"
            :label="t('i.housing.project.projectForm.relatedEnquiriesLabel')"
            :disabled="true"
          />
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
            {{ t('i.housing.project.projectForm.updatesHeader') }}
          </h4>
          <Checkbox
            name="addedToAts"
            class="mb-4"
            :label="t('i.housing.project.projectForm.atsUpdated')"
            :disabled="!editable"
          />
          <Checkbox
            class="col-span-12 mb-4"
            name="ltsaCompleted"
            :label="t('i.housing.project.projectForm.ltsaCompleted')"
            :disabled="!editable"
          />
          <Checkbox
            class="col-span-12 mb-4"
            name="bcOnlineCompleted"
            :label="t('i.housing.project.projectForm.bcOnlineCompleted')"
            :disabled="!editable"
          />
          <Checkbox
            name="aaiUpdated"
            :label="t('i.housing.project.projectForm.aaiUpdateLabel')"
            :disabled="!editable"
          />
        </div>
        <div class="bg-[var(--p-bcblue-50)] rounded px-9 py-6">
          <h4 class="section-header mb-4 mt-0">
            {{ t('i.housing.project.projectForm.feedbackConsent') }}
          </h4>
          <Select
            class="col-span-3"
            name="consentToFeedback"
            :label="t('i.housing.project.projectForm.researchOptin')"
            :disabled="!editable"
            :options="YES_NO_LIST"
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
        :label="t('i.housing.project.projectForm.reopenSubmission')"
        icon="pi pi-check"
        @click="onReOpen()"
      />
    </div>
  </Form>
</template>
