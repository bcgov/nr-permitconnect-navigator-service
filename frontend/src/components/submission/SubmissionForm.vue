<script setup lang="ts">
import { ErrorMessage, Form } from 'vee-validate';
import { ref } from 'vue';
import { boolean, mixed, number, object, string } from 'yup';

import {
  Calendar,
  Checkbox,
  Dropdown,
  EditableDropdown,
  InputMask,
  InputNumber,
  InputText,
  TextArea
} from '@/components/form';
import { Button, Divider } from '@/lib/primevue';
import { userService } from '@/services';
import { ApplicationStatusList, IntakeStatusList, QueuePriority, Regex } from '@/utils/constants';
import { formatJwtUsername } from '@/utils/formatters';

import type { IInputEvent } from '@/interfaces';
import type { User } from '@/types';
import type { Ref } from 'vue';

// Props
type Props = {
  editable: boolean;
  submission: any;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['submit', 'cancel']);

// State
const assigneeOptions: Ref<Array<User>> = ref([props.submission.user]);

// Default form values
const initialFormValues: any = {
  ...props.submission,
  applicationStatus: props.submission.applicationStatus,
  bringForwardDate: props.submission.bringForwardDate ? new Date(props.submission.bringForwardDate) : undefined,
  submittedAt: new Date(props.submission.submittedAt),
  submittedBy: formatJwtUsername(props.submission.submittedBy),
  submissionTypes: {
    emergencyAssist: props.submission.emergencyAssist,
    guidance: props.submission.guidance,
    inapplicable: props.submission.inapplicable,
    inquiry: props.submission.inquiry,
    statusRequest: props.submission.statusRequest
  }
};

// Form validation schema
const formSchema = object({
  applicationStatus: string().oneOf(ApplicationStatusList).label('Activity state'),
  atsClientNumber: string()
    .when('addedToATS', {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired()
    })
    .label('ATS Client Number'),
  confirmationId: string().required().label('Confirmation ID'),
  contactEmail: string().email().label('Contact Email'),
  intakeStatus: string().oneOf(IntakeStatusList).label('Intake state'),
  latitude: number().notRequired().min(48).max(60).label('Latitude'),
  longitude: number().notRequired().min(-139).max(-114).label('Longitude'),
  queuePriority: number()
    .required()
    .min(0)
    .integer()
    .typeError('Queue Priority must be a number')
    .label('Queue Priority'),
  submissionTypes: object({
    guidance: boolean(),
    statusRequest: boolean(),
    inquiry: boolean(),
    emergencyAssistance: boolean(),
    inapplicable: boolean()
  })
    .test('at-least-one-true', 'At least one submission type must be selected', (obj) => {
      return Object.values(obj).some((value) => value);
    })
    .label('Submission Types'),
  user: mixed()
    .when('intakeStatus', {
      is: (val: string) => val !== 'SUBMITTED',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired()
    })
    .label('Assignee')
});

