<script setup lang="ts">
import { ErrorMessage, Form, useField } from 'vee-validate';
import { onBeforeMount, ref, toRaw, toRefs } from 'vue';
import { boolean, mixed, number, object, string } from 'yup';

import {
  Calendar,
  Checkbox,
  Dropdown,
  EditableDropdown,
  InputMask,
  InputNumber,
  RadioList,
  InputText,
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
          <Button
            class="p-button-text"
            @click="onStepChange(values, setValues, clickCallback)"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-user"
            />
            Basic info
          </Button>
        </template>
        <template #content="{ nextCallback }">
          <Card>
            <template #title>
              Applicant Info
              <Divider type="solid" />
            </template>
            <template #content>
              <div class="formgrid grid">
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
              Is this project being developed by a business, company, or organization?
              <Divider type="solid" />
            </template>
            <template #content>
              <div class="formgrid grid">
                <RadioList
                  class="col-12"
                  name="isDevelopedByCompanyOrOrg"
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
                    name="developedInBC"
                    :bold="false"
                    :disabled="!editable"
                    :options="YesNo"
                  />
                  <InputText
                    v-if="values.developedInBC"
                    class="col-6 pl-0"
                    name="registeredName"
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

          <!-- Step navigation -->
          <div class="flex pt-4 justify-content-between">
            <Button
              outlined
              icon="pi pi-arrow-left"
              disabled
            />
            <Button
              class="p-button-sm"
              outlined
              label="Save draft"
              type="submit"
              :disabled="!editable"
            />
            <Button
              outlined
              icon="pi pi-arrow-right"
              icon-pos="right"
              @click="onStepChange(values, setValues, nextCallback)"
            />
          </div>
        </template>
      </StepperPanel>

      <!--
      Housing
      -->
      <StepperPanel>
        <template #header="{ index, clickCallback }">
          <Button
            class="p-button-text"
            @click="onStepChange(values, setValues, clickCallback)"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-house"
            />
            Housing
          </Button>
        </template>
        <template #content="{ prevCallback, nextCallback }">
          Some content

          <!-- Step navigation -->
          <div class="flex pt-4 justify-content-between">
            <Button
              outlined
              icon="pi pi-arrow-left"
              @click="onStepChange(values, setValues, prevCallback)"
            />
            <Button
              class="p-button-sm"
              outlined
              label="Save draft"
              type="submit"
              :disabled="!editable"
            />
            <Button
              outlined
              icon="pi pi-arrow-right"
              icon-pos="right"
              @click="onStepChange(values, setValues, nextCallback)"
            />
          </div>
        </template>
      </StepperPanel>

      <!--
      Location
      -->
      <StepperPanel>
        <template #header="{ index, clickCallback }">
          <Button
            class="p-button-text"
            @click="onStepChange(values, setValues, clickCallback)"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-location-dot"
            />
            Location
          </Button>
        </template>
        <template #content="{ prevCallback, nextCallback }">
          Some content

          <!-- Step navigation -->
          <div class="flex pt-4 justify-content-between">
            <Button
              outlined
              icon="pi pi-arrow-left"
              @click="onStepChange(values, setValues, prevCallback)"
            />
            <Button
              class="p-button-sm"
              outlined
              label="Save draft"
              type="submit"
              :disabled="!editable"
            />
            <Button
              outlined
              icon="pi pi-arrow-right"
              icon-pos="right"
              @click="onStepChange(values, setValues, nextCallback)"
            />
          </div>
        </template>
      </StepperPanel>

      <!--
      Permits & Reports
      -->
      <StepperPanel>
        <template #header="{ index, clickCallback }">
          <Button
            class="p-button-text"
            @click="onStepChange(values, setValues, clickCallback)"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-file"
            />
            Permits & Reports
          </Button>
        </template>
        <template #content="{ prevCallback }">
          Some content

          <!-- Step navigation -->
          <div class="flex pt-4 justify-content-between">
            <Button
              outlined
              icon="pi pi-arrow-left"
              @click="onStepChange(values, setValues, prevCallback)"
            />
            <Button
              class="p-button-sm"
              outlined
              label="Save draft"
              type="submit"
              :disabled="!editable"
            />
            <Button
              outlined
              icon="pi pi-arrow-right"
              icon-pos="right"
              disabled
            />
          </div>
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
  border-style: solid;
  border-width: 1px;
  margin-bottom: 1rem;

  :deep(.p-card-title) {
    font-size: 1rem;
  }

  :deep(.p-card-content) {
    padding-bottom: 0;
  }
}
</style>
