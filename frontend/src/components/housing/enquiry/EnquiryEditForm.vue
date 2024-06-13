<script setup lang="ts">
import { Form } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { date, mixed, object, string } from 'yup';

import { Calendar, Dropdown, EditableDropdown, InputMask, InputText, TextArea } from '@/components/form';
import { Button, Divider, useToast } from '@/lib/primevue';
import { enquiryService, userService } from '@/services';
import { useEnquiryStore } from '@/store';
import { INTAKE_STATUS_LIST } from '@/utils/enums';
import { ContactPreferenceList, IntakeStatusList, ProjectRelationshipList, Regex } from '@/utils/constants';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Enquiry, User } from '@/types';

interface EnquiryForm extends Enquiry {
  user?: User;
}

// Constants (MOVE TO REFACTOR ENUMS AFTER REBASE), IntakeStatusList as well
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
const stringRequiredSchema = string().required().max(255);

const intakeSchema = object({
  submissionType: string().oneOf(Object.values(ENQUIRY_TYPES)).label('Submission type'),
  submittedAt: date().required().label('Submission date'),
  relatedActivityId: string().nullable().min(0).max(255).label('Related submission'),
  contactFirstName: stringRequiredSchema.label('First name'),
  contactLastName: stringRequiredSchema.label('Last name'),
  contactApplicantRelationship: string().required().oneOf(ProjectRelationshipList).label('Relationship to project'),
  contactPreference: string().required().oneOf(ContactPreferenceList).label('Contact Preference'),
  contactPhoneNumber: stringRequiredSchema.label('Phone number'),
  contactEmail: string().matches(new RegExp(Regex.EMAIL), 'Email must be valid').required().label('Email'),
  enquiryDescription: string().required().label('Enquiry detail'),
  intakeStatus: string().oneOf(IntakeStatusList).label('Intake state'),
  user: mixed()
    .nullable()
    .when('intakeStatus', {
      is: (val: string) => val === INTAKE_STATUS_LIST.SUBMITTED,
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
    .label('Assigned to')
});

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const editable: Ref<boolean> = ref(true);
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

  const enquiryData: EnquiryForm = Object.assign({}, data);
  enquiryData['assignedUserId'] = enquiryData.user?.userId ?? undefined;
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
    submittedAt: new Date(props.enquiry?.submittedAt),
    user: assigneeOptions.value[0] ?? null
  };
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    ref="formRef"
    v-slot="{ handleReset }"
    :validation-schema="intakeSchema"
    :initial-values="initialFormValues"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <Dropdown
        class="col-3"
        name="submissionType"
        label="Submission type"
        :disabled="!editable"
        :options="Object.values(ENQUIRY_TYPES)"
      />
      <Calendar
        class="col-3"
        name="submittedAt"
        label="Submission date"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="relatedActivityId"
        label="Related submission"
        :disabled="!editable"
      />
      <div class="col-3" />
      <div class="col-12 mb-2 flex align-items-center">
        <div class="font-bold white-space-nowrap mr-3">Basic information</div>
        <Divider />
      </div>
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
      <Dropdown
        class="col-3"
        name="contactApplicantRelationship"
        label="Relationship to activity"
        :disabled="!editable"
        :options="ProjectRelationshipList"
      />
      <Dropdown
        class="col-3"
        name="contactPreference"
        label="Preferred contact method"
        :disabled="!editable"
        :options="ContactPreferenceList"
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
      <div class="col-12 mb-2 flex align-items-center">
        <div class="font-bold white-space-nowrap mr-3">Enquiry detail</div>
        <Divider />
      </div>
      <TextArea
        class="col-12"
        name="enquiryDescription"
        label=""
        :disabled="!editable"
      />
      <div class="col-12 mb-2 flex align-items-center">
        <div class="font-bold white-space-nowrap mr-3">Submission state</div>
        <Divider />
      </div>
      <Dropdown
        class="col-4"
        name="intakeStatus"
        label="Intake state"
        :disabled="!editable"
        :options="IntakeStatusList"
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
      <div class="col-12">
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
