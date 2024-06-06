<script setup lang="ts">
import { Form } from 'vee-validate';
import { onBeforeMount, ref } from 'vue';
import { boolean, number, object, string } from 'yup';

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
import { Button, Divider, useToast } from '@/lib/primevue';
import { submissionService, userService } from '@/services';
import { useSubmissionStore } from '@/store';
import {
  ApplicationStatusList,
  ContactPreferenceList,
  IntakeStatusList,
  NumResidentialUnits,
  ProjectRelationshipList,
  QueuePriority,
  Regex,
  YesNo,
  YesNoUnsure
} from '@/utils/constants';
import { BASIC_RESPONSES, INTAKE_STATUS_LIST, SUBMISSION_TYPES } from '@/utils/enums';
import { formatJwtUsername } from '@/utils/formatters';
import { applicantValidator, assignedToValidator, latitudeValidator, longitudeValidator } from '@/validators';

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
const submissionTypes: Ref<Array<string>> = ref([]);

// Form validation schema
const formSchema = object({
  queuePriority: number()
    .required()
    .integer()
    .min(0)
    .max(3)
    .typeError('Queue Priority must be a number')
    .label('Queue Priority'),
  submissionType: string()
    .required()
    .oneOf([SUBMISSION_TYPES.GUIDANCE, SUBMISSION_TYPES.INAPPLICABLE])
    .label('Submission type'),
  submittedAt: string().required().label('Submission date'),
  relatedEnquiries: string().notRequired().label('Related enquiries'),
  ...applicantValidator,
  companyNameRegistered: string().required().label('Company'),
  isDevelopedInBC: string().required().oneOf(YesNo).label('Company registered in B.C'),
  projectName: string().required().label('Project Name'),
  projectDescription: string().notRequired().label('Additional information about project'),
  singleFamilyUnits: string().notRequired().oneOf(NumResidentialUnits).label('Single family units'),
  multiFamilyUnits: string().notRequired().oneOf(NumResidentialUnits).label('Multi-family units'),
  otherUnitsDescription: string().notRequired().max(255).label('Other type'),
  otherUnits: string().when('otherUnitsDescription', {
    is: (val: string) => val === BASIC_RESPONSES.YES,
    then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Other type units'),
    otherwise: () => string().notRequired()
  }),
  hasRentalUnits: string().required().oneOf(YesNoUnsure).label('Rental included'),
  rentalUnits: string().when('hasRentalUnits', {
    is: (val: string) => val === BASIC_RESPONSES.YES,
    then: (schema) => schema.required().oneOf(NumResidentialUnits).label('Rental units'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedBC: string().required().oneOf(YesNoUnsure).label('BC Housing'),
  financiallySupportedIndigenous: string().required().oneOf(YesNoUnsure).label('Indigenous Housing Provider'),
  indigenousDescription: string().when('financiallySupportedIndigenous', {
    is: (val: string) => val === BASIC_RESPONSES.YES,
    then: (schema) => schema.required().max(255).label('Name of Indigenous Housing Provider'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedNonProfit: string().required().oneOf(YesNoUnsure).label('Non-profit housing society'),
  nonProfitDescription: string().when('financiallySupportedNonProfit', {
    is: (val: string) => val === BASIC_RESPONSES.YES,
    then: (schema) => schema.required().max(255).label('Name of Non-profit housing society'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedHousingCoop: string().required().oneOf(YesNoUnsure).label('Housing co-operative'),
  housingCoopDescription: string().when('financiallySupportedHousingCoop', {
    is: (val: string) => val === BASIC_RESPONSES.YES,
    then: (schema) => schema.required().max(255).label('Name of Housing co-operative'),
    otherwise: () => string().notRequired()
  }),
  streetAddress: string().required().max(255).label('Location address'),
  locationPIDs: string().required().max(255).label('Location PID(s)'),
  latitude: latitudeValidator,
  longitude: longitudeValidator,
  geomarkUrl: string().notRequired().max(255).label('Geomark URL'),
  naturalDisaster: string().oneOf(YesNo).required().label('Affected by natural disaster'),
  addedToATS: boolean().required().label('Authorized Tracking System (ATS) updated'),
  atsClientNumber: string().when('addedToATS', {
    is: (val: boolean) => val,
    then: (schema) => schema.required().max(255).label('ATS Client #'),
    otherwise: () => string().notRequired()
  }),
  ltsaCompleted: boolean().required().label('Land Title Survey Authority (LTSA) completed'),
  bcOnlineCompleted: boolean().required().label('BC Online completed'),
  aaiUpdated: boolean().required().label('Authorization and Approvals Insight (AAI) updated'),
  astNotes: string().notRequired().max(255).label('AST notes'),
  intakeStatus: string().oneOf(IntakeStatusList).label('Intake state'),
  user: assignedToValidator('intakeStatus', INTAKE_STATUS_LIST.SUBMITTED),
  applicationStatus: string().oneOf(ApplicationStatusList).label('Activity state'),
  waitingOn: string().notRequired().max(255).label('waiting on')
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

  submissionTypes.value = [SUBMISSION_TYPES.GUIDANCE, SUBMISSION_TYPES.INAPPLICABLE];
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    v-slot="{ handleReset, values }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @submit="onSubmit"
  >
    <div class="formgrid grid">
      <Dropdown
        class="col-3"
        name="queuePriority"
        label="Priority"
        :disabled="!editable"
        :options="QueuePriority"
      />
      <Dropdown
        class="col-3"
        name="submissionType"
        label="Submission type"
        :disabled="!editable"
        :options="submissionTypes"
      />
      <Calendar
        class="col-3"
        name="submittedAt"
        label="Submission date"
        :disabled="true"
      />
      <InputText
        class="col-3"
        name="relatedEnquiries"
        label="Related enquiries"
        :disabled="true"
      />

      <div class="col-12 mb-3">
        <div class="flex">
          <h4 class="flex-none flex align-items-center m-0">Basic information</h4>
          <Divider class="flex-grow-1 flex ml-4" />
        </div>
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
      <InputText
        class="col-3"
        name="companyNameRegistered"
        label="Company"
        :disabled="!editable"
      />
      <Dropdown
        class="col-3"
        name="isDevelopedInBC"
        label="Company registered in B.C?"
        :disabled="!editable"
        :options="YesNo"
      />
      <Dropdown
        class="col-3"
        name="contactApplicantRelationship"
        label="Relationship to project"
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
        label="Contact phone"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="contactEmail"
        label="Contact email"
        :disabled="!editable"
      />

      <div class="col-12 mb-3">
        <div class="flex">
          <h4 class="flex-none flex align-items-center m-0">Housing</h4>
          <Divider class="flex-grow-1 flex ml-4" />
        </div>
      </div>

      <InputText
        class="col-3"
        name="projectName"
        label="Project name"
        :disabled="!editable"
      />
      <div class="col-9" />
      <TextArea
        class="col-12"
        name="projectDescription"
        label="Additional information about project"
        :disabled="!editable"
      />
      <Dropdown
        class="col-3"
        name="singleFamilyUnits"
        label="Single family units"
        :disabled="!editable"
        :options="NumResidentialUnits"
      />
      <Dropdown
        class="col-3"
        name="multiFamilyUnits"
        label="Multi-family units"
        :disabled="!editable"
        :options="NumResidentialUnits"
      />
      <InputText
        class="col-3"
        name="otherUnitsDescription"
        label="Other type"
        :disabled="!editable"
      />
      <Dropdown
        class="col-3"
        name="otherUnits"
        label="Other type units"
        :disabled="!editable || !values.otherUnitsDescription"
        :options="NumResidentialUnits"
      />
      <Dropdown
        class="col-3"
        name="hasRentalUnits"
        label="Rental included?"
        :disabled="!editable"
        :options="YesNoUnsure"
      />
      <Dropdown
        class="col-3"
        name="rentalUnits"
        label="Rental units"
        :disabled="!editable || values.hasRentalUnits !== BASIC_RESPONSES.YES"
        :options="NumResidentialUnits"
      />

      <div class="col-12 mb-3">
        <div class="flex">
          <h4 class="flex-none flex align-items-center m-0">Financially supported</h4>
          <Divider class="flex-grow-1 flex ml-4" />
        </div>
      </div>

      <Dropdown
        class="col-3"
        name="financiallySupportedBC"
        label="BC Housing"
        :disabled="!editable"
        :options="YesNoUnsure"
      />
      <div class="col-9" />
      <Dropdown
        class="col-3"
        name="financiallySupportedIndigenous"
        label="Indigenous Housing Provider"
        :disabled="!editable"
        :options="YesNoUnsure"
      />
      <InputText
        class="col-3"
        name="indigenousDescription"
        label="Name of Indigenous Housing Provider"
        :disabled="!editable || values.financiallySupportedIndigenous !== BASIC_RESPONSES.YES"
      />
      <div class="col-6" />
      <Dropdown
        class="col-3"
        name="financiallySupportedNonProfit"
        label="Non-profit housing society"
        :disabled="!editable"
        :options="YesNoUnsure"
      />
      <InputText
        class="col-3"
        name="nonProfitDescription"
        label="Name of Non-profit housing society"
        :disabled="!editable || values.financiallySupportedNonProfit !== BASIC_RESPONSES.YES"
      />
      <div class="col-6" />
      <Dropdown
        class="col-3"
        name="financiallySupportedHousingCoop"
        label="Housing co-operative"
        :disabled="!editable"
        :options="YesNoUnsure"
      />
      <InputText
        class="col-3"
        name="housingCoopDescription"
        label="Name of Housing co-operative"
        :disabled="!editable || values.financiallySupportedHousingCoop !== BASIC_RESPONSES.YES"
      />
      <div class="col-6" />

      <div class="col-12 mb-3">
        <div class="flex">
          <h4 class="flex-none flex align-items-center m-0">Location</h4>
          <Divider class="flex-grow-1 flex ml-4" />
        </div>
      </div>

      <InputText
        class="col-3"
        name="streetAddress"
        label="Location address"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="locationPIDs"
        label="Location PID(s)"
        :disabled="!editable"
      />
      <InputNumber
        class="col-3"
        name="latitude"
        label="Location latitude"
        help-text="Optionally provide a number between 48 and 60"
        :disabled="!editable"
      />
      <InputNumber
        class="col-3"
        name="longitude"
        label="Location longitude"
        help-text="Optionally provide a number between -114 and -139"
        :disabled="!editable"
      />
      <InputText
        class="col-3"
        name="geomarkUrl"
        label="Geomark URL"
        :disabled="!editable"
      />
      <Dropdown
        class="col-3"
        name="naturalDisaster"
        label="Affected by natural disaster?"
        :disabled="!editable"
        :options="YesNo"
      />
      <div class="col-6" />

      <div class="col-12 mb-3">
        <div class="flex">
          <h4 class="flex-none flex align-items-center m-0">Other</h4>
          <Divider class="flex-grow-1 flex ml-4" />
        </div>
      </div>

      <Checkbox
        class="col-12"
        name="addedToATS"
        label="Authorized Tracking System (ATS) updated"
        :disabled="!editable"
        :bold="true"
      />

      <div
        v-if="values.addedToATS"
        class="w-full"
      >
        <InputText
          class="col-3"
          name="atsClientNumber"
          label="ATS Client #"
          :disabled="!editable"
        />
        <div class="col-9" />
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
        name="aaiUpdated"
        label="Authorization and Approvals Insight (AAI) updated"
        :disabled="!editable"
      />
      <TextArea
        class="col-12"
        name="astNotes"
        label="AST notes"
        :disabled="!editable"
      />

      <div class="col-12 mb-3">
        <div class="flex">
          <h4 class="flex-none flex align-items-center m-0">Submission state</h4>
          <Divider class="flex-grow-1 flex ml-4" />
        </div>
      </div>

      <Dropdown
        class="col-3"
        name="intakeStatus"
        label="Intake state"
        :disabled="!editable"
        :options="IntakeStatusList"
      />
      <EditableDropdown
        class="col-3"
        name="user"
        label="Assigned to"
        :disabled="!editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Dropdown
        class="col-3"
        name="applicationStatus"
        label="Activity state"
        :disabled="!editable"
        :options="ApplicationStatusList"
      />
      <InputText
        class="col-3"
        name="waitingOn"
        label="Waiting on"
        :disabled="!editable"
      />

      <div
        v-if="props.editable"
        class="field col-12 mt-5"
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
