<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, FieldArray, ErrorMessage } from 'vee-validate';
import { onBeforeMount, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import BackButton from '@/components/common/BackButton.vue';
import Map from '@/components/housing/maps/Map.vue';
import { EditableDropdown } from '@/components/form';
import {
  AutoComplete,
  Calendar,
  Checkbox,
  Dropdown,
  InputMask,
  InputNumber,
  RadioList,
  InputText,
  StepperHeader,
  StepperNavigation,
  TextArea
} from '@/components/form';
import CollectionDisclaimer from '@/components/housing/CollectionDisclaimer.vue';
import IntakeAssistanceConfirmation from './IntakeAssistanceConfirmation.vue';
import SubmissionAssistance from '@/components/housing/submission/SubmissionAssistance.vue';
import SubmissionIntakeConfirmation from '@/components/housing/submission/SubmissionIntakeConfirmation.vue';
import { submissionIntakeSchema } from '@/components/housing/submission/SubmissionIntakeSchema';
import {
  Accordion,
  AccordionTab,
  Button,
  Card,
  Divider,
  Message,
  Stepper,
  StepperPanel,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { useAutoSave } from '@/composables/formAutoSave';
import { documentService, enquiryService, externalApiService, permitService, submissionService } from '@/services';
import { useConfigStore, useSubmissionStore, useTypeStore } from '@/store';
import { SPATIAL_FILE_FORMATS, YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import {
  CONTACT_PREFERENCE_LIST,
  NUM_RESIDENTIAL_UNITS_LIST,
  PROJECT_LOCATION_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/constants/housing';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import {
  IntakeFormCategory,
  IntakeStatus,
  PermitNeeded,
  PermitStatus,
  ProjectLocation,
  SubmissionType
} from '@/utils/enums/housing';
import { confirmationTemplate } from '@/utils/templates';
import { omit } from '@/utils/utils';

import type { Ref } from 'vue';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import type { IInputEvent } from '@/interfaces';
import type { Document, Permit, Submission } from '@/types';

// Interfaces
interface SubmissionForm extends Submission {
  addressSearch?: string;
  appliedPermits?: Array<Permit>;
  investigatePermits?: Array<Permit>;
}
// Types
type GeocoderEntry = {
  geometry: { coordinates: Array<number>; [key: string]: any };
  properties: { [key: string]: string };
};

// Props
type Props = {
  activityId?: string;
  submissionId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  submissionId: undefined
});
const router = useRouter();
// Constants
const VALIDATION_BANNER_TEXT =
  'One or more of the required fields are missing or contains invalid data. Please check the highlighted fields.';

// Store
const submissionStore = useSubmissionStore();
const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);
const { getConfig } = storeToRefs(useConfigStore());

// State
const activeStep: Ref<number> = ref(0);
const addressGeocoderOptions: Ref<Array<any>> = ref([]);
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const assistanceAssignedActivityId: Ref<string | undefined> = ref(undefined);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const geomarkAccordionIndex: Ref<number | undefined> = ref(undefined);
const mapLatitude: Ref<number | undefined> = ref(undefined);
const mapLongitude: Ref<number | undefined> = ref(undefined);
const mapRef: Ref<InstanceType<typeof Map> | null> = ref(null);
const isSubmittable: Ref<boolean> = ref(false);
const orgBookOptions: Ref<Array<any>> = ref([]);
const parcelAccordionIndex: Ref<number | undefined> = ref(undefined);
const spacialAccordionIndex: Ref<number | undefined> = ref(undefined);
const validationErrors: Ref<string[]> = ref([]);
const formModified: Ref<boolean> = ref(false);

const { formUpdated, stopAutoSave } = useAutoSave(() => {
  const values = formRef.value?.values;
  if (values) onSaveDraft(values, true);
});

// Actions
const confirm = useConfirm();
const toast = useToast();

const checkSubmittable = (stepNumber: number) => {
  // Map component misaligned if mounted while not visible. Trigger resize to fix on show
  if (stepNumber === 2) nextTick().then(() => mapRef?.value?.resizeMap());
  if (stepNumber === 3) isSubmittable.value = true;
};

function confirmSubmit(data: any) {
  const submitData: Submission = omit(data as SubmissionForm, ['addressSearch']);

  confirm.require({
    message: 'Are you sure you wish to submit this form? Please review the form before submitting.',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onSubmit(submitData)
  });
}

const getAddressSearchLabel = (e: GeocoderEntry) => {
  return e?.properties?.fullAddress;
};

function handleProjectLocationClick() {
  let location = formRef?.value?.values?.location;
  if (location?.latitude || location?.longitude) {
    formRef?.value?.setFieldValue('location.latitude', null);
    formRef?.value?.setFieldValue('location.longitude', null);
    formRef.value?.setFieldValue('location.streetAddress', null);
    formRef.value?.setFieldValue('location.locality', null);
    formRef.value?.setFieldValue('location.province', null);
  }
}

const onAddressSearchInput = async (e: IInputEvent) => {
  const input = e.target.value;
  addressGeocoderOptions.value =
    ((await externalApiService.searchAddressCoder(input))?.data?.features as Array<GeocoderEntry>) ?? [];
};

const onAddressSelect = async (e: DropdownChangeEvent) => {
  if (e.originalEvent instanceof InputEvent) return;

  if (e.value as GeocoderEntry) {
    const properties = e.value?.properties;
    const geometry = e.value?.geometry;

    mapLatitude.value = geometry.coordinates[1];
    mapLongitude.value = geometry.coordinates[0];

    formRef.value?.setFieldValue(
      'location.streetAddress',
      `${properties?.civicNumber} ${properties?.streetName} ${properties?.streetType}`
    );
    formRef.value?.setFieldValue('location.locality', properties?.localityName);
    formRef.value?.setFieldValue('location.latitude', geometry?.coordinates[1]);
    formRef.value?.setFieldValue('location.longitude', geometry?.coordinates[0]);
    formRef.value?.setFieldValue('location.province', properties?.provinceCode);
  }
};

async function handleEnquirySubmit(values: any, relatedActivityId: string) {
  try {
    const formattedData = Object.assign(
      {
        basic: {
          applyForPermitConnect: BasicResponse.NO,
          enquiryDescription: 'Assistance requested',
          isRelated: BasicResponse.YES,
          relatedActivityId: relatedActivityId,
          enquiryType: SubmissionType.ASSISTANCE
        },
        submit: true
      },
      { applicant: values?.[IntakeFormCategory.APPLICANT] }
    );

    const enquiryResponse = await enquiryService.createDraft(formattedData);

    if (enquiryResponse.data.activityId) {
      toast.success('Form saved');
      assistanceAssignedActivityId.value = enquiryResponse.data.activityId;
    } else {
      toast.error('Failed to submit enquiry');
    }
  } catch (e: any) {
    toast.error('Failed to save enquiry', e);
  } finally {
    editable.value = true;
  }
}

const onLatLongInputClick = async () => {
  const validLat = (await formRef?.value?.validateField('location.latitude'))?.valid;
  const validLong = (await formRef?.value?.validateField('location.longitude'))?.valid;

  if (validLat && validLong) {
    const location = formRef?.value?.values?.location;
    mapLatitude.value = location.latitude;
    mapLongitude.value = location.longitude;
  }
};

function onInvalidSubmit(e: any) {
  validationErrors.value = Array.from(new Set(e.errors ? Object.keys(e.errors).map((x) => x.split('.')[0]) : []));
  document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
  formModified.value = false;
}

function onPermitsHasAppliedChange(e: BasicResponse, fieldsLength: number, push: Function, setFieldValue: Function) {
  if (e === BasicResponse.YES || e === BasicResponse.UNSURE) {
    if (fieldsLength === 0) {
      push({
        permitTypeId: undefined,
        trackingId: undefined,
        status: undefined
      });
    }
  } else {
    setFieldValue('appliedPermits', undefined);
  }
}

async function onSaveDraft(
  data: any,
  isAutoSave: boolean = false,
  showToast: boolean = true,
  assistanceRequired: boolean = false
) {
  editable.value = false;
  // Cleanup unneeded data to be saved to draft
  const draftData = omit(data as SubmissionForm, ['addressSearch']);

  // Remove empty permits
  if (Array.isArray(draftData.appliedPermits)) {
    draftData.appliedPermits = draftData.appliedPermits.filter((x: Partial<Permit>) => x?.permitTypeId);
  }
  if (Array.isArray(draftData.investigatePermits)) {
    draftData.investigatePermits = draftData.investigatePermits.filter((x: Partial<Permit>) => x?.permitTypeId);
  }

  let response;
  try {
    if (data.submissionId) {
      response = await submissionService.updateDraft(draftData.submissionId, draftData);
    } else {
      response = await submissionService.createDraft(draftData);
    }

    if (response.data.submissionId && response.data.activityId) {
      formRef.value?.setFieldValue('submissionId', response.data.submissionId);
      formRef.value?.setFieldValue('activityId', response.data.activityId);
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }
    if (isAutoSave) {
      if (showToast) toast.success('Draft autosaved');
    } else {
      if (showToast) toast.success('Draft saved');
      formUpdated.value = false;
    }
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  } finally {
    editable.value = true;
  }

  if (assistanceRequired && response?.data?.activityId) {
    formUpdated.value = false;
    handleEnquirySubmit(draftData, response.data.activityId);
  }
}

async function onSubmit(data: any) {
  editable.value = false;

  try {
    let response;
    if (data.submissionId) {
      response = await submissionService.updateDraft(data.submissionId, { ...data, submit: true });
    } else {
      response = await submissionService.createDraft({ ...data, submit: true });
    }
    if (response.data.activityId) {
      assignedActivityId.value = response.data.activityId;
      formRef.value?.setFieldValue('activityId', response.data.activityId);
      // Send confirmation email
      emailConfirmation(response.data.activityId);
      stopAutoSave();
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;
  }
}

async function emailConfirmation(activityId: string) {
  const configCC = getConfig.value.ches?.submission?.cc;
  const body = confirmationTemplate({
    '{{ contactName }}': formRef.value?.values.applicant.contactFirstName,
    '{{ activityId }}': activityId
  });
  let applicantEmail = formRef.value?.values.applicant.contactEmail;
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: 'Confirmation of Submission', // eslint-disable-line quotes
    bodyType: 'text',
    body: body
  };
  await submissionService.emailConfirmation(emailData);
}

async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook(e.query))?.data?.results ?? [];
    orgBookOptions.value = results
      .filter((x: { [key: string]: string }) => x.type === 'name')
      .map((x: { [key: string]: string }) => x?.value);
  }
}

