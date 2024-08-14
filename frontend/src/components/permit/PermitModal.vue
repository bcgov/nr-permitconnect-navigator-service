<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { date, object, string } from 'yup';

import { Calendar, Dropdown, InputText } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { permitService } from '@/services';
import { useSubmissionStore, useTypeStore } from '@/store';
import { PERMIT_AUTHORIZATION_STATUS_LIST, PERMIT_NEEDED_LIST, PERMIT_STATUS_LIST } from '@/utils/constants/housing';
import { PermitAuthorizationStatus, PermitStatus } from '@/utils/enums/housing';

import type { DropdownChangeEvent } from 'primevue/dropdown';
import type { Ref } from 'vue';
import type { Schema } from 'yup';
import type { Permit, PermitForm, PermitType } from '@/types';

// Props
type Props = {
  activityId: string;
  permit?: Permit;
};

const props = withDefaults(defineProps<Props>(), {
  permit: undefined
});

// Store
const submissionStore = useSubmissionStore();
const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);

// State
const permitType: Ref<PermitType | undefined> = ref(
  getPermitTypes.value.find((x) => x.permitTypeId === props.permit?.permitTypeId)
);
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: PermitForm = {
  permitId: props.permit?.permitId,
  permitType: permitType.value,
  needed: props.permit?.needed,
  status: props.permit?.status ?? PermitStatus.NEW,
  agency: permitType.value?.agency,
  trackingId: props.permit?.trackingId,
  businessDomain: permitType.value?.businessDomain,
  authStatus: props.permit?.authStatus,
  statusLastVerified: props.permit?.statusLastVerified ? new Date(props.permit.statusLastVerified) : undefined,
  sourceSystem: permitType.value?.sourceSystem ?? permitType.value?.sourceSystemAcronym,
  submittedDate: props.permit?.submittedDate ? new Date(props.permit.submittedDate) : undefined,
  issuedPermitId: props.permit?.issuedPermitId,
  adjudicationDate: props.permit?.adjudicationDate ? new Date(props.permit.adjudicationDate) : undefined
};

// Form validation schema
const formSchema = object({
  permitType: object().required().label('Permit'),
  needed: string().required().label('Needed'),
  status: string().required().label('Permit state'),
  agency: string().required().label('Agency'),
  businessDomain: string().label('Business domain'),
  authStatus: string()
    .notRequired()
    .label('For the currently selected Permit state, Authorization status')
    .when('status', {
      is: (value: string) => (PermitStatus.APPLIED as string) === value,
      then: (schema: Schema) =>
        schema
          .oneOf([
            PermitAuthorizationStatus.NONE,
            PermitAuthorizationStatus.IN_REVIEW,
            PermitAuthorizationStatus.PENDING
          ])
          .required()
    })
    .when('status', {
      is: (value: string) => (PermitStatus.COMPLETED as string) === value,
      then: (schema: Schema) =>
        schema.oneOf([PermitAuthorizationStatus.ISSUED, PermitAuthorizationStatus.DENIED]).required(),
      otherwise: (schema: Schema) => schema
    }),
  statusLastVerified: date()
    .max(new Date(), 'Status verified date cannot be in the future')
    .nullable()
    .label('Status verified date'),
  submittedDate: date().max(new Date(), 'Submitted date cannot be in the future').nullable().label('Submitted date'),
  adjudicationDate: date()
    .max(new Date(), 'Adjudication date cannot be in the future')
    .nullable()
    .label('Adjudication date'),
  sourceSystem: string().required().label('Source system')
});

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete() {
  if (props.permit) {
    confirm.require({
      message: 'Please confirm that you want to delete the selected permit. This cannot be undone.',
      header: 'Confirm delete',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      accept: () => {
        permitService
          .deletePermit(props.permit?.permitId as string)
          .then(() => {
            submissionStore.removePermit(props.permit as Permit);
            toast.success('Permit deleted');
          })
          .catch((e: any) => toast.error('Failed to delete permit', e.message))
          .finally(() => (visible.value = false));
      }
    });
  }
}

