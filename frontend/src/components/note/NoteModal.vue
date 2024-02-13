<script setup lang="ts">
import { Form } from 'vee-validate';
// import { ref } from 'vue';
import { object, string } from 'yup';

import { Dropdown, InputText, TextArea } from '@/components/form';
import { Button, Dialog } from '@/lib/primevue';
// import { noteService } from '@/services';
import { NoteTypes } from '@/utils/constants';
import { NOTE_TYPES } from '@/utils/enums';
import { onMounted } from 'vue';

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
  note: props.note?.note,
  noteType: NOTE_TYPES.GENERAL
};

// Form validation schema
const formSchema = object({
  note: string().required().label('Note'),
  noteType: string().oneOf(NoteTypes).label('Note type'),
  title: string().required().max(100, 'Title too long').label('Title')
});

// Actions
// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
function onSubmit(data: any, { resetForm }) {
  if (props.note) initialFormValues = data;
  else resetForm();
  emit('note:submit', data);
}

onMounted(async () => {
  // permitTypes.value = (await permitService.getPermitTypes())?.data;
});
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
      <span class="p-dialog-title">Add note</span>
    </template>

    <Form
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="formgrid grid">
        <div class="field col">
          <label class="font-bold">Date</label>
          <p>{{ new Date() }}</p>
        </div>
        <InputText
          class="col-12"
          name="title"
          label="Title"
        />
        <TextArea
          class="col-12"
          name="note"
          label="Note"
        />
        <Dropdown
          class="col-12 lg:col-6"
          name="noteType"
          label="Note type"
          :options="NoteTypes"
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
