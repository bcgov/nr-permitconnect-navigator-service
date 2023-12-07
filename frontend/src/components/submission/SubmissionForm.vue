<script setup lang="ts">
import { Form } from 'vee-validate';
import { number, object, string } from 'yup';

import { Dropdown, TextArea, TextInput } from '@/components/form';
import { Button } from '@/lib/primevue';

// Props
type Props = {
  editable: boolean;
  submission: any;
  submissionStatus: any;
};

const props = withDefaults(defineProps<Props>(), {});

// Emites
const emit = defineEmits(['submit', 'cancel']);

// Default form values
const initialFormValues: any = {
  assignee: props.submissionStatus.user?.username,
  confirmationId: props.submission.confirmationId,
  intakeStatus: props.submissionStatus.code,
  queuePriority: props.submission.submission.data.queuePriority
};

// Form validation schema
const formSchema = object({
  addedToATS: string().oneOf(['Y', 'N']).required().label('Added to ATS'),
  applicationStatus: string()
    .matches(/^[a-zA-Z]+$/, { excludeEmptyString: true, message: 'Application Status may only contain letters' })
    .label('Application Status'),
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
  intakeStatus: string().required().label('Intake Status'),
  queuePriority: number()
    .required()
    .min(0)
    .integer()
    .typeError('Queue Priority must be a number')
    .label('Queue Priority')
});

const intakeStatusList = ['SUBMITTED', 'ASSIGNED', 'COMPLETED'];

// Actions
const onCancel = () => {
  emit('cancel');
};

const onSubmit = (values: any) => {
  console.log(values); // eslint-disable-line no-console
  emit('submit');
};
</script>

<template>
  <div class="formgrid grid">
    <Form
      v-slot="{ handleReset }"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <TextInput
        name="confirmationId"
        label="Confirmation ID *"
        :disabled="!props.editable"
        autofocus
      />
      <TextInput
        name="atsClientNumber"
        label="ATS Client Number"
        :disabled="!props.editable"
      />
      <TextInput
        name="addedToATS"
        label="Added to ATS *"
        :disabled="!props.editable"
      />
      <TextInput
        name="financiallySupported"
        label="Financially Supported *"
        :disabled="!props.editable"
      />
      <TextInput
        name="applicationStatus"
        label="Application Status"
        :disabled="!props.editable"
      />
      <TextInput
        name="queuePriority"
        label="Queue Priority"
        :disabled="!props.editable"
      />
      <TextArea
        name="notes"
        label="Notes"
        :disabled="!props.editable"
      />
      <TextInput
        name="assignee"
        label="Assignee"
        :disabled="!props.editable"
      />
      <Dropdown
        name="intakeStatus"
        label="Intake Status *"
        :disabled="!props.editable"
        :options="intakeStatusList"
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
    </Form>
  </div>
</template>
