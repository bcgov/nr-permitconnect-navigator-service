<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { object, string } from 'yup';

import { TextInput } from '@/components/form';
import { useAlert } from '@/composables/useAlert';
import { Button, Dialog, useConfirm } from '@/lib/primevue';

import type { Ref } from 'vue';

// State
const modalOpen: Ref<boolean> = ref(false);

// Default form values
const initialDialogValues: any = {
  field2: 'Default'
};

// Form validation schema
const dialogSchema = object({
  field1: string().max(255).required().label('Field 1'),
  field2: string().max(255).required().label('Field 2')
});

// Actions
const alert = useAlert('Alert header', 'This is the alert message');
const confirm = useConfirm();

const showConfirm = () => {
  confirm.require({
    message: 'This is a confirm modal.',
    header: 'Confirm header',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
    accept: () => console.log('Confirm'), // eslint-disable-line no-console
    reject: () => console.log('Reject') // eslint-disable-line no-console
  });
};

const showAlert = () => {
  alert.show();
};

const onModalSubmit = (values: any) => {
  console.log(values); // eslint-disable-line no-console
  modalOpen.value = false;
};
</script>

<template>
  <h3 class="font-bold">Modals</h3>

  <Button
    class="mr-1"
    @click="showConfirm"
  >
    Show confirm
  </Button>
  <Button
    class="mr-1"
    @click="showAlert"
  >
    Show alert
  </Button>
  <Button
    class="mr-1"
    @click="modalOpen = true"
  >
    Open modal
  </Button>

  <!-- eslint-disable vue/no-v-model-argument -->
  <Dialog
    v-model:visible="modalOpen"
    :draggable="false"
    :modal="true"
    class="app-info-dialog permissions-modal"
  >
    <!-- eslint-enable vue/no-v-model-argument -->
    <template #header>
      <font-awesome-icon
        icon="fa-solid fa-circle-info"
        fixed-width
      />
      <span class="p-dialog-title">Modal header</span>
    </template>

    <h3 class="pt-3 pb-3">Modal body</h3>
    <Form
      :initial-values="initialDialogValues"
      :validation-schema="dialogSchema"
      @submit="onModalSubmit"
    >
      <TextInput
        name="field1"
        label="Field 1 *"
        placeholder="Placeholder text"
        help-text="Help text for this field."
        autofocus
      />
      <TextInput
        name="field2"
        label="Field 2 *"
        placeholder="Placeholder text"
        help-text="Help text for this field."
        autofocus
      />
      <Button
        class="mt-5"
        label="Save"
        type="submit"
        icon="pi pi-check"
      />
      <Button
        class="p-button-text mt-2"
        label="Cancel"
        icon="pi pi-times"
        @click="modalOpen = false"
      />
    </Form>
  </Dialog>
</template>
