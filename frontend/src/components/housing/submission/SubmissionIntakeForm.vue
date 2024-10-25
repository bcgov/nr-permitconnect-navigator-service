<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, FieldArray, ErrorMessage } from 'vee-validate';
import { computed, onBeforeMount, nextTick, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import BackButton from '@/components/common/BackButton.vue';
import Map from '@/components/housing/maps/Map.vue';
import {
  AutoComplete,
  DatePicker,
  Checkbox,
  EditableSelect,
  FormAutosave,
  FormNavigationGuard,
  InputMask,
  InputNumber,
  InputText,
  RadioList,
  Select,
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
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Button,
  Card,
  Divider,
  Message,
  Step,
  StepList,
  Stepper,
  StepPanel,
  StepPanels,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { documentService, enquiryService, externalApiService, permitService, submissionService } from '@/services';
import { useConfigStore, useSubmissionStore, useTypeStore } from '@/store';
import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
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
import { confirmationTemplateSubmission } from '@/utils/templates';
import { omit } from '@/utils/utils';

import type { Ref } from 'vue';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { SelectChangeEvent } from 'primevue/select';
import type { IInputEvent } from '@/interfaces';
import type { Document, Permit, PermitType, Submission } from '@/types';

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
const { activityId = undefined, submissionId = undefined } = defineProps<{
  activityId?: string;
  submissionId?: string;
}>();

// Constants
const VALIDATION_BANNER_TEXT =
  // eslint-disable-next-line max-len
  'One or more of the required fields are missing or contains invalid data. Please check the highlighted pages and fields in red.';

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
const autoSaveRef: Ref<InstanceType<typeof FormAutosave> | null> = ref(null);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const geomarkAccordionIndex: Ref<number | undefined> = ref(undefined);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const mapLatitude: Ref<number | undefined> = ref(undefined);
const mapLongitude: Ref<number | undefined> = ref(undefined);
const mapRef: Ref<InstanceType<typeof Map> | null> = ref(null);
const isSubmittable: Ref<boolean> = ref(false);
const orgBookOptions: Ref<Array<any>> = ref([]);
const parcelAccordionIndex: Ref<number | undefined> = ref(undefined);
const validationErrors = computed(() => {
  // Parse errors from vee-validate into a string[] of category headings
  if (!formRef?.value?.errors) return [];
  else return Array.from(new Set(Object.keys(formRef.value.errors).flatMap((x) => x.split('.')[0].split('[')[0])));
});

// Actions
const confirm = useConfirm();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const getBackButtonConfig = computed(() => {
  if (route.query.activityId) {
    return {
      text: 'Back to my drafts and previous entries',
      routeName: RouteName.HOUSING_SUBMISSIONS
    };
  } else {
    return {
      text: 'Back to Housing',
      routeName: RouteName.HOUSING
    };
  }
});

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
        }
      },
      { applicant: values?.[IntakeFormCategory.APPLICANT] }
    );

    const enquiryResponse = await enquiryService.submitDraft(formattedData);

    if (enquiryResponse.data.activityId) {
      toast.success('Form saved');
      assistanceAssignedActivityId.value = enquiryResponse.data.activityId;

      // Send confirmation email
      emailConfirmation(enquiryResponse.data.activityId, enquiryResponse.data.submissionId);
    } else {
      toast.error('Failed to submit enquiry');
    }
  } catch (e: any) {
    toast.error('Failed to save enquiry', e);
  } finally {
    editable.value = true;
  }
}

async function onAddressSearchInput(e: IInputEvent) {
  const input = e.target.value;
  addressGeocoderOptions.value =
    ((await externalApiService.searchAddressCoder(input))?.data?.features as Array<GeocoderEntry>) ?? [];
}

async function onAddressSelect(e: SelectChangeEvent) {
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
}

async function onLatLongInputClick() {
  const validLat = (await formRef?.value?.validateField('location.latitude'))?.valid;
  const validLong = (await formRef?.value?.validateField('location.longitude'))?.valid;

  if (validLat && validLong) {
    const location = formRef?.value?.values?.location;
    mapLatitude.value = location.latitude;
    mapLongitude.value = location.longitude;
  }
}