// Actions
const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName} [${e.email}]`;
};

const onAssigneeInput = async (e: IInputEvent) => {
  const input = e.target.value;

  if (input.length >= 3) {
    assigneeOptions.value = (await userService.searchUsers({ email: input, fullName: input, username: input })).data;
  } else if (input.match(Regex.EMAIL)) {
    assigneeOptions.value = (await userService.searchUsers({ email: input })).data;
  } else {
    assigneeOptions.value = [];
  }
};

const onCancel = () => {
  emit('cancel');
};

const onSubmit = (values: any) => {
  // Ensure child values are reset if parent not set
  if (!values.addedToATS) {
    values.atsClientNumber = null;
  }
  if (!values.financiallySupported) {
    values.financiallySupportedBC = false;
    values.financiallySupportedIndigenous = false;
    values.financiallySupportedNonProfit = false;
    values.financiallySupportedHousingCoop = false;
  }

  const toSubmit = { ...values, ...values.submissionTypes };
  delete toSubmit.submissionTypes;

  emit('submit', toSubmit);
};
</script>

<template>
  <Form
    v-slot="{ handleReset, values }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <InputText
        class="col-4"
        name="confirmationId"
        label="Activity"
        :disabled="true"
      />
      <Calendar
        class="col-4"
        name="submittedAt"
        label="Submission date"
        :disabled="true"
      />
      <InputText
        class="col-4"
        name="locationPIDs"
        label="Location PID(s)"
        :disabled="!props.editable"
        autofocus
      />
      <InputText
        class="col-4"
        name="contactName"
        label="Contact"
        :disabled="!props.editable"
      />
      <InputMask
        class="col-4"
        name="contactPhoneNumber"
        mask="(999) 999-9999"
        label="Contact phone"
        :disabled="!props.editable"
      />
      <InputText
        class="col-4"
        name="contactEmail"
        label="Contact email"
        :disabled="!props.editable"
      />
      <InputText
        class="col-4"
        name="projectName"
        label="Company"
        :disabled="!props.editable"
      />
      <InputText
        class="col-4"
        name="singleFamilyUnits"
        label="Units"
        :disabled="!props.editable"
      />
      <div class="col-4" />
      <InputText
        class="col-4"
        name="streetAddress"
        label="Location address"
        :disabled="!props.editable"
      />
      <InputNumber
        class="col-4"
        name="latitude"
        label="Location latitude"
        help-text="Optionally provide a number between 48 and 60"
        :disabled="!props.editable"
      />
      <InputNumber
        class="col-4"
        name="longitude"
        label="Location longitude"
        help-text="Optionally provide a number between -114 and -139"
        :disabled="!props.editable"
      />
      <Dropdown
        class="col-2"
        name="queuePriority"
        label="Priority"
        :disabled="!props.editable"
        :options="QueuePriority"
      />
      <div class="col" />
      <InputText
        class="col-12"
        name="relatedPermits"
        label="Related permits"
        :disabled="!props.editable"
      />
      <TextArea
        class="col-12"
        name="astNotes"
        label="AST notes"
        :disabled="!props.editable"
      />
      <div class="col-5">
        <Checkbox
          class="col-12"
          name="astUpdated"
          label="Automated Status Tool (AST)"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="addedToATS"
          label="Authorized Tracking System (ATS) updated"
          :disabled="!props.editable"
          :bold="true"
        />
        <div
          v-if="values.addedToATS"
          class="pl-4 col-12 flex"
        >
          <div>
            <p
              class="client-number align-items-center"
              style="color: #38598a"
            >
              ATS Client #
            </p>
          </div>
          <div class="col">
            <InputText
              class="col-4 align-items-center"
              name="atsClientNumber"
              :disabled="!props.editable"
            />
          </div>
        </div>
        <Checkbox
          class="col-12"
          name="ltsaCompleted"
          label="Land Title Survey Authority (LTSA) completed"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="bcOnlineCompleted"
          label="BC Online Completed"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="naturalDisaster"
          label="Location affeced by natural disaster"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="financiallySupported"
          label="Financially supported"
          :disabled="!props.editable"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedBC"
          label="BC Housing"
          :disabled="!props.editable"
          :bold="false"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedIndigenous"
          label="Indigenous Housing Provider"
          :disabled="!props.editable"
          :bold="false"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedNonProfit"
          label="Non-profit housing society"
          :disabled="!props.editable"
          :bold="false"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedHousingCoop"
          label="Housing co-operative"
          :disabled="!props.editable"
          :bold="false"
        />
        <Checkbox
          class="col-12"
          name="aaiUpdated"
          label="Authorization and Approvals Insight (AAI) updated"
          :disabled="!props.editable"
        />
      </div>
      <div class="col-1">
        <Divider
          layout="vertical"
          style="height: 100%"
        />
      </div>
      <div class="col-5">
        <Checkbox
          class="col-12"
          name="submissionTypes.statusRequest"
          label="Submission Type: Request for status"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.emergencyAssist"
          label="Submission Type: Request for emergency assistance"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.guidance"
          label="Submission Type: Request for Guidance"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.inquiry"
          label="Submission Type: General inquiry"
          :disabled="!props.editable"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.inapplicable"
          label="Submission Type: Inapplicable"
          :disabled="!props.editable"
        />
        <div
          v-if="props.editable"
          class="col-12 mb-3"
        >
          <ErrorMessage name="submissionTypes" />
        </div>
      </div>
      <InputText
        class="col-6"
        name="waitingOn"
        label="Waiting on"
        :disabled="!props.editable"
      />
      <Calendar
        class="col-6"
        name="bringForwardDate"
        label="Bring forward date"
        :disabled="!props.editable"
      />
      <TextArea
        class="col-12"
        name="notes"
        label="Notes"
        :disabled="!props.editable"
      />
      <EditableDropdown
        class="col-4"
        name="user"
        label="Assigned to"
        :disabled="!props.editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="(e) => onAssigneeInput(e)"
      />
      <Dropdown
        class="col-4"
        name="intakeStatus"
        label="Intake state"
        :disabled="!props.editable"
        :options="IntakeStatusList"
      />
      <Dropdown
        class="col-4"
        name="applicationStatus"
        label="Activity state"
        :disabled="!props.editable"
        :options="ApplicationStatusList"
      />
      <div
        v-if="props.editable"
        class="field col-12"
      >
        <Button
          label="Save"
          type="submit"
          icon="pi pi-check"
          :disabled="!props.editable"
        />
        <Button
          label="Cancel"
          outlined
          class="ml-2"
          icon="pi pi-times"
          :disabled="!props.editable"
          @click="
            () => {
              handleReset();
              onCancel();
            }
          "
        />
      </div>
    </div>
  </Form>
</template>

<style scoped lang="scss">
.client-number {
  margin-top: 8px;
}
</style>
