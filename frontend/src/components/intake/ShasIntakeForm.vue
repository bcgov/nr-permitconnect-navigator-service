<script setup lang="ts">
import { ErrorMessage, Form, useField } from 'vee-validate';
import { onBeforeMount, ref, toRaw, toRefs } from 'vue';
import { boolean, mixed, number, object, string } from 'yup';

import {
  Calendar,
  Checkbox,
  Dropdown,
  EditableDropdown,
  Editor,
  InputMask,
  InputNumber,
  RadioList,
  InputText,
  StepperHeader,
  StepperNavigation,
  TextArea
} from '@/components/form';
import { Button, Card, Divider, Stepper, StepperPanel, useToast } from '@/lib/primevue';
import {
  ContactPreferenceList,
  NumResidentialUnits,
  ProjectRelationshipList,
  YesNo,
  YesNoUnsure
} from '@/utils/constants';
import { BASIC_RESPONSES } from '@/utils/enums';
import { deepToRaw } from '@/utils/utils';

import type { Ref } from 'vue';

// State
const activeStep: Ref<number> = ref(0);
const editable: Ref<boolean> = ref(true);
const formValues: Ref<any | undefined> = ref(undefined);
const initialFormValues: Ref<any | undefined> = ref(undefined);

// Form validation schema
const formSchema = object({});

// Actions
const toast = useToast();

const onSubmit = async (data: any) => {
  editable.value = false;

  try {
    console.log(data);
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;
  }
};

function onStepChange(values: any, setValues: Function, stepCallback: Function) {
  // Step changing wipes form values so store them all to a local state and reapply after step change
  formValues.value = { ...formValues.value, ...deepToRaw(values) };
  stepCallback();
  setValues(deepToRaw(formValues.value));
}

