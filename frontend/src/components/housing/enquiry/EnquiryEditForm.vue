<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { onBeforeMount, ref, toRaw } from 'vue';

import { Dropdown, EditableDropdown, InputMask, RadioList, InputText, TextArea } from '@/components/form';
import { Button, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService, submissionService, userService } from '@/services';
import { useEnquiryStore } from '@/store';

import {
  ApplicationStatusList,
  ContactPreferenceList,
  IntakeStatusList,
  QueuePriority,
  Regex,
  RentalStatusList
} from '@/utils/constants';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Submission, User } from '@/types';
import { CONTACT_PREFERENCE_LIST } from '@/utils/enums';

// Props
type Props = {
  activityId?: string;
  enquiryId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  enquiryId: undefined
});

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const editable: Ref<boolean> = ref(true);
const initialFormValues: Ref<any | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const enquiryStore = useEnquiryStore();
// const router = useRouter();
const toast = useToast();

const confirmSubmit = (data: any) => {
  confirm.require({
    message: 'Are you sure you wish to submit this form? Please review the form before submitting.',
    header: 'Please confirm submission',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => onSubmit(data)
  });
};

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
  try {
    if (data.enquiryId) {
      await enquiryService.updateDraft(data.enquiryId, { ...data, submit: true });
    } else {
      await enquiryService.createDraft({ ...data, submit: true });
    }
  } catch (e: any) {
    toast.error('Failed to save intake', e);
  } finally {
    editable.value = true;
  }
};

onBeforeMount(async () => {
  // assigneeOptions.value = (await userService.searchUsers({ userId: [props.submission.assignedUserId] })).data;
  initialFormValues.value = enquiryStore.getEnquiry;
});
</script>

<template>
  <Form
    v-slot="{ handleReset }"
    :validation-schema="{}"
    :initial-values="initialFormValues"
    @submit="confirmSubmit"
  >
    <div class="formgrid grid">
      <InputText
        class="col-3"
        name="activityId"
        label="Activity"
        :bold="false"
        :disabled="true"
      />
      <Dropdown
        class="col-3"
        name="enquiryType"
        label="Enquiry Type"
        :bold="false"
        :disabled="!editable"
        :options="[]"
      />
      <InputText
        class="col-3"
        name="contactFirstName"
        label="Contact name"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="relatedActivityId"
        label="Related submission"
        :bold="false"
        :disabled="true"
      />

      <InputText
        class="col-3"
        name="contactFirstName"
        label="Contact"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactPhoneNumber"
        label="Enquiry Type"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactEmail"
        label="First name"
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
        class="col-6"
        name="relationshipToProject"
        label="Relationship to activity"
        :bold="false"
        :disabled="!editable"
      />
      <InputText
        class="col-6"
        name="waitingOn"
        label="Waiting On"
        :bold="false"
        :disabled="!editable"
      />
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
      <Dropdown
        class="col-4"
        name="applicationStatus"
        label="Activity state"
        :disabled="!editable"
        :options="ApplicationStatusList"
      />
    </div>
    <div
      v-if="editable"
      class="field col-12"
    >
      <Button
        label="Save"
        type="submit"
        icon="pi pi-check"
        :disabled="!editable"
      />
      <Button
        label="Cancel"
        outlined
        class="ml-2"
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
