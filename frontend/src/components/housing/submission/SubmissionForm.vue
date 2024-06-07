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
import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  CONTACT_PREFERENCE_LIST,
  INTAKE_STATUS_LIST,
  NUM_RESIDENTIAL_UNITS_LIST,
  PROJECT_RELATIONSHIP_LIST,
  QUEUE_PRIORITY
} from '@/utils/constants/housing';
import { BasicResponse, Regex } from '@/utils/enums/application';
import { IntakeStatus, SubmissionType } from '@/utils/enums/housing';
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
    .oneOf([SubmissionType.GUIDANCE, SubmissionType.INAPPLICABLE])
    .label('Submission type'),
  submittedAt: string().required().label('Submission date'),
  relatedEnquiries: string().notRequired().label('Related enquiries'),
  ...applicantValidator,
  companyNameRegistered: string().required().label('Company'),
  isDevelopedInBC: string().required().oneOf(YES_NO_LIST).label('Company registered in B.C'),
  projectName: string().required().label('Project Name'),
  projectDescription: string().notRequired().label('Additional information about project'),
  singleFamilyUnits: string().notRequired().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Single family units'),
  multiFamilyUnits: string().notRequired().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Multi-family units'),
  otherUnitsDescription: string().notRequired().max(255).label('Other type'),
  otherUnits: string().when('otherUnitsDescription', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Other type units'),
    otherwise: () => string().notRequired()
  }),
  hasRentalUnits: string().required().oneOf(YES_NO_UNSURE_LIST).label('Rental included'),
  rentalUnits: string().when('hasRentalUnits', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().oneOf(NUM_RESIDENTIAL_UNITS_LIST).label('Rental units'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedBC: string().required().oneOf(YES_NO_UNSURE_LIST).label('BC Housing'),
  financiallySupportedIndigenous: string().required().oneOf(YES_NO_UNSURE_LIST).label('Indigenous Housing Provider'),
  indigenousDescription: string().when('financiallySupportedIndigenous', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().max(255).label('Name of Indigenous Housing Provider'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedNonProfit: string().required().oneOf(YES_NO_UNSURE_LIST).label('Non-profit housing society'),
  nonProfitDescription: string().when('financiallySupportedNonProfit', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().max(255).label('Name of Non-profit housing society'),
    otherwise: () => string().notRequired()
  }),
  financiallySupportedHousingCoop: string().required().oneOf(YES_NO_UNSURE_LIST).label('Housing co-operative'),
  housingCoopDescription: string().when('financiallySupportedHousingCoop', {
    is: (val: string) => val === BasicResponse.YES,
    then: (schema) => schema.required().max(255).label('Name of Housing co-operative'),
    otherwise: () => string().notRequired()
  }),
  streetAddress: string().required().max(255).label('Location address'),
  locationPIDs: string().required().max(255).label('Location PID(s)'),
  latitude: latitudeValidator,
  longitude: longitudeValidator,
  geomarkUrl: string().notRequired().max(255).label('Geomark URL'),
  naturalDisaster: string().oneOf(YES_NO_LIST).required().label('Affected by natural disaster'),
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
  intakeStatus: string().oneOf(INTAKE_STATUS_LIST).label('Intake state'),
  user: assignedToValidator('intakeStatus', IntakeStatus.SUBMITTED),
  applicationStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Activity state'),
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

  try {
    const submissionData = {
      ...values,
      assignedUserId: values.user?.userId ?? undefined,
      ...values.submissionTypes
    };

    delete submissionData.user;

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
  if (props.submission.assignedUserId) {
    assigneeOptions.value = (await userService.searchUsers({ userId: [props.submission.assignedUserId] })).data;
  }

  // Default form values
  initialFormValues.value = {
    activityId: props.submission.activityId,
    submissionId: props.submission.submissionId,
    queuePriority: props.submission.queuePriority,
    submissionType: props.submission.submissionType,
    submittedAt: new Date(props.submission.submittedAt),
    relatedEnquiries: props.submission.relatedEnquiries,
    contactFirstName: props.submission.contactFirstName,
    contactLastName: props.submission.contactLastName,
    companyNameRegistered: props.submission.companyNameRegistered,
    isDevelopedInBC: props.submission.isDevelopedInBC,
    contactApplicantRelationship: props.submission.contactApplicantRelationship,
    contactPreference: props.submission.contactPreference,
    contactPhoneNumber: props.submission.contactPhoneNumber,
    contactEmail: props.submission.contactEmail,
    projectName: props.submission.projectName,
    projectDescription: props.submission.projectDescription,
    singleFamilyUnits: props.submission.singleFamilyUnits,
    multiFamilyUnits: props.submission.multiFamilyUnits,
    otherUnitsDescription: props.submission.otherUnitsDescription,
    otherUnits: props.submission.otherUnits,
    hasRentalUnits: props.submission.hasRentalUnits,
    rentalUnits: props.submission.rentalUnits,
    financiallySupportedBC: props.submission.financiallySupportedBC,
    financiallySupportedIndigenous: props.submission.financiallySupportedIndigenous,
    indigenousDescription: props.submission.indigenousDescription,
    financiallySupportedNonProfit: props.submission.financiallySupportedNonProfit,
    nonProfitDescription: props.submission.nonProfitDescription,
    financiallySupportedHousingCoop: props.submission.financiallySupportedHousingCoop,
    housingCoopDescription: props.submission.housingCoopDescription,
    streetAddress: props.submission.streetAddress,
    locationPIDs: props.submission.locationPIDs,
    latitude: props.submission.latitude,
    longitude: props.submission.longitude,
    geomarkUrl: props.submission.geomarkUrl,
    naturalDisaster: props.submission.naturalDisaster,
    addedToATS: props.submission.addedToATS,
    atsClientNumber: props.submission.atsClientNumber,
    ltsaCompleted: props.submission.ltsaCompleted,
    bcOnlineCompleted: props.submission.bcOnlineCompleted,
    aaiUpdated: props.submission.aaiUpdated,
    astNotes: props.submission.astNotes,
    intakeStatus: props.submission.intakeStatus,
    user: assigneeOptions.value[0] ?? null,
    applicationStatus: props.submission.applicationStatus,
    waitingOn: props.submission.waitingOn
  };
});
</script>

<template>
  <Form
    v-if="initialFormValues"
    v-slot="{ handleReset, setFieldValue, values }"
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
        :options="QUEUE_PRIORITY"
      />
      <Dropdown
        class="col-3"
        name="submissionType"
        label="Submission type"
        :disabled="!editable"
        :options="[SubmissionType.GUIDANCE, SubmissionType.INAPPLICABLE]"
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
        :options="YES_NO_LIST"
      />
      <Dropdown
        class="col-3"
        name="contactApplicantRelationship"
        label="Relationship to project"
        :disabled="!editable"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Dropdown
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
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Dropdown
        class="col-3"
        name="multiFamilyUnits"
        label="Multi-family units"
        :disabled="!editable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <InputText
        class="col-3"
        name="otherUnitsDescription"
        label="Other type"
        :disabled="!editable"
        @on-change="
          (e) => {
            if (!e.target.value) {
              setFieldValue('otherUnitsDescription', null);
              setFieldValue('otherUnits', null);
            }
          }
        "
      />
      <Dropdown
        class="col-3"
        name="otherUnits"
        label="Other type units"
        :disabled="!editable || !values.otherUnitsDescription"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Dropdown
        class="col-3"
        name="hasRentalUnits"
        label="Rental included?"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e) => {
            if (e.value !== BasicResponse.YES) setFieldValue('rentalUnits', null);
          }
        "
      />
      <Dropdown
        class="col-3"
        name="rentalUnits"
        label="Rental units"
        :disabled="!editable || values.hasRentalUnits !== BasicResponse.YES"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
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
        :options="YES_NO_UNSURE_LIST"
      />
      <div class="col-9" />
      <Dropdown
        class="col-3"
        name="financiallySupportedIndigenous"
        label="Indigenous Housing Provider"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e) => {
            if (e.value !== BasicResponse.YES) setFieldValue('indigenousDescription', null);
          }
        "
      />
      <InputText
        class="col-3"
        name="indigenousDescription"
        label="Name of Indigenous Housing Provider"
        :disabled="!editable || values.financiallySupportedIndigenous !== BasicResponse.YES"
      />
      <div class="col-6" />
      <Dropdown
        class="col-3"
        name="financiallySupportedNonProfit"
        label="Non-profit housing society"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e) => {
            if (e.value !== BasicResponse.YES) setFieldValue('nonProfitDescription', null);
          }
        "
      />
      <InputText
        class="col-3"
        name="nonProfitDescription"
        label="Name of Non-profit housing society"
        :disabled="!editable || values.financiallySupportedNonProfit !== BasicResponse.YES"
      />
      <div class="col-6" />
      <Dropdown
        class="col-3"
        name="financiallySupportedHousingCoop"
        label="Housing co-operative"
        :disabled="!editable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e) => {
            if (e.value !== BasicResponse.YES) setFieldValue('housingCoopDescription', null);
          }
        "
      />
      <InputText
        class="col-3"
        name="housingCoopDescription"
        label="Name of Housing co-operative"
        :disabled="!editable || values.financiallySupportedHousingCoop !== BasicResponse.YES"
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
        :options="YES_NO_LIST"
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
        :options="INTAKE_STATUS_LIST"
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
        :options="APPLICATION_STATUS_LIST"
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