async function loadSubmission(submissionId: string, activityId: string) {
  let response,
    permits: Array<Permit> = [],
    documents: Array<Document> = [];
  try {
    response = (await submissionService.getSubmission(submissionId)).data;
    permits = (await permitService.listPermits(activityId)).data;
    documents = (await documentService.listDocuments(activityId)).data;
    submissionStore.setDocuments(documents);
    editable.value = response.intakeStatus === IntakeStatus.DRAFT;

    formRef.value?.setValues({
      activityId: response?.activityId,
      submissionId: response?.submissionId,
      applicant: {
        contactFirstName: response?.contactFirstName,
        contactLastName: response?.contactLastName,
        contactPhoneNumber: response?.contactPhoneNumber,
        contactEmail: response?.contactEmail,
        contactApplicantRelationship: response?.contactApplicantRelationship,
        contactPreference: response?.contactPreference
      },
      basic: {
        isDevelopedByCompanyOrOrg: response?.isDevelopedByCompanyOrOrg,
        isDevelopedInBC: response?.isDevelopedInBC,
        registeredName: response?.companyNameRegistered
      },
      housing: {
        projectName: response?.projectName,
        projectDescription: response?.projectDescription,
        singleFamilySelected: !!response?.singleFamilyUnits,
        multiFamilySelected: !!response?.multiFamilyUnits,
        singleFamilyUnits: response?.singleFamilyUnits,
        multiFamilyUnits: response?.multiFamilyUnits,
        otherSelected: !!response?.otherUnits,
        otherUnitsDescription: response?.otherUnitsDescription,
        otherUnits: response?.otherUnits,
        hasRentalUnits: response?.hasRentalUnits,
        rentalUnits: response?.rentalUnits,
        financiallySupportedBC: response?.financiallySupportedBC,
        financiallySupportedIndigenous: response?.financiallySupportedIndigenous,
        indigenousDescription: response?.indigenousDescription,
        financiallySupportedNonProfit: response?.financiallySupportedNonProfit,
        nonProfitDescription: response?.nonProfitDescription,
        financiallySupportedHousingCoop: response?.financiallySupportedHousingCoop,
        housingCoopDescription: response?.housingCoopDescription
      },
      location: {
        naturalDisaster: response?.naturalDisaster,
        projectLocation: response?.projectLocation,
        streetAddress: response?.streetAddress,
        locality: response?.locality,
        province: response?.province,
        latitude: response?.latitude,
        longitude: response?.longitude,
        ltsaPIDLookup: response?.locationPIDs,
        geomarkUrl: response?.geomarkUrl,
        projectLocationDescription: response?.projectLocationDescription
      },
      appliedPermits: permits
        .filter((x: Permit) => x.status === PermitStatus.APPLIED)
        .map((x: Permit) => ({
          ...x,
          statusLastVerified: x.statusLastVerified ? new Date(x.statusLastVerified) : undefined
        })),
      permits: {
        hasAppliedProvincialPermits: response?.hasAppliedProvincialPermits,
        checkProvincialPermits: response?.checkProvincialPermits
      },
      investigatePermits: permits.filter((x: Permit) => x.needed === PermitNeeded.UNDER_INVESTIGATION)
    });
    // Move map pin
    onLatLongInputClick();
  } catch {
    router.push({ name: RouteName.HOUSING_SUBMISSION_INTAKE });
  }
}

