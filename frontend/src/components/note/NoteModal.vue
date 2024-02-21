<script setup lang="ts">
import { Form } from 'vee-validate';
import { object, string } from 'yup';

import { Calendar, Dropdown, InputText, TextArea } from '@/components/form';
import { Button, Dialog } from '@/lib/primevue';
import { NoteTypes } from '@/utils/constants';
import { NOTE_TYPES } from '@/utils/enums';
import { formatDateShort } from '@/utils/formatters';

// import type { Ref } from 'vue';
import type { Note } from '@/types';

// Props
type Props = {
  note?: Note;
};

const props = withDefaults(defineProps<Props>(), {
  note: undefined
});

// Emits
const emit = defineEmits(['note:submit']);

// State
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: any = {
  createdAt: new Date(), //formatDateShort(new Date().toISOString()),
  note: props.note?.note,
  noteType: NOTE_TYPES.GENERAL
};

// Form validation schema
const formSchema = object({
  note: string().required().label('Note'),
  noteType: string().oneOf(NoteTypes).label('Note type'),
  title: string().required().max(255, 'Title too long').label('Title')
});

// Actions
// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
function onSubmit(data: any, { resetForm }) {
  const parsedData = {
    ...data,
    createdAt: new Date(data.createdAt)
  };

  if (props.note) initialFormValues = parsedData;
  else resetForm();

  emit('note:submit', parsedData);
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
        icon="fa-solid fa-plus"
        fixed-width
        class="mr-2"
      />
      <span class="p-dialog-title">Add note</span>
    </template>

    <Form
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="formgrid grid">
        <Calendar
          class="col-6"
          name="createdAt"
          label="Date"
          :disabled="true"
          :show-time="true"
        />
        <div class="col-6" />
        <Dropdown
          class="col-6"
          name="noteType"
          label="Note type"
          :options="NoteTypes"
        />
        <div class="col-6" />
        <InputText
          class="col-6"
          name="title"
          label="Title"
        />
        <div class="col-6" />
        <TextArea
          class="col-12"
          name="note"
          label="Note"
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
        </div>
      </div>
    </Form>
  </Dialog>
</template>