async function onInvalidSubmit() {
  switch (validationErrors.value[0]) {
    case IntakeFormCategory.APPLICANT:
    case IntakeFormCategory.BASIC:
      activeStep.value = 0;
      break;

    case IntakeFormCategory.HOUSING:
      activeStep.value = 1;
      break;

    case IntakeFormCategory.LOCATION:
      activeStep.value = 2;
      break;

    case IntakeFormCategory.PERMITS:
    case IntakeFormCategory.APPLIED_PERMITS:
      activeStep.value = 3;
      break;
  }

  await nextTick();
  document.querySelector('.p-card.p-component:has(.p-invalid)')?.scrollIntoView({ behavior: 'smooth' });
}

function onPermitsHasAppliedChange(e: string, fieldsLength: number, push: Function, setFieldValue: Function) {
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

  autoSaveRef.value?.stopAutoSave();

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
    response = await submissionService.updateDraft(draftData);

    if (response.data.activityId && response.data.submissionId) {
      formRef.value?.setFieldValue('activityId', response.data.activityId);
      formRef.value?.setFieldValue('submissionId', response.data.submissionId);

      // Update route query for refreshing
      router.replace({
        name: RouteName.HOUSING_SUBMISSION_INTAKE,
        query: {
          activityId: response.data.activityId,
          submissionId: response.data.submissionId
        }
      });
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }
    if (isAutoSave) {
      if (showToast) toast.success('Draft autosaved');
    } else {
      if (showToast) toast.success('Draft saved');
    }
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  } finally {
    editable.value = true;
  }

  if (assistanceRequired && response?.data?.activityId) {
    handleEnquirySubmit(draftData, response.data.activityId);
  }
}

function onStepChange(stepNumber: number) {
  // Map component misaligned if mounted while not visible. Trigger resize to fix on show
  if (stepNumber === 2) nextTick().then(() => mapRef?.value?.resizeMap());
  if (stepNumber === 3) isSubmittable.value = true;

  // Save a draft on very first stepper navigation if no activityId yet
  // Need this to generate an activityId for the file uploads
  if (!formRef.value?.values.activityId) {
    onSaveDraft(formRef.value?.values, true, false);
  }
}

