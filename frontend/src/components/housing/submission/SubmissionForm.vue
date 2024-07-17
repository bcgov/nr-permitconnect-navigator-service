<script setup lang="ts">
import { Form } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { boolean, number, object, string } from 'yup';

import {
  Calendar,
  CancelButton,
  Checkbox,
  Dropdown,
  EditableDropdown,
  FormNavigationGuard,
  InputMask,
  InputNumber,
  InputText,
  SectionHeader,
  TextArea
} from '@/components/form';
import { Button, Message, useToast } from '@/lib/primevue';
import { submissionService, userService } from '@/services';
import { useSubmissionStore } from '@/store';
import { YES_NO_LIST, YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import {
  APPLICATION_STATUS_LIST,
  CONTACT_PREFERENCE_LIST,
  INTAKE_STATUS_LIST,
  NUM_RESIDENTIAL_UNITS_LIST,
  PROJECT_RELATIONSHIP_LIST,
  QUEUE_PRIORITY,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/housing';
import { BasicResponse, Regex } from '@/utils/enums/application';
import { IntakeStatus } from '@/utils/enums/housing';
import { applicantValidator, assignedToValidator, latitudeValidator, longitudeValidator } from '@/validators';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Submission, User } from '@/types';
import { omit, setEmptyStringsToNull } from '@/utils/utils';

// Interfacefs
interface SubmissionForm extends Submission {
  locationAddress: string;
  user?: User;
}

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
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const showCancelMessage: Ref<boolean> = ref(false);

// Form validation schema
const formSchema = object({
  queuePriority: number()
    .required()
    .integer()
    .min(0)
    .max(3)
    .typeError('Queue Priority must be a number')
    .label('Queue Priority'),
  submissionType: string().required().oneOf(SUBMISSION_TYPE_LIST).label('Submission type'),
  submittedAt: string().required().label('Submission date'),
  relatedEnquiries: string().notRequired().label('Related enquiries'),
  ...applicantValidator,
  companyNameRegistered: string().notRequired().max(255).label('Company'),
  isDevelopedInBC: string().when('companyNameRegistered', {
    is: (val: string) => val,
    then: (schema) => schema.required().oneOf(YES_NO_LIST).label('Company registered in B.C'),
    otherwise: () => string().notRequired()
  }),
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
  streetAddress: string().notRequired().max(255).label('Street address'),
  locality: string().notRequired().max(255).label('Locality'),
  province: string().notRequired().max(255).label('Province'),
  locationPIDs: string().notRequired().max(255).label('Location PID(s)'),
  latitude: latitudeValidator,
  longitude: longitudeValidator,
  geomarkUrl: string().notRequired().max(255).label('Geomark URL'),
  naturalDisaster: string().oneOf(YES_NO_LIST).required().label('Affected by natural disaster'),
  projectLocationDescription: string().notRequired().max(4000).label('Additional information about location'),
  addedToATS: boolean().required().label('Authorized Tracking System (ATS) updated'),
  atsClientNumber: string().when('addedToATS', {
    is: (val: boolean) => val,
    then: (schema) => schema.required().max(255).label('ATS Client #'),
    otherwise: () => string().notRequired()
  }),
  ltsaCompleted: boolean().required().label('Land Title Survey Authority (LTSA) completed'),
  bcOnlineCompleted: boolean().required().label('BC Online completed'),
  aaiUpdated: boolean().required().label('Authorization and Approvals Insight (AAI) updated'),
  astNotes: string().notRequired().max(4000).label('Automated Status Tool (AST) Notes'),
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

const onSubmit = async (values: any) => {
  try {
    editable.value = false;

    const submitData: Submission = omit(setEmptyStringsToNull(values) as SubmissionForm, ['locationAddress', 'user']);
    submitData.assignedUserId = values.user?.userId ?? undefined;

    const result = await submissionService.updateSubmission(values.submissionId, submitData);
    submissionStore.setSubmission(result.data);
    formRef.value?.resetForm({
      values: {
        ...submitData,
        locationAddress: values.locationAddress,
        user: values.user
      }
    });

    toast.success('Form saved');
  } catch (e: any) {
    toast.error('Failed to save submission', e.message);
  } finally {
    editable.value = true;
  }
};

function updateLocationAddress(values: any, setFieldValue?: Function) {
  // const locationAddressStr = concatenateAddress(values.streetAddress, values.locality, values.province);

  const locationAddressStr = [values.streetAddress, values.locality, values.province]
    .filter((str) => str?.trim())
    .join(', ');

  if (setFieldValue) setFieldValue('locationAddress', locationAddressStr);

  return locationAddressStr;
}

onMounted(async () => {
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
    projectLocationDescription: props.submission.projectLocationDescription,
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
    locationAddress: updateLocationAddress(props.submission),
    streetAddress: props.submission.streetAddress,
    locality: props.submission.locality,
    province: props.submission.province,
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
    v-slot="{ setFieldValue, values }"
    ref="formRef"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @invalid-submit="(e) => onInvalidSubmit(e)"
    @submit="onSubmit"
  >
    <FormNavigationGuard />

    <div class="formgrid grid">
      <Dropdown
        class="col-3"
        name="queuePriority"
        label="Priority"
        :disabled="!props.editable"
        :options="QUEUE_PRIORITY"
      />
      <Dropdown
        class="col-3"
        name="submissionType"
        label="Submission type"
        :disabled="!props.editable"
        :options="SUBMISSION_TYPE_LIST"
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

      <SectionHeader title="Basic information" />

      <InputText
        class="col-3"
        name="contactFirstName"
        label="First name"
        :disabled="!props.editable"
      />
      <InputText
        class="col-3"
        name="contactLastName"
        label="Last name"
        :disabled="!props.editable"
      />
      <InputText
        class="col-3"
        name="companyNameRegistered"
        label="Company"
        :disabled="!props.editable"
        @on-change="
          (e) => {
            if (!e.target.value) {
              setFieldValue('companyNameRegistered', null);
              setFieldValue('isDevelopedInBC', null);
            }
          }
        "
      />
      <Dropdown
        class="col-3"
        name="isDevelopedInBC"
        label="Company registered in B.C?"
        :disabled="!props.editable || !values.companyNameRegistered"
        :options="YES_NO_LIST"
      />
      <Dropdown
        class="col-3"
        name="contactApplicantRelationship"
        label="Relationship to project"
        :disabled="!props.editable"
        :options="PROJECT_RELATIONSHIP_LIST"
      />
      <Dropdown
        class="col-3"
        name="contactPreference"
        label="Preferred contact method"
        :disabled="!props.editable"
        :options="CONTACT_PREFERENCE_LIST"
      />
      <InputMask
        class="col-3"
        name="contactPhoneNumber"
        mask="(999) 999-9999"
        label="Contact phone"
        :disabled="!props.editable"
      />
      <InputText
        class="col-3"
        name="contactEmail"
        label="Contact email"
        :disabled="!props.editable"
      />

      <SectionHeader title="Housing" />

      <InputText
        class="col-3"
        name="projectName"
        label="Project name"
        :disabled="!props.editable"
      />
      <div class="col-9" />
      <TextArea
        class="col-12"
        name="projectDescription"
        label="Additional information about project"
        :disabled="!props.editable"
      />
      <Dropdown
        class="col-3"
        name="singleFamilyUnits"
        label="Single family units"
        :disabled="!props.editable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Dropdown
        class="col-3"
        name="multiFamilyUnits"
        label="Multi-family units"
        :disabled="!props.editable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <InputText
        class="col-3"
        name="otherUnitsDescription"
        label="Other type"
        :disabled="!props.editable"
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
        :disabled="!props.editable || !values.otherUnitsDescription"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Dropdown
        class="col-3"
        name="hasRentalUnits"
        label="Rental included?"
        :disabled="!props.editable"
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
        :disabled="!props.editable || values.hasRentalUnits !== BasicResponse.YES"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />

      <SectionHeader title="Financially supported" />

      <Dropdown
        class="col-3"
        name="financiallySupportedBC"
        label="BC Housing"
        :disabled="!props.editable"
        :options="YES_NO_UNSURE_LIST"
      />
      <div class="col-9" />
      <Dropdown
        class="col-3"
        name="financiallySupportedIndigenous"
        label="Indigenous Housing Provider"
        :disabled="!props.editable"
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
        :disabled="!props.editable || values.financiallySupportedIndigenous !== BasicResponse.YES"
      />
      <div class="col-6" />
      <Dropdown
        class="col-3"
        name="financiallySupportedNonProfit"
        label="Non-profit housing society"
        :disabled="!props.editable"
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
        :disabled="!props.editable || values.financiallySupportedNonProfit !== BasicResponse.YES"
      />
      <div class="col-6" />
      <Dropdown
        class="col-3"
        name="financiallySupportedHousingCoop"
        label="Housing co-operative"
        :disabled="!props.editable"
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
        :disabled="!props.editable || values.financiallySupportedHousingCoop !== BasicResponse.YES"
      />
      <div class="col-6" />

      <SectionHeader title="Location" />

      <InputText
        class="col-3"
        name="locationAddress"
        label="Location address"
        :disabled="true"
      />
      <InputText
        class="col-3"
        name="streetAddress"
        label="Street address"
        :disabled="!props.editable"
        @on-change="updateLocationAddress(values, setFieldValue)"
      />
      <InputText
        class="col-3"
        name="locality"
        label="Locality"
        :disabled="!props.editable"
        @on-change="updateLocationAddress(values, setFieldValue)"
      />
      <InputText
        class="col-3"
        name="province"
        label="Province"
        :disabled="!props.editable"
        @on-change="updateLocationAddress(values, setFieldValue)"
      />
      <InputText
        class="col-3"
        name="locationPIDs"
        label="Location PID(s)"
        :disabled="!props.editable"
      />
      <InputNumber
        class="col-3"
        name="latitude"
        label="Location latitude"
        help-text="Optionally provide a number between 48 and 60"
        :disabled="!props.editable"
      />
      <InputNumber
        class="col-3"
        name="longitude"
        label="Location longitude"
        help-text="Optionally provide a number between -114 and -139"
        :disabled="!props.editable"
      />
      <InputText
        class="col-3"
        name="geomarkUrl"
        label="Geomark URL"
        :disabled="!props.editable"
      />
      <Dropdown
        class="col-3"
        name="naturalDisaster"
        label="Affected by natural disaster?"
        :disabled="!props.editable"
        :options="YES_NO_LIST"
      />
      <TextArea
        class="col-12"
        name="projectLocationDescription"
        label="Additional information about location"
        :disabled="!props.editable"
      />
      <div class="col-6" />

      <SectionHeader title="Other" />

      <Checkbox
        class="col-12"
        name="addedToATS"
        label="Authorized Tracking System (ATS) updated"
        :disabled="!props.editable"
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
          :disabled="!props.editable"
        />
        <div class="col-9" />
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
        label="BC Online completed"
        :disabled="!props.editable"
      />
      <Checkbox
        class="col-12"
        name="aaiUpdated"
        label="Authorization and Approvals Insight (AAI) updated"
        :disabled="!props.editable"
      />
      <TextArea
        class="col-12"
        name="astNotes"
        label="Automated Status Tool (AST) Notes"
        :disabled="!props.editable"
      />

      <SectionHeader title="Submission state" />

      <Dropdown
        class="col-3"
        name="intakeStatus"
        label="Intake state"
        :disabled="!props.editable"
        :options="INTAKE_STATUS_LIST"
      />
      <EditableDropdown
        class="col-3"
        name="user"
        label="Assigned to"
        :disabled="!props.editable"
        :options="assigneeOptions"
        :get-option-label="getAssigneeOptionLabel"
        @on-input="onAssigneeInput"
      />
      <Dropdown
        class="col-3"
        name="applicationStatus"
        label="Activity state"
        :disabled="!props.editable"
        :options="APPLICATION_STATUS_LIST"
      />
      <InputText
        class="col-3"
        name="waitingOn"
        label="Waiting on"
        :disabled="!props.editable"
      />

      <div
        v-if="props.editable"
        class="field col-12 mt-5"
      >
        <Button
          label="Save"
          type="submit"
          icon="pi pi-check"
          :disabled="!props.editable"
        />
        <CancelButton
          :editable="props.editable"
          @clicked="onCancel"
        />
      </div>
    </div>
  </Form>
</template>
