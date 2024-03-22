<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { object, string } from 'yup';

import { Calendar, Dropdown, InputText } from '@/components/form';
import { Button, Dialog } from '@/lib/primevue';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/constants';
import { PERMIT_STATUS } from '@/utils/enums';

import type { Ref } from 'vue';
import type { Permit, PermitForm, PermitType } from '@/types';
import type { DropdownChangeEvent } from 'primevue/dropdown';

// Props
type Props = {
  permit?: Permit;
  permitTypes: Array<PermitType>;
};

const props = withDefaults(defineProps<Props>(), {
  permit: undefined
});

// Emits
const emit = defineEmits(['permit:delete', 'permit:submit']);

// State
const visible = defineModel<boolean>('visible');
const permitType: Ref<PermitType | undefined> = ref(
  props.permitTypes.find((x) => x.permitTypeId === props.permit?.permitTypeId)
);

// Default form values
let initialFormValues: PermitForm = {
  permitId: props.permit?.permitId,
  permitType: permitType.value,
  needed: props.permit?.needed,
  status: props.permit?.status ?? PERMIT_STATUS.NEW,
  agency: permitType.value?.agency,
  trackingId: props.permit?.trackingId,
  businessDomain: permitType.value?.businessDomain,
  authStatus: props.permit?.authStatus,
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
  businessDomain: string().required().label('Business domain'),
  sourceSystem: string().required().label('Source system')
});

// Actions
function onDelete() {
  emit('permit:delete', props.permit);
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
function onSubmit(data: PermitForm, { resetForm }) {
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
  emit('permit:submit', permitData);
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
          :options="permitTypes"
          :option-label="(e) => `${e.businessDomain}: ${e.name}`"
          :loading="permitTypes === undefined"
          autofocus
          @on-change="(e: DropdownChangeEvent) => onPermitTypeChanged(e, setValues)"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="needed"
          label="Needed"
          :options="PermitNeeded"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="status"
          label="Permit state"
          :options="PermitStatus"
        />
        <InputText
          class="col-12 lg:col-6"
          name="agency"
          label="Agency"
          :disabled="true"
        />
        <InputText
          class="col-12 lg:col-6"
          name="trackingId"
          label="Tracking ID"
        />
        <InputText
          class="col-12 lg:col-6"
          name="businessDomain"
          label="Business domain"
          :disabled="true"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="authStatus"
          label="Authorization status"
          :options="PermitAuthorizationStatus"
        />
        <InputText
          class="col-12 lg:col-6"
          name="sourceSystem"
          label="Source system"
          :disabled="true"
        />
        <Calendar
          class="col-12 lg:col-6"
          name="submittedDate"
          label="Submitted date"
        />
        <InputText
          class="col-12 lg:col-6"
          name="issuedPermitId"
          label="Permit ID"
        />
        <Calendar
          class="col-12 lg:col-6"
          name="adjudicationDate"
          label="Adjudication date"
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
