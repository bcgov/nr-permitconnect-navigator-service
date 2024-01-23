<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { object, string } from 'yup';

import { Calendar, Dropdown, InputText } from '@/components/form';
import { Button, Dialog } from '@/lib/primevue';
import { permitService } from '@/services';
import { PermitAuthorizationStatus, PermitStatus } from '@/utils/constants';
import { onMounted } from 'vue';

import type { Ref } from 'vue';
import type { Permit, PermitType } from '@/types';
import type { DropdownChangeEvent } from 'primevue/dropdown';

// Props
type Props = {
  permit?: Permit;
};

const props = withDefaults(defineProps<Props>(), {
  permit: undefined
});

// Emits
const emit = defineEmits(['permit:submit']);

// State
const visible = defineModel<boolean>('visible');
const permitTypes: Ref<Array<PermitType> | undefined> = ref(undefined);

// Default form values
const initialFormValues: any = {
  permitType: props.permit?.permitType,
  needed: props.permit?.needed,
  status: props.permit?.status,
  agency: props.permit?.permitType?.agency,
  trackingId: props.permit?.trackingId,
  businessDomain: props.permit?.permitType?.businessDomain,
  authStatus: props.permit?.authStatus,
  sourceSystem: props.permit?.permitType?.sourceSystem,
  submittedAt: props.permit?.createdAt ? new Date(props.permit.createdAt) : undefined,
  permitId: props.permit?.permitId,
  adjudicationDate: props.permit?.adjudicationDate ? new Date(props.permit.adjudicationDate) : undefined
};

// Form validation schema
const formSchema = object({
  permitType: object().required().label('Permit'),
  needed: string().required().label('Needed'),
  status: string().required().label('Status'),
  agency: string().required().label('Agency'),
  trackingId: string().label('Tracking ID'),
  businessDomain: string().required().label('Business domain'),
  authStatus: string().required().label('Authorization Status'),
  sourceSystem: string().required().label('Source system'),
  submittedAt: string().required().label('Submitted date'),
  permitId: string().label('Permit ID'),
  adjudicationDate: string().label('Adjudication date')
});

// Actions
function onPermitTypeChanged(e: DropdownChangeEvent, setValues: Function) {
  const type: PermitType = e.value;
  setValues({
    agency: type.agency,
    businessDomain: type.businessDomain,
    sourceSystem: type.sourceSystem
  });
}

onMounted(async () => {
  permitTypes.value = (await permitService.getPermitTypes())?.data;
});

function onSubmit(data: any) {
  emit('permit:submit', data);
}
</script>

<template>
  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6"
  >
    <!-- eslint-enable vue/no-v-model-argument -->
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
          option-label="name"
          :loading="permitTypes === undefined"
          autofocus
          @on-change="(e: DropdownChangeEvent) => onPermitTypeChanged(e, setValues)"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="needed"
          label="Needed"
          :options="['Yes', 'Under investigation', 'No']"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="status"
          label="Status"
          :options="PermitStatus"
        />
        <InputText
          class="col-12 lg:col-6"
          name="agency"
          label="Agency"
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
        />
        <Calendar
          class="col-12 lg:col-6"
          name="submittedAt"
          label="Submitted date"
        />
        <InputText
          class="col-12 lg:col-6"
          name="permitId"
          label="Permit ID"
          :disabled="true"
        />
        <Calendar
          class="col-12 lg:col-6"
          name="adjudicationDate"
          label="Adjudication date"
        />
        <div class="field col-12">
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
      </div>
    </Form>
  </Dialog>
</template>
