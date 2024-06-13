<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, FieldArray, ErrorMessage } from 'vee-validate';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import FileUpload from '@/components/file/FileUpload.vue';
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
import CollectionDisclaimer from '@/components/housing/intake/CollectionDisclaimer.vue';
import { shasIntakeSchema } from '@/components/housing/intake/ShasIntakeSchema';
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
import { externalApiService, permitService, submissionService } from '@/services';
import { useConfigStore, useTypeStore } from '@/store';

import type { IInputEvent } from '@/interfaces';
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { DropdownChangeEvent } from 'primevue/dropdown';
import type { Ref } from 'vue';
import type { Permit } from '@/types';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { IntakeFormCategory, IntakeStatus, PermitNeeded, PermitStatus, ProjectLocation } from '@/utils/enums/housing';
import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import {
  CONTACT_PREFERENCE_LIST,
  NUM_RESIDENTIAL_UNITS_LIST,
  PROJECT_LOCATION_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/constants/housing';
import { confirmationTemplate } from '@/utils/templates';

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

// Constants
const VALIDATION_BANNER_TEXT =
  'One or more of the required fields are missing or contains invalid data. Please check the highlighted fields.';

// Store
const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);
const { getConfig } = storeToRefs(useConfigStore());

// State
const activeStep: Ref<number> = ref(0);
const addressGeocoderOptions: Ref<Array<any>> = ref([]);
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const geomarkAccordionIndex: Ref<number | undefined> = ref(undefined);
const isSubmittable: Ref<boolean> = ref(false);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const orgBookOptions: Ref<Array<any>> = ref([]);
const parcelAccordionIndex: Ref<number | undefined> = ref(undefined);
const spacialAccordionIndex: Ref<number | undefined> = ref(undefined);
const validationErrors: Ref<string[]> = ref([]);
const formUpdated: Ref<boolean> = ref(false);

// Actions
const confirm = useConfirm();
const router = useRouter();
const toast = useToast();

const checkSubmittable = (stepNumber: number) => {
  if (stepNumber === 3) isSubmittable.value = true;
};

function confirmLeave() {
  confirm.require({
    message: 'Are you sure you want to leave this page? Any unsaved changes will be lost. Please save as draft first.',
    header: 'Leave this page?',
    acceptLabel: 'Leave',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => router.push({ name: RouteName.HOUSING })
  });
}

function confirmSubmit(data: any) {
  const tempData = Object.assign({}, data);
  delete tempData['addressSearch'];

  confirm.require({
    message: 'Are you sure you wish to submit this form? Please review the form before submitting.',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onSubmit(tempData)
  });
}

const getAddressSearchLabel = (e: GeocoderEntry) => {
  return e?.properties?.fullAddress;
};

