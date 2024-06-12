<script setup lang="ts">
import { Form } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { array, boolean, mixed, number, object, string } from 'yup';

import { Dropdown, EditableDropdown, InputText, TextArea } from '@/components/form';
import { Button, useToast } from '@/lib/primevue';
import { formatDate } from '@/utils/formatters';
import { enquiryService, userService } from '@/services';
import { useEnquiryStore } from '@/store';

import { ContactPreferenceList, IntakeStatusList, ProjectRelationshipList, Regex } from '@/utils/constants';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { User } from '@/types';

// Constants (MOVE TO REFACTOR ENUMS AFTER REBASE)
enum ENQUIRY_TYPES {
  GENERAL_ENQUIRY = 'General enquiry',
  STATUS_REQUEST = 'Status request',
  ESCALATION_REQUEST = 'Escalation request',
  INAPPLICABLE = 'Inapplicable'
}

// Props
type Props = {
  enquiry: any;
};

const props = withDefaults(defineProps<Props>(), {});

// Form validation schema
// const YesNoUnsureSchema = string().required().oneOf(YesNoUnsure);
const stringRequiredSchema = string().required().max(255);

const intakeSchema = object({
  contactFirstName: stringRequiredSchema.label('First name'),
  contactLastName: stringRequiredSchema.label('Last name'),
  contactPhoneNumber: stringRequiredSchema.label('Phone number'),
  contactEmail: string().matches(new RegExp(Regex.EMAIL), 'Email must be valid').required().label('Email'),
  contactApplicantRelationship: string().required().oneOf(ProjectRelationshipList).label('Relationship to project'),
  contactPreference: string().required().oneOf(ContactPreferenceList).label('Contact Preference'),
  intakeStatus: string().oneOf(IntakeStatusList).label('Intake state')
});

// State

const assigneeOptions: Ref<Array<User>> = ref([]);
const editable: Ref<boolean> = ref(true);
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);

// Actions
const enquiryStore = useEnquiryStore();
const toast = useToast();

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

const onSubmit = async (data: any) => {
  editable.value = false;

  const enquiryData = Object.assign({}, data);
  enquiryData['assignedUserId'] = enquiryData.assignedUserId?.userId ?? undefined;
  delete enquiryData['user'];

  try {
    const result = await enquiryService.updateEnquiry(data.enquiryId, { ...enquiryData });
    enquiryStore.setEnquiry(result.data);

    toast.success('Form saved');
  } catch (e: any) {
    toast.error('Failed to edit enquiry', e);
  } finally {
    editable.value = true;
  }
};

onMounted(async () => {
  if (props.enquiry?.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [props.enquiry.assignedUserId] })).data;
  }
  initialFormValues.value = {
    ...props.enquiry,
    submittedAt: formatDate(props.enquiry?.submittedAt),
    user: assigneeOptions.value[0] ?? null
  };
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    v-slot="{ handleReset }"
    ref="formRef"
    :validation-schema="intakeSchema"
    :initial-values="initialFormValues"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <Dropdown
        class="col-3"
        name="submissionType"
        label="Submission Type"
        :bold="false"
        :disabled="!editable"
        :options="Object.values(ENQUIRY_TYPES)"
      />
      <InputText
        class="col-3"
        name="submittedAt"
        label="Submission Date"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="relatedActivityId"
        label="Related submission"
        :bold="false"
        :disabled="!editable"
      />
      <div class="col-3" />
      <div class="col-12 mb-2">Basic information</div>
      <InputText
        class="col-3"
        name="contactFirstName"
        label="First name"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactLastName"
        label="Last name"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactApplicantRelationship"
        label="Relationship to activity"
        :bold="false"
        :disabled="!editable"
      />
      <Dropdown
        class="col-3"
        name="contactPreference"
        label="Preferred contact method"
        :bold="false"
        :disabled="!editable"
        :options="ContactPreferenceList"
      />
      <InputText
        class="col-3"
        name="contactPhoneNumber"
        label="Contact phone"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactEmail"
        label="Contact email"
        :bold="false"
        :disabled="!editable"
      />
      <div class="col-6" />
      <TextArea
        class="col-12"
        name="enquiryDescription"
        label="Waiting On"
        :bold="false"
        :disabled="!editable"
      />
      <EditableDropdown
        class="col-4"
        name="user"
        label="Assigned to"
        :disabled="!editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Dropdown
        class="col-4"
        name="intakeStatus"
        label="Intake state"
        :disabled="!editable"
        :options="IntakeStatusList"
      />
    </div>
    <div class="field col-12">
      <Button
        label="Save"
        type="submit"
        icon="pi pi-check"
        :disabled="!editable"
      />
      <Button
        label="Cancel"
        outlined
        class="ml-2 p-button-danger"
        icon="pi pi-times"
        :disabled="!editable"
        @click="
          () => {
            handleReset();
          }
        "
      />
    </div>
  </Form>
</template>

<style scoped lang="scss">
.disclaimer {
  font-weight: 500;
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

:deep(.p-invalid),
:deep(.p-card.p-component:has(.p-invalid)) {
  border-color: $app-error !important;
}
</style>
