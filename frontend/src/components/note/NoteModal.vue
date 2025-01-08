<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { mixed, object, string } from 'yup';

import { DatePicker, Select, InputText, TextArea } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { noteService } from '@/services';
import { BRING_FORWARD_TYPE_LIST, NOTE_TYPE_LIST } from '@/utils/constants/housing';
import { BringForwardType, NoteType } from '@/utils/enums/housing';

import type { Ref } from 'vue';
import type { Note } from '@/types';
import type { SelectChangeEvent } from 'primevue/select';

// Props
const { activityId, note = undefined } = defineProps<{
  activityId: string;
  note?: Note;
}>();

// Emits
const emit = defineEmits(['addNote', 'updateNote', 'deleteNote']);

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const showBringForward: Ref<boolean> = ref(note?.noteType === NoteType.BRING_FORWARD);
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: any = {
  activityId: note?.activityId,
  bringForwardDate: note?.bringForwardDate ? new Date(note.bringForwardDate) : null,
  bringForwardState: note?.bringForwardState ?? null,
  createdAt: note?.createdAt ? new Date(note.createdAt) : new Date(),
  note: note?.note,
  noteId: note?.noteId,
  noteType: note?.noteType ?? NoteType.GENERAL,
  title: note?.title
};

// Form validation schema
const formSchema = object({
  bringForwardDate: mixed()
    .nullable()
    .when('noteType', {
      is: (noteType: string) => noteType === NoteType.BRING_FORWARD,
      then: (schema) =>
        schema.test(
          'bring forward required',
          'Bring forward date is a required field',
          (value) => value instanceof Date
        ),
      otherwise: (schema) => schema.nullable()
    })
    .label('Bring forward date'),
  bringForwardState: mixed()
    .when('noteType', {
      is: (noteType: string) => noteType === NoteType.BRING_FORWARD,
      then: () => string().oneOf(BRING_FORWARD_TYPE_LIST),
      otherwise: () => mixed().nullable()
    })
    .label('Bring forward state'),
  note: string().required().label('Note'),
  noteType: string().oneOf(NOTE_TYPE_LIST).label('Note type'),
  title: string().required().max(255, 'Title too long').label('Title')
});

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete() {
  if (note) {
    confirm.require({
      message: 'Please confirm that you want to delete the selected note.',
      header: 'Confirm delete',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectProps: { outlined: true },
      accept: () => {
        noteService
          .deleteNote(note?.noteId as string)
          .then(() => {
            emit('deleteNote', note as Note);
            toast.success('Note deleted');
          })
          .catch((e: any) => toast.error('Failed to delete note', e.message))
          .finally(() => {
            visible.value = false;
            formRef.value?.resetForm();
          });
      }
    });
  }
}

const onNoteTypeChange = (e: SelectChangeEvent) => {
  if (e.value === NoteType.BRING_FORWARD) {
    formRef.value?.setFieldValue('bringForwardState', BringForwardType.UNRESOLVED);
    showBringForward.value = true;
  } else {
    formRef.value?.setFieldValue('bringForwardDate', null);
    formRef.value?.setFieldValue('bringForwardState', null);
    showBringForward.value = false;
  }
};

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: any, { resetForm }) {
  try {
    if (!note) {
      const result = (await noteService.createNote({ ...data, activityId: activityId })).data;
      emit('addNote', result);
      resetForm();
    } else {
      const result = (await noteService.updateNote({ ...data, activityId: activityId })).data;
      emit('updateNote', note, result);
      initialFormValues = data;
    }
    toast.success('Note saved');
  } catch (e: any) {
    toast.error('Failed to save note', e.message);
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
        icon="fa-solid fa-plus"
        fixed-width
        class="mr-2"
      />
      <span class="p-dialog-title">Add note</span>
    </template>

    <Form
      ref="formRef"
      v-slot="{ handleReset }"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="grid grid-cols-12 gap-4">
        <DatePicker
          class="col-span-6"
          name="createdAt"
          label="Date"
          :disabled="!note"
          :show-time="true"
        />
        <div class="col-span-6" />
        <Select
          class="col-span-6"
          name="noteType"
          label="Note type"
          :options="NOTE_TYPE_LIST"
          @on-change="
            (e: SelectChangeEvent) => {
              onNoteTypeChange(e);
            }
          "
        />
        <DatePicker
          v-if="showBringForward"
          class="col-span-6"
          name="bringForwardDate"
          label="Bring forward date"
        />
        <div
          v-else
          class="col-span-6"
        />
        <InputText
          class="col-span-6"
          name="title"
          label="Title"
        />
        <Select
          v-if="showBringForward"
          class="col-span-6"
          name="bringForwardState"
          label="Bring forward state"
          :options="BRING_FORWARD_TYPE_LIST"
        />
        <div
          v-else
          class="col-span-6"
        />
        <TextArea
          class="col-span-12"
          name="note"
          label="Note"
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
              @click="
                () => {
                  handleReset();
                  showBringForward = note?.noteType === NoteType.BRING_FORWARD;
                  visible = false;
                }
              "
            />
          </div>
          <div
            v-if="note"
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
