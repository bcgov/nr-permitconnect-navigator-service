<script setup lang="ts">
import { ErrorMessage, Form } from 'vee-validate';
import { onBeforeMount, ref } from 'vue';
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
import { Button, useToast } from '@/lib/primevue';
import { submissionService, userService } from '@/services';
import { useSubmissionStore } from '@/store';
import {
  ApplicationStatusList,
  ContactPreferenceList,
  IntakeStatusList,
  QueuePriority,
  Regex,
  RentalStatusList
} from '@/utils/constants';
import { INTAKE_STATUS_LIST } from '@/utils/enums';
import { formatJwtUsername } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Submission, User } from '@/types';

// Props
type Props = {
  editable?: boolean;
  submission: Submission;
};

const props = withDefaults(defineProps<Props>(), {
  editable: true
});

// Store
const submissionStore = useSubmissionStore();

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const editable: Ref<boolean> = ref(props.editable);
const initialFormValues: Ref<any | undefined> = ref(undefined);

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
  activityId: string().required().label('Activity ID'),
  contactEmail: string().required().email().label('Contact Email'),
  intakeStatus: string().oneOf(IntakeStatusList).label('Intake state'),
  companyNameRegistered: string().notRequired().label('Company'),
  isRentalUnit: string().oneOf(RentalStatusList).label('Rental units'),
  latitude: number().notRequired().min(48).max(60).label('Latitude'),
  longitude: number().notRequired().min(-139).max(-114).label('Longitude'),
  projectName: string().notRequired().label('Project Name'),
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
    .test('at-least-one-true', 'At least one submission type must be selected', (input) => {
      return Object.values(input).some((value) => value);
    })
    .label('Submission Types'),
  user: mixed()
    .when('intakeStatus', {
      is: (val: string) => val === INTAKE_STATUS_LIST.SUBMITTED,
      then: (schema) =>
        schema
          .test('expect-user-or-empty', 'Assigned to must be empty or a selected user', (obj) => {
            if (typeof obj === 'object') return true;
            if (typeof obj === 'string') {
              return obj === null || obj === undefined || obj.length === 0;
            }
          })
          .nullable(),
      otherwise: (schema) =>
        schema.test('expect-user', 'Assigned to must be a selected user', (obj) => {
          return typeof obj === 'object';
        })
    })
    .label('Assigned to')
});

// Actions
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

const onSubmit = async (values: any) => {
  editable.value = false;

  // Ensure child values are reset if parent not set
  if (!values.addedToATS) {
    values.atsClientNumber = undefined;
  }

  if (!values.financiallySupported) {
    values.financiallySupportedBC = false;
    values.financiallySupportedIndigenous = false;
    values.financiallySupportedNonProfit = false;
    values.financiallySupportedHousingCoop = false;
  }

  const submissionDataTransform = {
    ...values,
    assignedUserId: values.user?.userId ?? undefined,
    ...values.submissionTypes
  };

  delete submissionDataTransform.submissionTypes;
  delete submissionDataTransform.user;

  try {
    const submissionData = {
      ...submissionDataTransform
    };
    await submissionService.updateSubmission(submissionData.submissionId, submissionData);

    submissionStore.setSubmission(submissionData);

    toast.success('Form saved');
  } catch (e: any) {
    toast.error('Failed to save submission', e.message);
  } finally {
    editable.value = true;
  }
};

