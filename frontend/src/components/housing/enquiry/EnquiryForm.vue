<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, onMounted, ref } from 'vue';
import { date, mixed, object, string } from 'yup';

import {
  CancelButton,
  DatePicker,
  EditableSelect,
  FormNavigationGuard,
  InputMask,
  InputText,
  Select,
  SectionHeader,
  TextArea
} from '@/components/form';
import { Button, Message, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService, submissionService, userService } from '@/services';
import { useEnquiryStore } from '@/store';
import { BasicResponse, Regex } from '@/utils/enums/application';
import { ApplicationStatus, IntakeStatus } from '@/utils/enums/housing';
import {
  APPLICATION_STATUS_LIST,
  CONTACT_PREFERENCE_LIST,
  ENQUIRY_TYPE_LIST,
  INTAKE_STATUS_LIST,
  PROJECT_RELATIONSHIP_LIST
} from '@/utils/constants/housing';
import { omit, setEmptyStringsToNull } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Enquiry, User } from '@/types';

// Interfaces
interface EnquiryForm extends Enquiry {
  user?: User;
}

// Props
const { editable = true, enquiry } = defineProps<{
  editable?: boolean;
  enquiry: any;
}>();

// Emit
const emit = defineEmits(['enquiryForm:saved']);

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const filteredProjectActivityIds: Ref<Array<string>> = ref([]);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const projectActivityIds: Ref<Array<string>> = ref([]);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const showCancelMessage: Ref<boolean> = ref(false);

// Form validation schema
const stringRequiredSchema = string().required().max(255);

const intakeSchema = object({
  enquiryType: string().oneOf(ENQUIRY_TYPE_LIST).label('Submission type'),
  submittedAt: date().required().label('Submission date'),
  relatedActivityId: string().nullable().min(0).max(255).label('Related submission'),
  contactFirstName: stringRequiredSchema.label('First name'),
  contactLastName: stringRequiredSchema.label('Last name'),
  contactApplicantRelationship: string().required().oneOf(PROJECT_RELATIONSHIP_LIST).label('Relationship to project'),
  contactPreference: string().required().oneOf(CONTACT_PREFERENCE_LIST).label('Contact Preference'),
  contactPhoneNumber: stringRequiredSchema.label('Phone number'),
  contactEmail: string().matches(new RegExp(Regex.EMAIL), 'Email must be valid').required().label('Email'),
  enquiryDescription: string().required().label('Enquiry detail'),
  intakeStatus: string().oneOf(INTAKE_STATUS_LIST).label('Intake state'),
  user: mixed()
    .nullable()
    .when('intakeStatus', {
      is: (val: string) => val === IntakeStatus.SUBMITTED,
      then: (schema) =>
        schema
          .test('expect-user-or-empty', 'Assigned to must be empty or a selected user', (obj) => {
            if (obj == null || (obj as User)?.userId || (typeof obj == 'string' && obj.length === 0)) return true;
          })
          .nullable(),
      otherwise: (schema) =>
        schema.test('expect-user', 'Assigned to must be a selected user', (obj) => {
          return obj !== null && !!(obj as User)?.userId;
        })
    })
    .label('Assigned to'),
  applicationStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Activity state'),
  waitingOn: string().notRequired().max(255).label('waiting on')
});

// Actions
const confirm = useConfirm();
const enquiryStore = useEnquiryStore();
const toast = useToast();

const getAssigneeOptionLabel = (e: User) => {
  return `${e.fullName} [${e.email}]`;
};

const isCompleted = computed(() => {
  return enquiry.enquiryStatus === ApplicationStatus.COMPLETED;
});

const onAssigneeInput = async (e: IInputEvent) => {
  const input = e.target.value;

  if (input.length >= 3) {
    assigneeOptions.value = (await userService.searchUsers({ email: input, fullName: input })).data;
  } else if (input.match(Regex.EMAIL)) {
    assigneeOptions.value = (await userService.searchUsers({ email: input })).data;
  } else {
    assigneeOptions.value = [];
  }
};