function handleProjectLocationClick() {
  formRef?.value?.setFieldValue('location.latitude', null);
  formRef?.value?.setFieldValue('location.longitude', null);
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

function displayErrors(a: any) {
  validationErrors.value = Array.from(new Set(a.errors ? Object.keys(a.errors).map((x) => x.split('.')[0]) : []));
  document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
  formUpdated.value = false;
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

async function onSaveDraft(data: any) {
  editable.value = false;

  const tempData = Object.assign({}, data);
  delete tempData['addressSearch'];

  try {
    let response;
    if (data.submissionId) {
      response = await submissionService.updateDraft(tempData.submissionId, tempData);
    } else {
      response = await submissionService.createDraft(tempData);
    }

    if (response.data.submissionId && response.data.activityId) {
      formRef.value?.setFieldValue('submissionId', response.data.submissionId);
      formRef.value?.setFieldValue('activityId', response.data.activityId);
    } else {
      throw new Error('Failed to retrieve correct draft data');
    }

    toast.success('Draft saved');
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  } finally {
    editable.value = true;
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
  let applicantEmail = formRef.value?.values.applicant.email;
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

onBeforeMount(async () => {
  let response,
    permits: Array<Permit> = [];
  if (props.activityId && props.submissionId) {
    response = (await submissionService.getSubmission(props.submissionId)).data;
    permits = (await permitService.listPermits(props.activityId)).data;
    editable.value = response.intakeStatus === IntakeStatus.DRAFT;
  }

  // Default form values
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
  };

  typeStore.setPermitTypes((await permitService.getPermitTypes()).data);
});
</script>

<template>
  <div v-if="!assignedActivityId">
    <Button
      class="p-0"
      text
      @click="confirmLeave"
    >
      <font-awesome-icon
        icon="fa fa-arrow-circle-left"
        class="mr-1"
      />
      <span>Back to Housing</span>
    </Button>

    <Form
      v-if="initialFormValues"
      id="form"
      v-slot="{ setFieldValue, values }"
      ref="formRef"
      :initial-values="initialFormValues"
      :validation-schema="shasIntakeSchema"
      @invalid-submit="(e) => displayErrors(e)"
      @submit="confirmSubmit"
      @change="formUpdated = true"
    >
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
                  !formUpdated
              }"
            />
          </template>
          <template #content="{ nextCallback }">
            <CollectionDisclaimer />

            <Message
              v-if="validationErrors.length && !formUpdated"
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
              :class="{ 'app-error-color': validationErrors.includes(IntakeFormCategory.HOUSING) && !formUpdated }"
            />
          </template>
          <template #content="{ prevCallback, nextCallback }">
            <Message
              v-if="validationErrors.length && !formUpdated"
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
                  <FileUpload
                    class="col-12"
                    activity-id="TODO_HOW_TO_CREATE_DOCUMENTS_WITHOUT_ACTIVITY_ID"
                    :disabled="true"
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
                'app-error-color': validationErrors.includes(IntakeFormCategory.LOCATION) && !formUpdated
              }"
            />
          </template>
          <template #content="{ prevCallback, nextCallback }">
            <Message
              v-if="validationErrors.length && !formUpdated"
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
                    @click="handleProjectLocationClick"
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
                          />
                          <InputNumber
                            class="col-4"
                            name="location.longitude"
                            :disabled="!editable"
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
                </div>
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
                          <div class="col-12 text-blue-500">
                            <a
                              href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
                              target="_blank"
                            >
                              See acceptable file formats
                            </a>
                          </div>
                          <FileUpload
                            class="col-12"
                            activity-id="TODO_HOW_TO_CREATE_DOCUMENTS_WITHOUT_ACTIVITY_ID"
                            :disabled="true"
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
                  !formUpdated
              }"
            />
          </template>
          <template #content="{ prevCallback }">
            <Message
              v-if="validationErrors.length && !formUpdated"
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
                                class="w-full flex justify-content-center font-bold"
                                :disabled="!editable"
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
                                    :name="`investigatePermits[${idx}].permitTypeId`"
                                    placeholder="Select Permit type"
                                    :options="getPermitTypes"
                                    :option-label="(e) => `${e.businessDomain}: ${e.name}`"
                                    option-value="permitTypeId"
                                    :loading="getPermitTypes === undefined"
                                  />
                                  <div class="flex align-items-center ml-2 mb-4">
                                    <Button
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
                                class="w-full flex justify-content-center font-bold"
                                :disabled="!editable"
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
  <div v-else>
    <h2>Confirmation of Submission</h2>
    <Message
      class="border-none"
      severity="success"
      :closable="false"
    >
      Your application has been successfully submitted.
    </Message>
    <h3>Confirmation ID: {{ assignedActivityId }}</h3>
    <div>
      Your submission will be reviewed by a Housing Navigator. You may be contacted if needed. Please check your email
      for the confirmation email and keep the confirmation ID for future reference.
    </div>
    <div class="mt-4"><router-link :to="{ name: RouteName.HOME }">Go to Homepage</router-link></div>
  </div>
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
</style>
