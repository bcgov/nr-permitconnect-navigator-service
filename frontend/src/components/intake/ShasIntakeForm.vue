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
import { ContactPreferenceList, ProjectRelationshipList, YesNo } from '@/utils/constants';
import { YES_NO } from '@/utils/enums';
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
  setValues(formValues.value);
}

onBeforeMount(async () => {
  // Default form values
  initialFormValues.value = {};
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    v-slot="{ handleReset, setValues, values, errors }"
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
                  v-if="values.isDevelopedByCompanyOrOrg === YES_NO.YES"
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
                    v-if="values.developedInBC"
                    class="col-6 pl-0"
                    name="basic.registeredName"
                    :placeholder="
                      values.developedInBC === YES_NO.YES
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
                <Editor
                  class="col-12"
                  name="housing.projectDescription"
                  :disabled="!editable"
                />
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
    padding-right: 1rem;
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