onBeforeMount(async () => {
  assigneeOptions.value = (await userService.searchUsers({ userId: [props.submission.assignedUserId] })).data;

  // Default form values
  initialFormValues.value = {
    ...props.submission,
    applicationStatus: props.submission.applicationStatus,
    submittedAt: new Date(props.submission.submittedAt),
    submittedBy: formatJwtUsername(props.submission.submittedBy),
    submissionTypes: {
      emergencyAssist: props.submission.emergencyAssist,
      guidance: props.submission.guidance,
      inapplicable: props.submission.inapplicable,
      inquiry: props.submission.inquiry,
      statusRequest: props.submission.statusRequest
    },
    activityId: props.submission.activityId,
    user: assigneeOptions.value[0] ?? null
  };
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    v-slot="{ handleReset, values, errors }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <InputText
        class="col-4"
        name="activityId"
        label="Activity"
        :disabled="true"
      />
      <InputText
        class="col-4"
        name="projectName"
        label="Project Name"
        :disabled="!editable"
      />
      <Calendar
        class="col-4"
        name="submittedAt"
        label="Submission date"
        :disabled="true"
      />
      <InputText
        class="col-3"
        name="contactName"
        label="Contact"
        :disabled="!editable"
      />
      <InputMask
        class="col-3"
        name="contactPhoneNumber"
        mask="(999) 999-9999"
        label="Contact phone"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactEmail"
        label="Contact email"
        :disabled="!editable"
      />
      <Dropdown
        class="col-3"
        name="contactPreference"
        label="Preferred contact method"
        :disabled="!editable"
        :options="ContactPreferenceList"
      />
      <InputText
        class="col-6"
        name="contactApplicantRelationship"
        label="Relationship to activity"
        :disabled="!editable"
      />
      <InputText
        class="col-6"
        name="companyNameRegistered"
        label="Company"
        :disabled="!editable"
      />
      <TextArea
        class="col-12"
        name="projectDescription"
        label="Activity information"
        :disabled="!editable"
      />
      <InputText
        class="col-4"
        name="locationPIDs"
        label="Location PID(s)"
        :disabled="!editable"
        autofocus
      />
      <InputNumber
        class="col-4"
        name="latitude"
        label="Location latitude"
        help-text="Optionally provide a number between 48 and 60"
        :disabled="!editable"
      />
      <InputNumber
        class="col-4"
        name="longitude"
        label="Location longitude"
        help-text="Optionally provide a number between -114 and -139"
        :disabled="!editable"
      />
      <InputText
        class="col-4"
        name="streetAddress"
        label="Location address"
        :disabled="!editable"
      />
      <InputText
        class="col-4"
        name="singleFamilyUnits"
        label="Units"
        :disabled="!editable"
      />
      <Dropdown
        class="col-4"
        name="hasRentalUnits"
        label="Rental units"
        :disabled="!editable"
        :options="RentalStatusList"
      />
      <Dropdown
        class="col-2"
        name="queuePriority"
        label="Priority"
        :disabled="!editable"
        :options="QueuePriority"
      />
      <div class="col" />
      <TextArea
        class="col-12"
        name="astNotes"
        label="AST notes"
        :disabled="!editable"
      />
      <div class="col-6 p-0">
        <Checkbox
          class="col-12"
          name="astUpdated"
          label="Automated Status Tool (AST)"
          :disabled="!editable"
        />
        <Checkbox
          class="col-12"
          name="addedToATS"
          label="Authorized Tracking System (ATS) updated"
          :disabled="!editable"
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
              :disabled="!editable"
            />
          </div>
        </div>
        <Checkbox
          class="col-12"
          name="ltsaCompleted"
          label="Land Title Survey Authority (LTSA) completed"
          :disabled="!editable"
        />
        <Checkbox
          class="col-12"
          name="bcOnlineCompleted"
          label="BC Online completed"
          :disabled="!editable"
        />
        <Checkbox
          class="col-12"
          name="naturalDisaster"
          label="Location affected by natural disaster"
          :disabled="!editable"
        />
        <Checkbox
          class="col-12"
          name="financiallySupported"
          label="Financially supported"
          :disabled="!editable"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedBC"
          label="BC Housing"
          :disabled="!editable"
          :bold="false"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedIndigenous"
          label="Indigenous Housing Provider"
          :disabled="!editable"
          :bold="false"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedNonProfit"
          label="Non-profit housing society"
          :disabled="!editable"
          :bold="false"
        />
        <Checkbox
          v-if="values.financiallySupported"
          class="pl-4 col-12"
          name="financiallySupportedHousingCoop"
          label="Housing co-operative"
          :disabled="!editable"
          :bold="false"
        />
        <Checkbox
          class="col-12"
          name="aaiUpdated"
          label="Authorization and Approvals Insight (AAI) updated"
          :disabled="!editable"
        />
      </div>
      <div class="col-6 p-0">
        <h4 class="col-12">Submission Types:</h4>
        <Checkbox
          class="col-12"
          name="submissionTypes.guidance"
          label="Guidance"
          :disabled="!editable"
          :invalid="props.editable && !!errors.submissionTypes"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.inquiry"
          label="General Enquiry"
          :disabled="!editable"
          :invalid="props.editable && !!errors.submissionTypes"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.statusRequest"
          label="Status Request"
          :disabled="!editable"
          :invalid="props.editable && !!errors.submissionTypes"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.emergencyAssist"
          label="Escalation Request"
          :disabled="!editable"
          :invalid="props.editable && !!errors.submissionTypes"
        />
        <Checkbox
          class="col-12"
          name="submissionTypes.inapplicable"
          label="Inapplicable"
          :disabled="!editable"
          :invalid="props.editable && !!errors.submissionTypes"
        />
        <div
          v-if="props.editable"
          class="col-12 mb-3"
        >
          <ErrorMessage name="submissionTypes" />
        </div>
      </div>
      <InputText
        class="col-4"
        name="waitingOn"
        label="Waiting on"
        :disabled="!editable"
      />
      <div class="col-8" />
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
      <div
        v-if="props.editable"
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
    </div>
  </Form>
</template>

<style scoped lang="scss">
.client-number {
  margin-top: 8px;
}
</style>