onBeforeMount(async () => {
  // Default form values
  initialFormValues.value = {};
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    v-slot="{ handleReset, setFieldValue, setValues, values, errors }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="onSubmit"
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
            :click-callback="() => onStepChange(values, setValues, clickCallback)"
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
              <div class="formgrid grid pt-3">
                <InputText
                  class="col-6"
                  name="applicant.firstName"
                  label="First name"
                  float-label
                  :bold="false"
                  :disabled="!editable"
                />
                <InputText
                  class="col-6"
                  name="applicant.lastName"
                  label="Last name"
                  float-label
                  :bold="false"
                  :disabled="!editable"
                />
                <InputMask
                  class="col-6"
                  name="applicant.phoneNumber"
                  mask="(999) 999-9999"
                  label="Phone number"
                  float-label
                  :bold="false"
                  :disabled="!editable"
                />
                <InputText
                  class="col-6"
                  name="applicant.email"
                  label="Email"
                  float-label
                  :bold="false"
                  :disabled="!editable"
                />
                <Dropdown
                  class="col-6"
                  name="applicant.relationshipToProject"
                  label="Relationship to project"
                  float-label
                  :bold="false"
                  :disabled="!editable"
                  :options="ProjectRelationshipList"
                />
                <Dropdown
                  class="col-6"
                  name="applicant.contactPreference"
                  label="Preferred contact method"
                  float-label
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
                    name="basic.developedInBC"
                    :bold="false"
                    :disabled="!editable"
                    :options="YesNo"
                  />
                  <InputText
                    v-if="values.basic.developedInBC"
                    class="col-6 pl-0"
                    name="basic.registeredName"
                    :placeholder="
                      values.basic.developedInBC === BASIC_RESPONSES.YES
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
            :next-callback="() => onStepChange(values, setValues, nextCallback)"
            :prev-disabled="true"
          />
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
            :click-callback="() => onStepChange(values, setValues, clickCallback)"
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
              <div class="formgrid grid pt-3">
                <InputText
                  class="col-6"
                  name="housing.projectName"
                  label="Type in project name - well known title like Capital Park"
                  float-label
                  :bold="false"
                  :disabled="!editable"
                />
                <div class="col-6" />
                <div class="col-12">
                  <div class="flex align-items-center">
                    <p class="font-bold m-0">Provide additional information</p>
                    <div
                      v-tooltip.right="
                        `Provide us with additional information -
                         short description about the project, project website link, or upload a document.`
                      "
                      class="pl-2"
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
              </div>
            </template>
          </Card>

          <Card>
            <template #title>
              <span class="section-header">Select the types of residential units being developed</span>
              <Divider type="solid" />
            </template>
            <template #content>
              <div class="formgrid grid pt-3">
                <Checkbox
                  class="col-6"
                  name="housing.singleFamilySelected"
                  label="Single-family"
                  :disabled="!editable"
                />
                <div class="col-6">
                  <div class="flex">
                    <Checkbox
                      name="housing.multiFamilySelected"
                      label="Multi-family"
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
                  :disabled="!editable"
                />
                <div class="col-6" />
                <InputText
                  class="col-6"
                  name="housing.otherDescription"
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
                  <div v-tooltip.right="`TODO: MISSING FROM MOCKUPS`">
                    <font-awesome-icon icon="fa-solid fa-circle-question" />
                  </div>
                </div>
                <Button
                  class="p-button-sm mr-3"
                  outlined
                  @click="
                    () => {
                      setFieldValue('housing.financiallySupportedBC', BASIC_RESPONSES.NO);
                      setFieldValue('housing.financiallySupportedIndigenous', BASIC_RESPONSES.NO);
                      setFieldValue('housing.financiallySupportedNonProfit', BASIC_RESPONSES.NO);
                      setFieldValue('housing.financiallySupportedHousingCoop', BASIC_RESPONSES.NO);
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
                <div class="col mb-3">
                  <div class="flex align-items-center">
                    <label>BC Housing</label>
                    <div v-tooltip.right="`TODO: MISSING FROM MOCKUPS`">
                      <font-awesome-icon
                        class="pl-2"
                        icon="fa-solid fa-circle-question"
                      />
                    </div>
                  </div>
                </div>
                <RadioList
                  class="col-12"
                  name="housing.financiallySupportedBC"
                  :bold="false"
                  :disabled="!editable"
                  :options="YesNoUnsure"
                />
                <div class="col mb-3"><label>Indigenous Housing Provider</label></div>
                <RadioList
                  class="col-12"
                  name="housing.financiallySupportedIndigenous"
                  :bold="false"
                  :disabled="!editable"
                  :options="YesNoUnsure"
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
                <div class="col mb-3"><label>Non-profit housing society</label></div>
                <RadioList
                  class="col-12"
                  name="housing.financiallySupportedNonProfit"
                  :bold="false"
                  :disabled="!editable"
                  :options="YesNoUnsure"
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
                <div class="col mb-3"><label>Housing co-operative</label></div>
                <RadioList
                  class="col-12"
                  name="housing.financiallySupportedHousingCoop"
                  :bold="false"
                  :disabled="!editable"
                  :options="YesNoUnsure"
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
            :next-callback="() => onStepChange(values, setValues, nextCallback)"
            :prev-callback="() => onStepChange(values, setValues, prevCallback)"
          />
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
            :click-callback="() => onStepChange(values, setValues, clickCallback)"
            title="Location"
            icon="fa-location-dot"
          />
        </template>
        <template #content="{ prevCallback, nextCallback }">
          Some content

          <StepperNavigation
            :editable="editable"
            :next-callback="() => onStepChange(values, setValues, nextCallback)"
            :prev-callback="() => onStepChange(values, setValues, prevCallback)"
          />
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
            :click-callback="() => onStepChange(values, setValues, clickCallback)"
            title="Permits & Reports"
            icon="fa-file"
          />
        </template>
        <template #content="{ prevCallback }">
          Some content

          <StepperNavigation
            :editable="editable"
            :next-disabled="true"
            :prev-callback="() => onStepChange(values, setValues, prevCallback)"
          />
        </template>
      </StepperPanel>
    </Stepper>
    <div class="flex align-items-center justify-content-center mt-4">
      <Button
        label="Submit"
        type="submit"
        icon="pi pi-upload"
        :disabled="!editable"
      />
    </div>
  </Form>
</template>

<style scoped lang="scss">
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
</style>