onBeforeMount(async () => {
  if (props.submissionId && props.activityId) loadSubmission(props.submissionId, props.activityId);
  // clearing the document store on page load
  submissionStore.setDocuments([]);
});
</script>

<template>
  <div v-if="!assignedActivityId && !assistanceAssignedActivityId">
    <BackButton
      :confirm-leave="editable && !!formUpdated"
      confirm-message="Are you sure you want to leave this page?
      Any unsaved changes will be lost. Please save as draft first."
      :route-name="RouteName.HOUSING"
      text="Back to Housing"
    />

    <Form
      id="form"
      v-slot="{ setFieldValue, errors, values }"
      ref="formRef"
      :validation-schema="submissionIntakeSchema"
      @invalid-submit="(e) => onInvalidSubmit(e)"
      @submit="confirmSubmit"
      @change="
        () => {
          formUpdated = true;
          formModified = true;
        }
      "
    >
      <SubmissionAssistance
        v-if="!(props.activityId || props.submissionId) && values?.applicant"
        :form-errors="errors"
        @on-submit-assistance="onSaveDraft(values, true, false, true)"
      />

      <input
        type="hidden"
        name="submissionId"
      />

      <input
        type="hidden"
        name="activityId"
      />

      <Stepper
        v-model:activeStep="activeStep"
        @update:active-step="checkSubmittable"
      >
        <!--
      Contact Information
      -->
        <StepperPanel>
          <template #header="{ index, clickCallback }">
            <StepperHeader
              :index="index"
              :active-step="activeStep"
              :click-callback="clickCallback"
              title="Contact Information"
              icon="fa-user"
              :class="{
                'app-error-color':
                  (validationErrors.includes(IntakeFormCategory.APPLICANT) ||
                    validationErrors.includes(IntakeFormCategory.BASIC)) &&
                  !formModified
              }"
            />
          </template>
          <template #content="{ nextCallback }">
            <CollectionDisclaimer />

            <Message
              v-if="validationErrors.length && !formModified"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="text-center mt-0"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <Card>
              <template #title>
                <span class="section-header">Who is the primary contact regarding this project?</span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <InputText
                    class="col-6"
                    name="applicant.contactFirstName"
                    label="First name"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <InputText
                    class="col-6"
                    name="applicant.contactLastName"
                    label="Last name"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <InputMask
                    class="col-6"
                    name="applicant.contactPhoneNumber"
                    mask="(999) 999-9999"
                    label="Phone number"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <InputText
                    class="col-6"
                    name="applicant.contactEmail"
                    label="Email"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <Dropdown
                    class="col-6"
                    name="applicant.contactApplicantRelationship"
                    label="Relationship to project"
                    :bold="false"
                    :disabled="!editable"
                    :options="PROJECT_RELATIONSHIP_LIST"
                  />
                  <Dropdown
                    class="col-6"
                    name="applicant.contactPreference"
                    label="Preferred contact method"
                    :bold="false"
                    :disabled="!editable"
                    :options="CONTACT_PREFERENCE_LIST"
                  />
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <span class="section-header">
                  Is this project being developed by a business, company, or organization?
                </span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <RadioList
                    class="col-12"
                    name="basic.isDevelopedByCompanyOrOrg"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_LIST"
                    @on-change="
                      (e: string) => {
                        if (e === BasicResponse.NO) setFieldValue('basic.isDevelopedInBC', null);
                      }
                    "
                  />

                  <span
                    v-if="values.basic?.isDevelopedByCompanyOrOrg === BasicResponse.YES"
                    class="col-12"
                  >
                    <div class="flex align-items-center">
                      <p class="font-bold">Is it registered in B.C?</p>
                      <div
                        v-tooltip.right="'Are you registered with OrgBook BC?'"
                        class="pl-2"
                      >
                        <font-awesome-icon icon="fa-solid fa-circle-question" />
                      </div>
                    </div>
                    <RadioList
                      class="col-12 pl-0"
                      name="basic.isDevelopedInBC"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_LIST"
                      @on-change="() => setFieldValue('basic.registeredName', null)"
                    />
                    <AutoComplete
                      v-if="values.basic.isDevelopedInBC === BasicResponse.YES"
                      class="col-6 pl-0"
                      name="basic.registeredName"
                      :bold="false"
                      :disabled="!editable"
                      :editable="true"
                      :force-selection="true"
                      :placeholder="'Type to search the B.C registered name'"
                      :suggestions="orgBookOptions"
                      @on-complete="onRegisteredNameInput"
                    />
                    <InputText
                      v-else-if="values.basic.isDevelopedInBC === BasicResponse.NO"
                      class="col-6 pl-0"
                      name="basic.registeredName"
                      :placeholder="'Type the business/company/organization name'"
                      :bold="false"
                      :disabled="!editable"
                    />
                  </span>
                </div>
              </template>
            </Card>

            <StepperNavigation
              :editable="editable"
              :next-callback="nextCallback"
              :prev-disabled="true"
              @click="
                () => {
                  if (!values.activityId) onSaveDraft(values, true, false);
                }
              "
            >
              <template #content>
                <Button
                  class="p-button-sm"
                  outlined
                  label="Save draft"
                  :disabled="!editable"
                  @click="onSaveDraft(values)"
                />
              </template>
            </StepperNavigation>
          </template>
        </StepperPanel>

        <!--
      Housing
      -->
        <StepperPanel>
          <template #header="{ index, clickCallback }">
            <StepperHeader
              :index="index"
              :active-step="activeStep"
              :click-callback="clickCallback"
              title="Housing"
              icon="fa-house"
              :class="{
                'app-error-color': validationErrors.includes(IntakeFormCategory.HOUSING) && !formModified
              }"
              @click="
                () => {
                  if (!values.activityId) onSaveDraft(values, true, false);
                }
              "
            />
          </template>
          <template #content="{ prevCallback, nextCallback }">
            <Message
              v-if="validationErrors.length && !formModified"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="text-center mt-0"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <Card>
              <template #title>
                <span class="section-header">Help us learn more about your housing project</span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <InputText
                    class="col-6"
                    name="housing.projectName"
                    label="Project name - well known title like Capital Park"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <div class="col-6" />
                  <div class="col-12">
                    <div class="flex align-items-center">
                      <label>Provide additional information</label>
                      <div
                        v-tooltip.right="
                          `Provide us with additional information -
                         short description about the project, project website link, or upload a document.`
                        "
                        class="pl-2 mb-2"
                      >
                        <font-awesome-icon icon="fa-solid fa-circle-question" />
                      </div>
                    </div>
                  </div>
                  <!-- eslint-disable max-len -->
                  <TextArea
                    class="col-12"
                    name="housing.projectDescription"
                    placeholder="Provide us with additional information - short description about the project and/or project website link"
                    :disabled="!editable"
                  />
                  <!-- eslint-enable max-len -->
                  <label class="col-12">Upload documents about your housing project (optional)</label>
                  <AdvancedFileUpload
                    :activity-id="values.activityId"
                    :disabled="!editable"
                    :reject="SPATIAL_FILE_FORMATS"
                  />
                </div>
              </template>
            </Card>

            <Card>
              <template #title>
                <span class="section-header">Select the types of residential units being developed</span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <Checkbox
                    class="col-6"
                    name="housing.singleFamilySelected"
                    label="Single-family"
                    :bold="false"
                    :disabled="!editable"
                    :invalid="!!formRef?.errors?.housing && formRef?.meta?.touched"
                  />
                  <div class="col-6">
                    <div class="flex">
                      <Checkbox
                        name="housing.multiFamilySelected"
                        label="Multi-family"
                        :bold="false"
                        :disabled="!editable"
                        :invalid="!!formRef?.errors?.housing && formRef?.meta?.touched"
                      />
                      <div
                        v-tooltip.right="
                          `Multi-family dwelling: a residential building that contains two or more attached dwellings,
                    including duplex, triplex, fourplex, townhouse, row houses, and apartment forms.`
                        "
                        class="pl-2"
                      >
                        <font-awesome-icon icon="fa-solid fa-circle-question" />
                      </div>
                    </div>
                  </div>
                  <Dropdown
                    class="col-6"
                    name="housing.singleFamilyUnits"
                    :disabled="!editable || !values.housing.singleFamilySelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <Dropdown
                    class="col-6"
                    name="housing.multiFamilyUnits"
                    :disabled="!editable || !values.housing.multiFamilySelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <Checkbox
                    class="col-6"
                    name="housing.otherSelected"
                    label="Other"
                    :bold="false"
                    :disabled="!editable"
                    :invalid="!!formRef?.errors?.housing && formRef?.meta?.touched"
                  />
                  <div class="col-6" />
                  <InputText
                    class="col-6"
                    name="housing.otherUnitsDescription"
                    :disabled="!editable || !values.housing.otherSelected"
                    placeholder="Type to describe what other type of housing"
                  />
                  <Dropdown
                    class="col-6"
                    name="housing.otherUnits"
                    :disabled="!editable || !values.housing.otherSelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <div class="col-12">
                    <ErrorMessage
                      v-show="formRef?.meta?.touched"
                      name="housing"
                    />
                  </div>
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex">
                  <span class="section-header">Will this project include rental units?</span>
                  <div
                    v-tooltip.right="
                      `Rental refers to a purpose built residentual unit, property,
                  or dwelling that is available for long term rent by tenants.`
                    "
                  >
                    <font-awesome-icon icon="fa-solid fa-circle-question" />
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <RadioList
                    class="col-12"
                    name="housing.hasRentalUnits"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                  />
                  <Dropdown
                    v-if="values.housing.hasRentalUnits === BasicResponse.YES"
                    class="col-6"
                    name="housing.rentalUnits"
                    :disabled="!editable"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex align-items-center">
                  <div class="flex flex-grow-1">
                    <span class="section-header">
                      Is this project being financially supported by any of the following?
                    </span>
                  </div>
                  <Button
                    class="p-button-sm mr-3 p-button-danger"
                    outlined
                    :disabled="!editable"
                    @click="
                      () => {
                        setFieldValue('housing.financiallySupportedBC', BasicResponse.NO);
                        setFieldValue('housing.financiallySupportedIndigenous', BasicResponse.NO);
                        setFieldValue('housing.financiallySupportedNonProfit', BasicResponse.NO);
                        setFieldValue('housing.financiallySupportedHousingCoop', BasicResponse.NO);
                      }
                    "
                  >
                    No to all
                  </Button>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <div class="col mb-2">
                    <div class="flex align-items-center">
                      <label>
                        <a
                          href="https://www.bchousing.org/projects-partners/partner-with-us"
                          target="_blank"
                        >
                          BC Housing
                        </a>
                      </label>
                      <!-- eslint-disable max-len -->
                      <div
                        v-tooltip.right="
                          `BC Housing welcomes the opportunity to work with individuals and organizations to create affordable housing solutions.`
                        "
                        class="mb-2"
                      >
                        <font-awesome-icon
                          class="pl-2"
                          icon="fa-solid fa-circle-question"
                        />
                      </div>
                      <!-- eslint-enable max-len -->
                    </div>
                  </div>
                  <RadioList
                    class="col-12"
                    name="housing.financiallySupportedBC"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                  />
                  <div class="col mb-2">
                    <label>
                      <a
                        href="https://www.bchousing.org/housing-assistance/rental-housing/indigenous-housing-providers"
                        target="_blank"
                      >
                        Indigenous Housing Provider
                      </a>
                    </label>
                  </div>
                  <RadioList
                    class="col-12"
                    name="housing.financiallySupportedIndigenous"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                  />
                  <div class="col-12">
                    <InputText
                      v-if="values.housing?.financiallySupportedIndigenous === BasicResponse.YES"
                      class="col-6 pl-0"
                      name="housing.indigenousDescription"
                      :disabled="!editable"
                      placeholder="Name of Indigenous Housing Provider"
                    />
                  </div>
                  <div class="col mb-2">
                    <label>
                      <a
                        href="https://bcnpha.ca/member-programs-list/"
                        target="_blank"
                      >
                        Non-profit housing society
                      </a>
                    </label>
                  </div>
                  <RadioList
                    class="col-12"
                    name="housing.financiallySupportedNonProfit"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                  />
                  <div class="col-12">
                    <InputText
                      v-if="values.housing?.financiallySupportedNonProfit === BasicResponse.YES"
                      class="col-6 pl-0"
                      name="housing.nonProfitDescription"
                      :disabled="!editable"
                      placeholder="Name of Non-profit housing society"
                    />
                  </div>
                  <div class="col mb-2">
                    <label>
                      <a
                        href="https://www.chf.bc.ca/find-co-op/"
                        target="_blank"
                      >
                        Housing co-operative
                      </a>
                    </label>
                  </div>
                  <RadioList
                    class="col-12"
                    name="housing.financiallySupportedHousingCoop"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_UNSURE_LIST"
                  />
                  <div class="col-12">
                    <InputText
                      v-if="values.housing?.financiallySupportedHousingCoop === BasicResponse.YES"
                      class="col-6 pl-0"
                      name="housing.housingCoopDescription"
                      :disabled="!editable"
                      placeholder="Name of Housing co-operative"
                    />
                  </div>
                </div>
              </template>
            </Card>

            <StepperNavigation
              :editable="editable"
              :next-callback="nextCallback"
              :prev-callback="prevCallback"
            >
              <template #content>
                <Button
                  class="p-button-sm"
                  outlined
                  label="Save draft"
                  :disabled="!editable"
                  @click="onSaveDraft(values)"
                />
              </template>
            </StepperNavigation>
          </template>
        </StepperPanel>

        <!--
      Location
      -->
        <StepperPanel>
          <template #header="{ index, clickCallback }">
            <StepperHeader
              :index="index"
              :active-step="activeStep"
              :click-callback="clickCallback"
              title="Location"
              icon="fa-location-dot"
              :class="{
                'app-error-color': validationErrors.includes(IntakeFormCategory.LOCATION) && !formModified
              }"
              @click="
                () => {
                  if (!values.activityId) onSaveDraft(values, true, false);
                }
              "
            />
          </template>
          <template #content="{ prevCallback, nextCallback }">
            <Message
              v-if="validationErrors.length && !formModified"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="text-center mt-0"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <Card>
              <template #title>
                <div class="flex">
                  <span class="section-header">
                    Has the location of this project been affected by natural disaster?
                  </span>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <RadioList
                    class="col-12"
                    name="location.naturalDisaster"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_LIST"
                  />
                </div>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex align-items-center">
                  <div class="flex flex-grow-1">
                    <span class="section-header">Provide one of the following project locations</span>
                    <div
                      v-tooltip.right="`A civic address contains a street name and number where a non-civid does not.`"
                    >
                      <font-awesome-icon icon="fa-solid fa-circle-question" />
                    </div>
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <RadioList
                    class="col-12"
                    name="location.projectLocation"
                    :bold="false"
                    :disabled="!editable"
                    :options="PROJECT_LOCATION_LIST"
                    @on-click="handleProjectLocationClick"
                  />
                  <div
                    v-if="values.location?.projectLocation === ProjectLocation.STREET_ADDRESS"
                    class="col-12"
                  >
                    <Card class="no-shadow">
                      <template #content>
                        <div class="grid nested-grid">
                          <EditableDropdown
                            class="col-12"
                            name="addressSearch"
                            :get-option-label="getAddressSearchLabel"
                            :options="addressGeocoderOptions"
                            :placeholder="'Search the address of your housing project'"
                            :bold="false"
                            :disabled="!editable"
                            @on-input="onAddressSearchInput"
                            @on-change="onAddressSelect"
                          />
                          <InputText
                            class="col-4"
                            name="location.streetAddress"
                            disabled
                            placeholder="Street address"
                          />
                          <InputText
                            class="col-4"
                            name="location.locality"
                            disabled
                            placeholder="Locality"
                          />
                          <InputText
                            class="col-4"
                            name="location.province"
                            disabled
                            placeholder="Province"
                          />
                          <InputNumber
                            class="col-4"
                            name="location.latitude"
                            disabled
                            help-text="Provide a coordinate between 48 and 60"
                            placeholder="Latitude"
                          />
                          <InputNumber
                            class="col-4"
                            name="location.longitude"
                            disabled
                            help-text="Provide a coordinate between -114 and -139"
                            placeholder="Longitude"
                          />
                          <div class="col-12 text-blue-500">
                            The accepted coordinates are to be decimal degrees (dd.dddd) and to the extent of the
                            province.
                          </div>
                        </div>
                      </template>
                    </Card>
                  </div>
                  <div
                    v-if="values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES"
                    class="col-12"
                  >
                    <Card class="no-shadow">
                      <template #content>
                        <div class="grid nested-grid">
                          <InputNumber
                            class="col-4"
                            name="location.latitude"
                            :disabled="!editable"
                            help-text="Provide a coordinate between 48 and 60"
                            placeholder="Latitude"
                            @keyup.enter="onLatLongInputClick"
                          />
                          <InputNumber
                            class="col-4"
                            name="location.longitude"
                            :disabled="!editable"
                            help-text="Provide a coordinate between -114 and -139"
                            placeholder="Longitude"
                            @keyup.enter="onLatLongInputClick"
                          />
                          <Button
                            class="lat-long-btn"
                            label="Show on map"
                            :disabled="!editable"
                            @click="onLatLongInputClick"
                          />
                        </div>
                        <div class="grid nested-grid">
                          <div class="col-12 text-blue-500">
                            The accepted coordinates are to be decimal degrees (dd.dddd) and to the extent of the
                            province.
                          </div>
                        </div>
                      </template>
                    </Card>
                  </div>
                </div>
                <Map
                  ref="mapRef"
                  :disabled="!editable"
                  :latitude="mapLatitude"
                  :longitude="mapLongitude"
                />
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex align-items-center">
                  <div class="flex flex-grow-1">
                    <span class="section-header">Provide additional location details (optional)</span>
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <Accordion
                  v-model:active-index="parcelAccordionIndex"
                  class="mb-3"
                >
                  <AccordionTab header="Parcel ID">
                    <Card class="no-shadow">
                      <template #content>
                        <div class="formgrid grid">
                          <div class="col-12">
                            <label>
                              <a
                                href="https://ltsa.ca/property-owners/about-land-records/property-information-resources/"
                                target="_blank"
                              >
                                LTSA PID Lookup
                              </a>
                            </label>
                          </div>
                          <!-- eslint-disable max-len -->
                          <InputText
                            class="col-12"
                            name="location.ltsaPIDLookup"
                            :bold="false"
                            :disabled="!editable"
                            help-text="List the parcel IDs - if multiple PIDS, separate them with commas, e.g., 006-209-521, 007-209-522"
                          />
                          <!-- eslint-enable max-len -->
                        </div>
                      </template>
                    </Card>
                  </AccordionTab>
                </Accordion>
                <Accordion
                  v-model:active-index="spacialAccordionIndex"
                  class="mb-3"
                >
                  <AccordionTab header="Spatial file or PDF upload">
                    <Card class="no-shadow">
                      <template #content>
                        <div class="formgrid grid">
                          <div class="col-12 text-blue-500 mb-2">
                            <a
                              href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
                              target="_blank"
                            >
                              See acceptable file formats
                            </a>
                          </div>
                          <AdvancedFileUpload
                            :activity-id="values.activityId"
                            :accept="SPATIAL_FILE_FORMATS"
                            :disabled="!editable"
                          />
                        </div>
                      </template>
                    </Card>
                  </AccordionTab>
                </Accordion>
                <Accordion
                  v-model:active-index="geomarkAccordionIndex"
                  class="mb-3"
                >
                  <AccordionTab header="Geomark">
                    <Card class="no-shadow">
                      <template #content>
                        <div class="formgrid grid">
                          <div class="col-12">
                            <label>
                              <a
                                href="https://apps.gov.bc.ca/pub/geomark/overview"
                                target="_blank"
                              >
                                Open Geomark Web Service
                              </a>
                            </label>
                          </div>
                          <InputText
                            class="col-12"
                            name="location.geomarkUrl"
                            :bold="false"
                            :disabled="!editable"
                            placeholder="Type in URL"
                          />
                        </div>
                      </template>
                    </Card>
                  </AccordionTab>
                </Accordion>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex align-items-center">
                  <div class="flex flex-grow-1">
                    <span class="section-header">
                      Is there anything else you would like to tell us about this project's location?
                    </span>
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <TextArea
                  class="col-12"
                  name="location.projectLocationDescription"
                  :disabled="!editable"
                />
              </template>
            </Card>

            <StepperNavigation
              :editable="editable"
              :next-callback="nextCallback"
              :prev-callback="prevCallback"
            >
              <template #content>
                <Button
                  class="p-button-sm"
                  outlined
                  label="Save draft"
                  :disabled="!editable"
                  @click="onSaveDraft(values)"
                />
              </template>
            </StepperNavigation>
          </template>
        </StepperPanel>

        <!--
      Permits & Reports
      -->
        <StepperPanel>
          <template #header="{ index, clickCallback }">
            <StepperHeader
              :index="index"
              :active-step="activeStep"
              :click-callback="clickCallback"
              title="Permits & Reports"
              icon="fa-file"
              :class="{
                'app-error-color':
                  (validationErrors.includes(IntakeFormCategory.PERMITS) ||
                    validationErrors.includes(IntakeFormCategory.APPLIED_PERMITS)) &&
                  !formModified
              }"
            />
          </template>
          <template #content="{ prevCallback }">
            <Message
              v-if="validationErrors.length && !formModified"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="text-center mt-0"
            >
              {{ VALIDATION_BANNER_TEXT }}
            </Message>

            <Card>
              <template #title>
                <div class="flex">
                  <span class="section-header">Have you applied for any provincial permits for this project?</span>
                  <div
                    v-tooltip.right="
                      `Early information on your permitting needs will help us
                    coordinate and expedite the authorization process.`
                    "
                  >
                    <font-awesome-icon icon="fa-solid fa-circle-question" />
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <FieldArray
                    v-slot="{ fields, push, remove }"
                    name="appliedPermits"
                  >
                    <RadioList
                      class="col-12"
                      name="permits.hasAppliedProvincialPermits"
                      :bold="false"
                      :disabled="!editable"
                      :options="YES_NO_UNSURE_LIST"
                      @on-change="(e) => onPermitsHasAppliedChange(e, fields.length, push, setFieldValue)"
                    />
                    <div
                      v-if="
                        values.permits?.hasAppliedProvincialPermits === BasicResponse.YES ||
                        values.permits?.hasAppliedProvincialPermits === BasicResponse.UNSURE
                      "
                      class="col-12"
                    >
                      <div class="mb-2">
                        <span class="text-red-500">
                          * Sharing this information will authorize the navigators to seek additional information about
                          this permit.
                        </span>
                      </div>
                      <Card class="no-shadow">
                        <template #content>
                          <div class="formgrid grid">
                            <div
                              v-for="(permit, idx) in fields"
                              :key="idx"
                              :index="idx"
                              class="w-full flex align-items-top"
                            >
                              <input
                                type="hidden"
                                :name="`appliedPermits[${idx}].permitId`"
                              />
                              <Dropdown
                                class="col-4"
                                :disabled="!editable"
                                :name="`appliedPermits[${idx}].permitTypeId`"
                                placeholder="Select Permit type"
                                :options="getPermitTypes"
                                :option-label="(e) => `${e.businessDomain}: ${e.name}`"
                                option-value="permitTypeId"
                                :loading="getPermitTypes === undefined"
                              />
                              <InputText
                                class="col-4"
                                :name="`appliedPermits[${idx}].trackingId`"
                                :disabled="!editable"
                                placeholder="Tracking #"
                              />
                              <div class="col-4">
                                <div class="flex justify-content-center">
                                  <Calendar
                                    class="w-full"
                                    :name="`appliedPermits[${idx}].statusLastVerified`"
                                    :disabled="!editable"
                                    placeholder="Status last verified"
                                  />
                                  <div class="flex align-items-center ml-2 mb-3">
                                    <Button
                                      v-if="editable"
                                      class="p-button-lg p-button-text p-button-danger p-0"
                                      aria-label="Delete"
                                      @click="remove(idx)"
                                    >
                                      <font-awesome-icon icon="fa-solid fa-trash" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="col-12">
                              <Button
                                v-if="editable"
                                class="w-full flex justify-content-center font-bold"
                                @click="
                                  push({
                                    permitTypeId: undefined,
                                    trackingId: undefined,
                                    statusLastVerified: undefined
                                  })
                                "
                              >
                                <font-awesome-icon
                                  icon="fa-solid fa-plus"
                                  fixed-width
                                />
                                Add permit
                              </Button>
                            </div>
                          </div>
                        </template>
                      </Card>
                    </div>
                  </FieldArray>
                </div>
              </template>
            </Card>
            <Card
              v-if="
                values.permits?.hasAppliedProvincialPermits === BasicResponse.YES ||
                values.permits?.hasAppliedProvincialPermits === BasicResponse.UNSURE
              "
            >
              <template #title>
                <div class="flex">
                  <span class="section-header">Would you like to have the status of the above permit(s) checked?</span>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <RadioList
                    class="col-12"
                    name="permits.checkProvincialPermits"
                    :bold="false"
                    :disabled="!editable"
                    :options="YES_NO_LIST"
                  />
                </div>
              </template>
            </Card>
            <Card>
              <template #content>
                <span class="flex font-bold">
                  <p>
                    Go to
                    <a
                      class="no-underline"
                      href="https://permitconnectbc.gov.bc.ca/#authorizations"
                      target="_blank"
                    >
                      Permit Connect BC
                    </a>
                    to learn more about permits issued by the provincial government
                  </p>
                </span>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex">
                  <span class="section-header">
                    Select all provincially issued permits you think you might need (optional)
                  </span>
                  <div
                    v-tooltip.right="
                      `Early information on your permitting needs will help us
                    coordinate and expedite the authorization process.`
                    "
                  >
                    <font-awesome-icon icon="fa-solid fa-circle-question" />
                  </div>
                </div>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <FieldArray
                    v-slot="{ fields, push, remove }"
                    name="investigatePermits"
                  >
                    <div class="col-12">
                      <Card class="no-shadow">
                        <template #content>
                          <div class="formgrid grid">
                            <div
                              v-for="(permit, idx) in fields"
                              :key="idx"
                              :index="idx"
                              class="w-full flex align-items-center"
                            >
                              <div class="col-4">
                                <div class="flex justify-content-center">
                                  <Dropdown
                                    class="w-full"
                                    :disabled="!editable"
                                    :name="`investigatePermits[${idx}].permitTypeId`"
                                    placeholder="Select Permit type"
                                    :options="getPermitTypes"
                                    :option-label="(e) => `${e.businessDomain}: ${e.name}`"
                                    option-value="permitTypeId"
                                    :loading="getPermitTypes === undefined"
                                  />
                                  <div class="flex align-items-center ml-2 mb-4">
                                    <Button
                                      v-if="editable"
                                      class="p-button-lg p-button-text p-button-danger p-0"
                                      aria-label="Delete"
                                      @click="remove(idx)"
                                    >
                                      <font-awesome-icon icon="fa-solid fa-trash" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div class="col" />
                            </div>
                            <div class="col-12">
                              <Button
                                v-if="editable"
                                class="w-full flex justify-content-center font-bold"
                                @click="
                                  push({
                                    permitTypeId: undefined
                                  })
                                "
                              >
                                <font-awesome-icon
                                  icon="fa-solid fa-plus"
                                  fixed-width
                                />
                                Add permit
                              </Button>
                            </div>
                          </div>
                        </template>
                      </Card>
                    </div>
                  </FieldArray>
                </div>
              </template>
            </Card>

            <StepperNavigation
              :editable="editable"
              :next-disabled="true"
              :prev-callback="prevCallback"
              @click="() => onSaveDraft(values, true, false)"
            >
              <template #content>
                <Button
                  class="p-button-sm"
                  outlined
                  label="Save draft"
                  :disabled="!editable"
                  @click="onSaveDraft(values)"
                />
              </template>
            </StepperNavigation>
          </template>
        </StepperPanel>
      </Stepper>
      <div class="flex align-items-center justify-content-center mt-4">
        <Button
          label="Submit"
          type="submit"
          icon="pi pi-upload"
          :disabled="!editable || !isSubmittable"
        />
      </div>
    </Form>
  </div>
  <SubmissionIntakeConfirmation
    v-else-if="assignedActivityId"
    :assigned-activity-id="assignedActivityId"
  />
  <IntakeAssistanceConfirmation
    v-else-if="assistanceAssignedActivityId"
    :assigned-activity-id="assistanceAssignedActivityId"
  />
</template>

<style scoped lang="scss">
.no-shadow {
  box-shadow: none;
}

:deep(.p-invalid),
:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: $app-error !important;
}

.p-card {
  border-color: rgb(242, 241, 241);
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 1rem;

  .section-header {
    padding-left: 1rem;
    padding-right: 0.5rem;
  }

  :deep(.p-card-title) {
    font-size: 1rem;
  }

  :deep(.p-card-body) {
    padding-bottom: 0.5rem;

    padding-left: 0;
    padding-right: 0;
  }

  :deep(.p-card-content) {
    padding-bottom: 0;
    padding-top: 0;

    padding-left: 1rem;
    padding-right: 1rem;
  }
}

:deep(.p-message-wrapper) {
  padding: 0.5rem;
}

:deep(.p-stepper-header:first-child) {
  padding-left: 0;

  .p-button {
    padding-left: 0;
  }
}

:deep(.p-stepper-header:last-child) {
  padding-right: 0;

  .p-button {
    padding-right: 0;
  }
}

:deep(.p-stepper-panels) {
  padding-left: 0;
  padding-right: 0;
}

.lat-long-btn {
  height: 2.3rem;
}
</style>