async function onSubmit(data: any) {
  editable.value = false;

  try {
    autoSaveRef.value?.stopAutoSave();

    const response = await submissionService.submitDraft(data);

    if (response.data.activityId && response.data.submissionId) {
      assignedActivityId.value = response.data.activityId;

      // Update route query for refreshing
      router.replace({
        name: RouteName.HOUSING_SUBMISSION_INTAKE,
        query: {
          activityId: response.data.activityId,
          submissionId: response.data.submissionId
        }
      });

      // Send confirmation email
      emailConfirmation(response.data.activityId, response.data.submissionId);
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;
  }
}

async function emailConfirmation(activityId: string, submissionId: string) {
  const configCC = getConfig.value.ches?.submission?.cc;
  const body = confirmationTemplateSubmission({
    '{{ contactName }}': formRef.value?.values.applicant.contactFirstName,
    '{{ activityId }}': activityId,
    '{{ submissionId }}': submissionId
  });
  let applicantEmail = formRef.value?.values.applicant.contactEmail;
  let emailData = {
    from: configCC,
    to: [applicantEmail],
    cc: configCC,
    subject: 'Confirmation of Submission', // eslint-disable-line quotes
    bodyType: 'html',
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

onBeforeMount(async () => {
  try {
    let response,
      permits: Array<Permit> = [],
      documents: Array<Document> = [];

    if (submissionId && activityId) {
      response = (await submissionService.getSubmission(submissionId)).data;
      permits = (await permitService.listPermits(activityId)).data;
      documents = (await documentService.listDocuments(activityId)).data;
      submissionStore.setDocuments(documents);
      editable.value = response.intakeStatus === IntakeStatus.DRAFT;
    }

    initialFormValues.value = {
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
        consentToFeedback: response?.consentToFeedback,
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
        hasAppliedProvincialPermits: response?.hasAppliedProvincialPermits
      },
      investigatePermits: permits.filter((x: Permit) => x.needed === PermitNeeded.UNDER_INVESTIGATION)
    };

    await nextTick();

    // Move map pin
    onLatLongInputClick();
  } catch {
    router.replace({ name: RouteName.HOUSING_SUBMISSION_INTAKE });
  }

  // Clearing the document store on page load
  submissionStore.setDocuments([]);
});

watchEffect(() => {
  // Map component misaligned if mounted while not visible. Trigger resize to fix on show
  if (activeStep.value === 2) nextTick().then(() => mapRef?.value?.resizeMap());
  if (activeStep.value === 3) isSubmittable.value = true;
});
</script>

<template>
  <div v-if="!assignedActivityId && !assistanceAssignedActivityId">
    <BackButton
      :route-name="getBackButtonConfig.routeName"
      :text="getBackButtonConfig.text"
    />

    <div class="flex justify-content-center app-primary-color mt-3">
      <h3>Project Investigation Form</h3>
    </div>
    <Form
      v-if="initialFormValues"
      id="form"
      v-slot="{ setFieldValue, errors, meta, values }"
      ref="formRef"
      :initial-values="initialFormValues"
      :validation-schema="submissionIntakeSchema"
      @invalid-submit="onInvalidSubmit"
      @submit="confirmSubmit"
    >
      <FormNavigationGuard v-if="editable" />
      <FormAutosave
        ref="autoSaveRef"
        :callback="() => onSaveDraft(values, true)"
      />

      <SubmissionAssistance
        v-if="editable && values?.applicant"
        :form-errors="errors"
        :form-values="values"
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

      <Stepper :value="activeStep">
        <StepList>
          <Step :value="0">
            <StepperHeader
              :index="0"
              :active-step="activeStep"
              :click-callback="() => (activeStep = 0)"
              title="Contact Information"
              icon="fa-user"
              :class="{
                'app-error-color': validationErrors.includes(IntakeFormCategory.APPLICANT)
              }"
              @click="
                () => {
                  if (!values.activityId) onSaveDraft(values, true, false);
                }
              "
            />
          </Step>
          <Step :value="1">
            <StepperHeader
              :index="1"
              :active-step="activeStep"
              :click-callback="() => (activeStep = 1)"
              title="Housing"
              icon="fa-house"
              :class="{
                'app-error-color': validationErrors.includes(IntakeFormCategory.HOUSING)
              }"
            />
          </Step>
          <Step :value="2">
            <StepperHeader
              :index="2"
              :active-step="activeStep"
              :click-callback="() => (activeStep = 2)"
              title="Location"
              icon="fa-location-dot"
              :class="{
                'app-error-color': validationErrors.includes(IntakeFormCategory.LOCATION)
              }"
            />
          </Step>
          <Step :value="3">
            <StepperHeader
              :index="3"
              :active-step="activeStep"
              :click-callback="() => (activeStep = 3)"
              title="Permits & Reports"
              icon="fa-file"
              :class="{
                'app-error-color':
                  validationErrors.includes(IntakeFormCategory.PERMITS) ||
                  validationErrors.includes(IntakeFormCategory.APPLIED_PERMITS)
              }"
              @click="
                () => {
                  if (!values.activityId) onSaveDraft(values, true, false);
                }
              "
            />
          </Step>
        </StepList>
        <StepPanels>
          <StepPanel :value="0">
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
                  <Select
                    class="col-6"
                    name="applicant.contactApplicantRelationship"
                    label="Relationship to project"
                    :bold="false"
                    :disabled="!editable"
                    :options="PROJECT_RELATIONSHIP_LIST"
                  />
                  <Select
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
              :next-callback="() => activeStep++"
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
          </StepPanel>

          <StepPanel :value="1">
            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
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
                    label="Project name - your preferred name for your project"
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
                  <!-- prettier-ignore -->
                  <label class="col-12">
                    Upload documents about your housing project (pdfs, maps,
                    <a
                      href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
                      target="_blank"
                      class="text-blue-500 underline"
                    >shape files</a>, etc)
                  </label>
                  <AdvancedFileUpload
                    :activity-id="values.activityId"
                    :disabled="!editable"
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
                    :invalid="!!errors.housing && meta.touched"
                  />
                  <div class="col-6">
                    <div class="flex">
                      <Checkbox
                        name="housing.multiFamilySelected"
                        label="Multi-family"
                        :bold="false"
                        :disabled="!editable"
                        :invalid="!!errors.housing && meta.touched"
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
                  <Select
                    class="col-6"
                    name="housing.singleFamilyUnits"
                    :disabled="!editable || !values.housing.singleFamilySelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <Select
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
                    :invalid="!!errors?.housing && meta.touched"
                  />
                  <div class="col-6" />
                  <InputText
                    class="col-6"
                    name="housing.otherUnitsDescription"
                    :disabled="!editable || !values.housing.otherSelected"
                    placeholder="Type to describe what other type of housing"
                  />
                  <Select
                    class="col-6"
                    name="housing.otherUnits"
                    :disabled="!editable || !values.housing.otherSelected"
                    :options="NUM_RESIDENTIAL_UNITS_LIST"
                    placeholder="How many expected units?"
                  />
                  <div class="col-12">
                    <ErrorMessage
                      v-show="meta.touched"
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
                  <Select
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
                    <span class="section-header">Is this project associated with any of the following?</span>
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
              :next-callback="() => activeStep++"
              :prev-callback="() => activeStep--"
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
          </StepPanel>
          <StepPanel :value="2">
            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
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
                          <EditableSelect
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
                            :help-text="
                              values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES
                                ? 'Provide a coordinate between 48 and 60'
                                : ''
                            "
                            placeholder="Latitude"
                          />
                          <InputNumber
                            class="col-4"
                            name="location.longitude"
                            disabled
                            :help-text="
                              values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES
                                ? 'Provide a coordinate between -114 and -139'
                                : ''
                            "
                            placeholder="Longitude"
                          />
                          <div
                            v-if="values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES"
                            class="col-12 text-blue-500"
                          >
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
                <Accordion :value="parcelAccordionIndex">
                  <AccordionPanel value="0">
                    <AccordionHeader>Parcel ID (PID Number)</AccordionHeader>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionPanel>
                </Accordion>
                <Accordion :value="geomarkAccordionIndex">
                  <AccordionPanel value="0">
                    <AccordionHeader>Geomark</AccordionHeader>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionPanel>
                </Accordion>
              </template>
            </Card>
            <Card>
              <template #title>
                <div class="flex align-items-center">
                  <div class="flex flex-grow-1">
                    <span class="section-header">
                      Is there anything else you would like to tell us about this project's location? (optional)
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
              :next-callback="() => activeStep++"
              :prev-callback="() => activeStep--"
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
          </StepPanel>
          <StepPanel :value="3">
            <Message
              v-if="validationErrors.length"
              severity="error"
              icon="pi pi-exclamation-circle"
              :closable="false"
              class="message-banner text-center"
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
                      @on-change="(e: string) => onPermitsHasAppliedChange(e, fields.length, push, setFieldValue)"
                    />
                    <div
                      v-if="
                        values.permits?.hasAppliedProvincialPermits === BasicResponse.YES ||
                        values.permits?.hasAppliedProvincialPermits === BasicResponse.UNSURE
                      "
                      class="col-12"
                    >
                      <div class="mb-2">
                        <span class="app-primary-color">
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
                              <Select
                                class="col-4"
                                :disabled="!editable"
                                :name="`appliedPermits[${idx}].permitTypeId`"
                                placeholder="Select Permit type"
                                :options="getPermitTypes"
                                :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
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
                                  <DatePicker
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
                                  <Select
                                    class="w-full"
                                    :disabled="!editable"
                                    :name="`investigatePermits[${idx}].permitTypeId`"
                                    placeholder="Select Permit type"
                                    :options="getPermitTypes"
                                    :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
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
            <Card>
              <template #content>
                <div class="mb-2 flex align-items-center">
                  <Checkbox
                    class="m-0 inline-block"
                    name="basic.consentToFeedback"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <span class="font-bold inline">
                    Check this box if you agree to be contacted for user feedback, helping us improve our digital
                    service. Your personal information will not be shared with third parties.
                  </span>
                </div>
              </template>
            </Card>

            <StepperNavigation
              :editable="editable"
              :next-disabled="true"
              :prev-callback="() => activeStep--"
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
          </StepPanel>
        </StepPanels>
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

//////////////
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

// :deep(.p-message-wrapper) {
//   padding: 0.5rem;
// }

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

// :deep(.p-stepper-panels) {
//   padding-left: 0;
//   padding-right: 0;
// }

.lat-long-btn {
  height: 2.3rem;
}

:deep(.p-step-number) {
  display: none;
}
</style>