function onCancel() {
  formRef.value?.resetForm();
  showCancelMessage.value = true;

  setTimeout(() => {
    document.getElementById('cancelMessage')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
  setTimeout(() => {
    showCancelMessage.value = false;
  }, 6000);
}

function onInvalidSubmit(e: any) {
  const errors = Object.keys(e.errors);

  // Scrolls to the top-most error
  let first: Element | null = null;

  for (let error of errors) {
    const el = document.querySelector(`[name="${error}"]`);
    const rect = el?.getBoundingClientRect();

    if (rect) {
      if (!first) first = el;
      else if (rect.top < first.getBoundingClientRect().top) first = el;
    }
  }

  first?.scrollIntoView({ behavior: 'smooth' });
}

function onRelatedActivityInput(e: IInputEvent) {
  filteredProjectActivityIds.value = projectActivityIds.value.filter((id) =>
    id.toUpperCase().includes(e.target.value.toUpperCase())
  );
}

function onReOpen() {
  confirm.require({
    message: 'Please confirm that you want to re-open this enquiry',
    header: 'Re-open enquiry?',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => {
      formRef.value?.setFieldValue('enquiryStatus', ApplicationStatus.IN_PROGRESS);
      onSubmit(formRef.value?.values);
    }
  });
}

const onSubmit = async (values: any) => {
  try {
    const submitData: Enquiry = omit(setEmptyStringsToNull(values) as EnquiryForm, ['user']);
    submitData.assignedUserId = values.user?.userId ?? undefined;
    submitData.isRelated = submitData.relatedActivityId ? BasicResponse.YES : BasicResponse.NO;

    const result = await enquiryService.updateEnquiry(values.enquiryId, submitData);
    enquiryStore.setEnquiry(result.data);
    formRef.value?.resetForm({
      values: {
        ...submitData,
        submittedAt: new Date(submitData.submittedAt),
        user: values.user
      }
    });
    emit('enquiryForm:saved');

    toast.success('Form saved');
  } catch (e: any) {
    toast.error('Failed to save enquiry', e);
  }
};

onMounted(async () => {
  if (enquiry?.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [enquiry.assignedUserId] })).data;
  }
  initialFormValues.value = {
    ...enquiry,
    submittedAt: new Date(enquiry?.submittedAt),
    user: assigneeOptions.value[0] ?? null
  };
  projectActivityIds.value = filteredProjectActivityIds.value = (await submissionService.getActivityIds()).data;
});
</script>

<template>
  <Message
    v-if="showCancelMessage"
    id="cancelMessage"
    severity="warn"
    :closable="false"
    :life="5500"
  >
    Your changes have not been saved.
  </Message>
  <Form
    v-if="initialFormValues"
    ref="formRef"
    :validation-schema="intakeSchema"
    :initial-values="initialFormValues"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard v-if="!isCompleted" />

    <div class="formgrid grid">
      <Select
        class="col-3"
        name="enquiryType"
        label="Submission type"
        :disabled="!editable"
        :options="ENQUIRY_TYPE_LIST"
      />
      <DatePicker
        class="col-3"
        name="submittedAt"
        label="Submission date"
        :disabled="!editable"
      />
      <EditableSelect
        class="col-3"
        name="relatedActivityId"
        label="Related submission"
        :disabled="!editable"
        :options="filteredProjectActivityIds"
        :get-option-label="(e: string) => e"
        @on-input="onRelatedActivityInput"
      />
      <div class="col-3" />

      <SectionHeader title="Basic information" />

      <InputText
        class="col-3"
        name="contactFirstName"
        label="First name"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactLastName"
        label="Last name"
        :disabled="!editable"
      />
      <Select
        class="col-3"
        name="contactApplicantRelationship"
        label="Relationship to activity"
        :disabled="!editable"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Select
        class="col-3"
        name="contactPreference"
        label="Preferred contact method"
        :disabled="!editable"
        :options="CONTACT_PREFERENCE_LIST"
      />
      <InputMask
        class="col-3"
        name="contactPhoneNumber"
        mask="(999) 999-9999"
        label="Phone number"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactEmail"
        label="Contact email"
        :disabled="!editable"
      />

      <SectionHeader title="Enquiry detail" />

      <TextArea
        class="col-12"
        name="enquiryDescription"
        label=""
        :disabled="!editable"
      />

      <SectionHeader title="Submission state" />

      <Select
        class="col-3"
        name="intakeStatus"
        label="Intake state"
        :disabled="!editable"
        :options="INTAKE_STATUS_LIST"
      />
      <EditableSelect
        class="col-3"
        name="user"
        label="Assigned to"
        :disabled="!editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Select
        class="col-3"
        name="enquiryStatus"
        label="Activity state"
        :disabled="!editable"
        :options="APPLICATION_STATUS_LIST"
      />
      <InputText
        class="col-3"
        name="waitingOn"
        label="Waiting on"
        :disabled="!editable"
      />

      <div class="field col-12 mt-5">
        <Button
          v-if="!isCompleted"
          label="Save"
          type="submit"
          icon="pi pi-check"
          :disabled="!editable"
        />
        <CancelButton
          v-if="!isCompleted"
          :editable="editable"
          @clicked="onCancel"
        />
        <Button
          v-if="isCompleted"
          label="Re-open enquiry"
          icon="pi pi-check"
          @click="onReOpen()"
        />
      </div>
    </div>
  </Form>
</template>
