<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form, FieldArray } from 'vee-validate';
import { onBeforeMount, ref } from 'vue';
import { object, string } from 'yup';

import FileUpload from '@/components/file/FileUpload.vue';
import {
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
import { permitService, submissionService } from '@/services';
import { useTypeStore } from '@/store';
import {
  ContactPreferenceList,
  NumResidentialUnits,
  PermitStatus,
  ProjectRelationshipList,
  RouteNames,
  YesNo,
  YesNoUnsure
} from '@/utils/constants';
import { BASIC_RESPONSES } from '@/utils/enums';
import { deepToRaw } from '@/utils/utils';

import type { Ref } from 'vue';
import Calendar from '../form/Calendar.vue';

// Store
const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);

// State
const activeStep: Ref<number> = ref(0);
const assignedActivityId: Ref<string | undefined> = ref(undefined);
const editable: Ref<boolean> = ref(true);
const geomarkAccordionIndex: Ref<number | undefined> = ref(undefined);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const parcelAccordionIndex: Ref<number | undefined> = ref(undefined);
const spacialAccordionIndex: Ref<number | undefined> = ref(undefined);

// Enums
const enum PROJECT_LOCATION {
  STREET_ADDRESS = 'Street address',
  LOCATION_COORDINATES = 'Location coordinates'
}

// Constants
const ProjectLocation = [PROJECT_LOCATION.STREET_ADDRESS, PROJECT_LOCATION.LOCATION_COORDINATES];

// Form validation schema
const formSchema = object({});

// Actions
const confirm = useConfirm();
const toast = useToast();

function confirmSubmit(data: any) {
  confirm.require({
    message: 'Are you sure you wish to submit this form? Please review the form before submitting.',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onSubmit(data)
  });
}

function onPermitsHasAppliedChange(e: BASIC_RESPONSES, fieldsLength: number, push: Function, setFieldValue: Function) {
  if (e === BASIC_RESPONSES.YES || e === BASIC_RESPONSES.UNSURE) {
    if (fieldsLength === 0) {
      push({
        permitTypeId: undefined,
        trackingId: undefined,
        status: undefined
      });
    }
  } else {
    setFieldValue('appliedPermits', undefined);
    setFieldValue('permits.checkPermits', undefined);
  }
}

function onSaveDraft(data: any) {
  editable.value = false;

  try {
    console.log(deepToRaw(data));
  } catch (e: any) {
    toast.error('Failed to save draft', e);
  } finally {
    editable.value = true;
  }
}

