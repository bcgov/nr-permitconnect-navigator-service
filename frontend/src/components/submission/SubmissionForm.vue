<script setup lang="ts">
import { Form } from 'vee-validate';
import { number, object, string } from 'yup';

import { Calendar, Dropdown, TextArea, TextInput } from '@/components/form';
import { Button } from '@/lib/primevue';
import { ApplicationStatusList, IntakeStatusList } from '@/utils/constants';
import { formatJwtUsername } from '@/utils/formatters';

// Props
type Props = {
  editable: boolean;
  submission: any;
  submissionStatus: any;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['submit', 'cancel']);

// Default form values
const initialFormValues: any = {
  assignee: props.submissionStatus.user?.username,
  confirmationId: props.submission.confirmationId,
  contactEmail: props.submission.submission.data.contactEmail,
  contactPhoneNumber: props.submission.submission.data.contactPhoneNumber,
  contactFirstName: props.submission.submission.data.contactFirstName,
  contactLastName: props.submission.submission.data.contactLastName,
  createdAt: new Date(props.submission.createdAt),
  createdBy: formatJwtUsername(props.submission.createdBy),
  intakeStatus: props.submissionStatus.code,
  projectName: props.submission.submission.data.projectName,
  queuePriority: props.submission.submission.data.queuePriority,
  singleFamilyUnits: props.submission.submission.data.singleFamilyUnits,
  streetAddress: props.submission.submission.data.streetAddress
};

// Form validation schema
const formSchema = object({
  addedToATS: string().oneOf(['Y', 'N']).required().label('Added to ATS'),
  applicationStatus: string().oneOf(ApplicationStatusList).label('Application Status'),
  assignee: string()
    .when('intakeStatus', {
      is: (val: string) => val !== 'SUBMITTED',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired()
    })
    .label('Assignee'),
  atsClientNumber: string()
    .when('addedToATS', {
      is: 'Y',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired()
    })
    .label('ATS Client Number'),
  confirmationId: string().required().label('Confirmation ID'),
  financiallySupported: string().oneOf(['Y', 'N']).required().label('Financially Supported'),
  intakeStatus: string().oneOf(IntakeStatusList).label('Intake Status'),
  queuePriority: number()
    .required()
    .min(0)
    .integer()
    .typeError('Queue Priority must be a number')
    .label('Queue Priority'),
  updatedAai: string().oneOf(['Y', 'N']).required().label('Updated AAI Spreadsheet')
});

// Actions
const onCancel = () => {
  emit('cancel');
};

const onSubmit = (values: any) => {
  emit('submit', values);
};
</script>

<template>
  <Form
    v-slot="{ handleReset }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <TextInput
        class="col-4"
        name="confirmationId"
        label="Confirmation ID"
        :disabled="true"
      />
      <TextInput
        class="col-4"
        name="createdBy"
        label="Submitted By"
        :disabled="true"
      />
      <Calendar
        class="col-4"
        name="createdAt"
        label="Submission Date"
        :disabled="true"
      />
      <TextInput
        name="projectName"
        label="Project Name"
        :disabled="!props.editable"
        autofocus
      />
      <TextInput
        class="col-2"
        name="contactLastName"
        label="Contact Last Name"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-2"
        name="contactFirstName"
        label="Contact First Name"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="contactEmail"
        label="Contact Email"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="contactPhoneNumber"
        label="Contact Phone"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="streetAddress"
        label="Address"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="singleFamilyUnits"
        label="# of Units"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="atsClientNumber"
        label="ATS Client Number"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="addedToATS"
        label="Added to ATS *"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="financiallySupported"
        label="Financially Supported *"
        :disabled="!props.editable"
      />
      <Dropdown
        class="col-4"
        name="applicationStatus"
        label="Application Status"
        :disabled="!props.editable"
        :options="ApplicationStatusList"
      />
      <TextInput
        class="col-4"
        name="queuePriority"
        label="Queue Priority"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="relatedPermits"
        label="Related Permits"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="updatedAai"
        label="Updated AAI Spreadsheet *"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="waitingOn"
        label="Waiting On"
        :disabled="!props.editable"
      />
      <Calendar
        class="col-4"
        name="bringForwardDate"
        label="Bring Forward Date"
        :disabled="!props.editable"
      />
      <TextArea
        class="col-12"
        name="notes"
        label="Notes"
        :disabled="!props.editable"
      />
      <TextInput
        class="col-4"
        name="assignee"
        label="Assignee"
        :disabled="!props.editable"
      />
      <Dropdown
        class="col-4"
        name="intakeStatus"
        label="Intake Status"
        :disabled="!props.editable"
        :options="IntakeStatusList"
      />
      <div class="field col-12">
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