function onPermitTypeChanged(e: DropdownChangeEvent, setValues: Function) {
  permitType.value = e.value;
  setValues({
    agency: e.value.agency,
    businessDomain: e.value.businessDomain,
    sourceSystem: e.value.sourceSystem ?? e.value.sourceSystemAcronym
  });
}

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: PermitForm, { resetForm }) {
  if (props.permit) initialFormValues = { ...data };
  else resetForm();

  // Remove extra fields in permit that belongs to permitType
  delete data.agency;
  delete data.businessDomain;
  delete data.sourceSystem;

  // Convert form back to a proper Permit type
  const permitData = {
    ...data,
    permitTypeId: data.permitType?.permitTypeId,
    submittedDate: data.submittedDate?.toISOString(),
    adjudicationDate: data.adjudicationDate?.toISOString()
  } as Permit;

  try {
    if (!props.permit) {
      const result = (await permitService.createPermit({ ...permitData, activityId: props.activityId })).data;
      submissionStore.addPermit(result);
    } else {
      const result = (await permitService.updatePermit({ ...permitData, activityId: props.permit.activityId })).data;
      submissionStore.updatePermit(result);
    }
    toast.success('Permit saved');
  } catch (e: any) {
    toast.error('Failed to save permit', e.message);
  } finally {
    visible.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6"
  >
    <template #header>
      <font-awesome-icon
        v-if="props.permit"
        icon="fa-solid fa-edit"
        fixed-width
        class="mr-2"
      />
      <font-awesome-icon
        v-else
        icon="fa-solid fa-plus"
        fixed-width
        class="mr-2"
      />
      <span class="p-dialog-title">{{ props.permit ? 'Edit' : 'Add' }} permit</span>
    </template>

    <Form
      v-slot="{ setValues }"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="formgrid grid">
        <Dropdown
          class="col-12"
          name="permitType"
          label="Permit"
          :options="getPermitTypes"
          :option-label="(e) => `${e.businessDomain}: ${e.name}`"
          :loading="getPermitTypes === undefined"
          autofocus
          @on-change="(e: DropdownChangeEvent) => onPermitTypeChanged(e, setValues)"
        />
        <InputText
          class="col-12 lg:col-6"
          name="agency"
          label="Agency"
          :disabled="true"
        />
        <InputText
          class="col-12 lg:col-6"
          name="businessDomain"
          label="Business domain"
          :disabled="true"
        />
        <InputText
          class="col-12 lg:col-6"
          name="sourceSystem"
          label="Source system"
          :disabled="true"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="status"
          label="Permit state"
          :options="PERMIT_STATUS_LIST"
        />
        <Calendar
          class="col-12 lg:col-6"
          name="submittedDate"
          label="Submitted date"
          :max-date="new Date()"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="needed"
          label="Needed"
          :options="PERMIT_NEEDED_LIST"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="authStatus"
          label="Authorization status"
          :options="PERMIT_AUTHORIZATION_STATUS_LIST"
        />
        <Calendar
          class="col-12 lg:col-6"
          name="statusLastVerified"
          label="Status verified date"
          :max-date="new Date()"
        />

        <InputText
          class="col-12 lg:col-6"
          name="trackingId"
          label="Tracking ID"
        />
        <Calendar
          class="col-12 lg:col-6"
          name="adjudicationDate"
          label="Adjudication date"
          :max-date="new Date()"
        />
        <InputText
          class="col-12 lg:col-6"
          name="issuedPermitId"
          label="Issued Permit ID"
        />
        <div class="field col-12 flex">
          <div class="flex-auto">
            <Button
              class="mr-2"
              label="Save"
              type="submit"
              icon="pi pi-check"
            />
            <Button
              class="p-button-outlined mr-2"
              label="Cancel"
              icon="pi pi-times"
              @click="visible = false"
            />
          </div>
          <div
            v-if="permit"
            class="flex justify-content-right"
          >
            <Button
              class="p-button-outlined p-button-danger mr-2"
              label="Delete"
              icon="pi pi-trash"
              @click="onDelete"
            />
          </div>
        </div>
      </div>
    </Form>
  </Dialog>
</template>