async function onSubmit(data: any) {
  editable.value = false;

  try {
    console.log(data);
    const result = await submissionService.createSubmission(data);
    if (result.data.activityId) {
      assignedActivityId.value = result.data.activityId;
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;
  }
}

onBeforeMount(async () => {
  // Default form values
  initialFormValues.value = {
    location: {
      province: 'BC'
    }
  };

  typeStore.setPermitTypes((await permitService.getPermitTypes()).data);
});
</script>

<template>
  <div v-if="!assignedActivityId">
    <Form
      v-if="initialFormValues"
      v-slot="{ setFieldValue, values }"
      keep-values
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="confirmSubmit"
    >
      <Stepper v-model:activeStep="activeStep">
        <!--
      Basic info
      -->
        <StepperPanel>
          <template #header="{ index, clickCallback }">
            <StepperHeader
              :index="index"
              :active-step="activeStep"
              :click-callback="clickCallback"
              title="Basic info"
              icon="fa-user"
            />
          </template>
          <template #content="{ nextCallback }">
            <Card>
              <template #title>
                <span class="section-header">Applicant Info</span>
                <Divider type="solid" />
              </template>
              <template #content>
                <div class="formgrid grid">
                  <InputText
                    class="col-6"
                    name="applicant.firstName"
                    label="First name"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <InputText
                    class="col-6"
                    name="applicant.lastName"
                    label="Last name"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <InputMask
                    class="col-6"
                    name="applicant.phoneNumber"
                    mask="(999) 999-9999"
                    label="Phone number"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <InputText
                    class="col-6"
                    name="applicant.email"
                    label="Email"
                    :bold="false"
                    :disabled="!editable"
                  />
                  <Dropdown
                    class="col-6"
                    name="applicant.relationshipToProject"
                    label="Relationship to project"
                    :bold="false"
                    :disabled="!editable"
                    :options="ProjectRelationshipList"
                  />
                  <Dropdown
                    class="col-6"
                    name="applicant.contactPreference"
                    label="Preferred contact method"
                    :bold="false"
                    :disabled="!editable"
                    :options="ContactPreferenceList"
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
                    :options="YesNo"
                  />

                  <span
                    v-if="values.basic?.isDevelopedByCompanyOrOrg === BASIC_RESPONSES.YES"
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
                      :options="YesNo"
                    />
                    <InputText
                      v-if="values.basic.isDevelopedInBC"
                      class="col-6 pl-0"
                      name="basic.registeredName"
                      :placeholder="
                        values.basic.isDevelopedInBC === BASIC_RESPONSES.YES
                          ? 'Type to search the B.C registered name'
                          : 'Type the business/company/organization name'
                      "
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
            />
          </template>
          <template #content="{ prevCallback, nextCallback }">
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
                    label="Type in project name - well known title like Capital Park"
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
                  />
                  <div class="col-6">
                    <div class="flex">
                      <Checkbox
                        name="housing.multiFamilySelected"
                        label="Multi-family"
                        :bold="false"
                        :disabled="!editable"
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
                    :options="NumResidentialUnits"
                    placeholder="How many expected units?"
                  />
                  <Dropdown
                    class="col-6"
                    name="housing.multiFamilyUnits"
                    :disabled="!editable || !values.housing.multiFamilySelected"
                    :options="NumResidentialUnits"
                    placeholder="How many expected units?"
                  />
                  <Checkbox
                    class="col-6"
                    name="housing.otherSelected"
                    label="Other"
                    :bold="false"
                    :disabled="!editable"
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
                    :options="NumResidentialUnits"
                    placeholder="How many expected units?"
                  />
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
                    :options="YesNoUnsure"
                  />
                  <Dropdown
                    v-if="values.housing.hasRentalUnits === BASIC_RESPONSES.YES"
                    class="col-6"
                    name="housing.rentalUnits"
                    :disabled="!editable"
                    :options="NumResidentialUnits"
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
                        setFieldValue('housing.financiallySupportedBC', BASIC_RESPONSES.NO);
                        setFieldValue('housing.financiallySupportedIndigenous', BASIC_RESPONSES.NO);
                        setFieldValue('housing.indigenousDescription', undefined);
                        setFieldValue('housing.financiallySupportedNonProfit', BASIC_RESPONSES.NO);
                        setFieldValue('housing.nonProfitDescription', undefined);
                        setFieldValue('housing.financiallySupportedHousingCoop', BASIC_RESPONSES.NO);
                        setFieldValue('housing.housingCoopDescription', undefined);
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
                    :options="YesNoUnsure"
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
                    :options="YesNoUnsure"
                    @on-change="
                      (e) => {
                        console.log(e);
                        if (e !== BASIC_RESPONSES.YES) setFieldValue('housing.indigenousDescription', undefined);
                      }
                    "
                  />
                  <div class="col-12">
                    <InputText
                      v-if="values.housing?.financiallySupportedIndigenous === BASIC_RESPONSES.YES"
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
                    :options="YesNoUnsure"
                    @on-change="
                      (e) => {
                        console.log(e);
                        if (e !== BASIC_RESPONSES.YES) setFieldValue('housing.nonProfitDescription', undefined);
                      }
                    "
                  />
                  <div class="col-12">
                    <InputText
                      v-if="values.housing?.financiallySupportedNonProfit === BASIC_RESPONSES.YES"
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
                    :options="YesNoUnsure"
                    @on-change="
                      (e) => {
                        console.log(e);
                        if (e !== BASIC_RESPONSES.YES) setFieldValue('housing.housingCoopDescription', undefined);
                      }
                    "
                  />
                  <div class="col-12">
                    <InputText
                      v-if="values.housing?.financiallySupportedHousingCoop === BASIC_RESPONSES.YES"
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
            />
          </template>
          <template #content="{ prevCallback, nextCallback }">
            <Card>
              <template #title>
                <div class="flex">
                  <span class="section-header">Has the location of the project been affected by natural disaster?</span>
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
                    :options="YesNo"
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
                    :options="ProjectLocation"
                  />
                  <div
                    v-if="values.location?.projectLocation === PROJECT_LOCATION.STREET_ADDRESS"
                    class="col-12"
                  >
                    <Card class="no-shadow">
                      <template #content>
                        <div class="grid nested-grid">
                          <InputText
                            class="col-12"
                            name="location.addressSearch"
                            :disabled="!editable"
                            placeholder="Search the address of your housing project"
                          />
                          <InputText
                            class="col-4"
                            name="location.streetAddress"
                            :disabled="!editable"
                            placeholder="Street address"
                          />
                          <InputText
                            class="col-4"
                            name="location.locality"
                            :disabled="!editable"
                            placeholder="Locality"
                          />
                          <InputText
                            class="col-4"
                            name="location.province"
                            :disabled="!editable"
                            placeholder="Province"
                          />
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
                  <div
                    v-if="values.location?.projectLocation === PROJECT_LOCATION.LOCATION_COORDINATES"
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
                          <!-- eslint-disable max-len -->
                          <InputText
                            class="col-12"
                            name="location.ltsaPIDLookup"
                            label="LTSA PID Lookup"
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
            />
          </template>
          <template #content="{ prevCallback }">
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
                      :options="YesNoUnsure"
                      @on-change="(e) => onPermitsHasAppliedChange(e, fields.length, push, setFieldValue)"
                    />
                    <div
                      v-if="
                        values.permits?.hasAppliedProvincialPermits === BASIC_RESPONSES.YES ||
                        values.permits?.hasAppliedProvincialPermits === BASIC_RESPONSES.UNSURE
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
                              class="w-full flex align-items-center"
                            >
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
                                @click="
                                  push({
                                    permitTypeId: undefined,
                                    trackingId: undefined,
                                    status: undefined
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
                values.permits?.hasAppliedProvincialPermits === BASIC_RESPONSES.YES ||
                values.permits?.hasAppliedProvincialPermits === BASIC_RESPONSES.UNSURE
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
                    :options="YesNo"
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
                              <Dropdown
                                class="col-4"
                                :name="`investigatePermits[${idx}].permitTypeId`"
                                placeholder="Select Permit type"
                                :options="getPermitTypes"
                                :option-label="(e) => `${e.businessDomain}: ${e.name}`"
                                option-value="permitTypeId"
                                :loading="getPermitTypes === undefined"
                              />
                              <div class="col-1">
                                <div class="flex justify-content-left">
                                  <div class="flex align-items-center mb-3">
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
          :disabled="!editable || activeStep !== 3"
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
      Your application has been succesfully submitted.
    </Message>
    <h3>Confirmation ID: {{ assignedActivityId }}</h3>
    <div>
      Your submission will be reviewed by a Housing Navigator. You may be contacted if needed. Please check your email
      for the confirmation email and keep the confirmation ID for future reference.
    </div>
    <div class="mt-4"><router-link :to="{ name: RouteNames.HOME }">Go to Homepage</router-link></div>
  </div>
</template>

<style scoped lang="scss">
.no-shadow {
  box-shadow: none;
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
</style>
