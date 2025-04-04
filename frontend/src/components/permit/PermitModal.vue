<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { date, object, string } from 'yup';

import { DatePicker, InputText, Select } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { permitService } from '@/services';
import { useProjectStore, usePermitStore } from '@/store';
import { PERMIT_AUTHORIZATION_STATUS_LIST, PERMIT_NEEDED_LIST, PERMIT_STATUS_LIST } from '@/utils/constants/housing';
import { PermitAuthorizationStatus, PermitStatus } from '@/utils/enums/housing';

import type { SelectChangeEvent } from 'primevue/select';
import type { Permit, PermitForm } from '@/types';

// Props
const { activityId, permit = undefined } = defineProps<{
  activityId: string;
  permit?: Permit;
}>();

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

// Store
const projectStore = useProjectStore();
const permitStore = usePermitStore();
const { getPermitTypes } = storeToRefs(permitStore);

// State
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: PermitForm = {
  permitId: permit?.permitId,
  permitType: permit?.permitType,
  needed: permit?.needed,
  status: permit?.status ?? PermitStatus.NEW,
  agency: permit?.permitType.agency,
  trackingId: permit?.trackingId,
  businessDomain: permit?.permitType.businessDomain,
  authStatus: permit?.authStatus ?? PermitAuthorizationStatus.NONE,
  statusLastVerified: permit?.statusLastVerified ? new Date(permit.statusLastVerified) : undefined,
  sourceSystem: permit?.permitType.sourceSystem ?? permit?.permitType.sourceSystemAcronym,
  submittedDate: permit?.submittedDate ? new Date(permit.submittedDate) : undefined,
  issuedPermitId: permit?.issuedPermitId,
  adjudicationDate: permit?.adjudicationDate ? new Date(permit.adjudicationDate) : undefined
};

// Form validation schema
const formSchema = object({
  permitType: object().required().label('Permit'),
  needed: string().required().label('Needed'),
  status: string().required().oneOf(PERMIT_STATUS_LIST).label('Application stage'),
  agency: string().required().label('Agency'),
  businessDomain: string().label('Business domain'),
  authStatus: string()
    .required()
    .oneOf(PERMIT_AUTHORIZATION_STATUS_LIST)
    .label('Authorization status')
    .test(
      'valid-auth-status',
      'Authorization status can only be "None" if the Permit state is "Pre-submission".',
      function (value) {
        const { status } = this.parent;
        return (
          (status === PermitStatus.NEW && value === PermitAuthorizationStatus.NONE) ||
          (status !== PermitStatus.NEW && value !== PermitAuthorizationStatus.NONE)
        );
      }
    ),
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
function onDelete() {
  if (permit) {
    confirm.require({
      message: 'Please confirm that you want to delete the selected permit. This cannot be undone.',
      header: 'Confirm delete',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectProps: { outlined: true },
      accept: () => {
        permitService
          .deletePermit(permit?.permitId as string)
          .then(() => {
            projectStore.removePermit(permit as Permit);
            toast.success('Permit deleted');
          })
          .catch((e: any) => toast.error('Failed to delete permit', e.message))
          .finally(() => (visible.value = false));
      }
    });
  }
}

function onPermitTypeChanged(e: SelectChangeEvent, setValues: Function) {
  setValues({
    agency: e.value.agency,
    businessDomain: e.value.businessDomain,
    permitType: e.value,
    sourceSystem: e.value.sourceSystem ?? e.value.sourceSystemAcronym
  });
}

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: PermitForm, { resetForm }) {
  if (permit) initialFormValues = { ...data };
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
    if (!permit) {
      const result = (await permitService.createPermit({ ...permitData, activityId: activityId })).data;
      projectStore.addPermit(result);
    } else {
      const result = (await permitService.updatePermit({ ...permitData, activityId: permit.activityId })).data;
      projectStore.updatePermit({
        ...result,
        permitNote: permit?.permitNote
      });
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
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <font-awesome-icon
        v-if="permit"
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
      <span class="p-dialog-title">{{ permit ? t('permitModal.editTitle') : t('permitModal.addTitle') }}</span>
    </template>

    <Form
      v-slot="{ setValues }"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="grid grid-cols-12 gap-4">
        <Select
          class="col-span-12"
          name="permitType"
          label="Permit"
          :options="getPermitTypes"
          :option-label="(e) => `${e.businessDomain}: ${e.name}`"
          :loading="getPermitTypes === undefined"
          autofocus
          @on-change="(e: SelectChangeEvent) => onPermitTypeChanged(e, setValues)"
        />
        <InputText
          class="col-span-12 lg:col-span-6"
          name="agency"
          label="Agency"
          :disabled="true"
        />
        <InputText
          class="col-span-12 lg:col-span-6"
          name="businessDomain"
          label="Business domain"
          :disabled="true"
        />
        <InputText
          class="col-span-12 lg:col-span-6"
          name="sourceSystem"
          label="Source system"
          :disabled="true"
        />
        <Select
          class="col-span-12 lg:col-span-6"
          name="status"
          label="Application stage"
          :options="PERMIT_STATUS_LIST"
        />
        <DatePicker
          class="col-span-12 lg:col-span-6"
          name="submittedDate"
          label="Submitted date"
          :max-date="new Date()"
        />
        <Select
          class="col-span-12 lg:col-span-6"
          name="needed"
          label="Needed"
          :options="PERMIT_NEEDED_LIST"
        />
        <Select
          class="col-span-12 lg:col-span-6"
          name="authStatus"
          label="Authorization status"
          :options="PERMIT_AUTHORIZATION_STATUS_LIST"
        />
        <DatePicker
          class="col-span-12 lg:col-span-6"
          name="statusLastVerified"
          label="Status verified date"
          :max-date="new Date()"
        />

        <InputText
          class="col-span-12 lg:col-span-6"
          name="trackingId"
          label="Tracking ID"
        />
        <DatePicker
          class="col-span-12 lg:col-span-6"
          name="adjudicationDate"
          label="Adjudication date"
          :max-date="new Date()"
        />
        <InputText
          class="col-span-12 lg:col-span-6"
          name="issuedPermitId"
          label="Issued Permit ID"
        />
        <div class="field col-span-12 flex">
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
              outlined
              class="mr-2"
              severity="danger"
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
