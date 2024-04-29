<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { mixed, object, string } from 'yup';

import { Calendar, Dropdown, InputText, TextArea } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { noteService } from '@/services';
import { useSubmissionStore } from '@/store';
import { BringForwardTypes, NoteTypes } from '@/utils/constants';
import { BRING_FORWARD_TYPES, NOTE_TYPES } from '@/utils/enums';

import type { Ref } from 'vue';
import type { Note } from '@/types';

// Props
type Props = {
  activityId: string;
  note?: Note;
};

const props = withDefaults(defineProps<Props>(), {
  note: undefined
});

// Store
const submissionStore = useSubmissionStore();

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const showBringForward: Ref<boolean> = ref(props.note?.noteType === NOTE_TYPES.BRING_FORWARD);
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: any = {
  activityId: props.note?.activityId,
  bringForwardDate: props.note?.bringForwardDate ? new Date(props.note.bringForwardDate) : null,
  bringForwardState: props.note?.bringForwardState ?? null,
  createdAt: props.note?.createdAt ? new Date(props.note.createdAt) : new Date(),
  note: props.note?.note,
  noteId: props.note?.noteId,
  noteType: props.note?.noteType ?? NOTE_TYPES.GENERAL,
  title: props.note?.title
};

// Form validation schema
const formSchema = object({
  bringForwardDate: mixed()
    .nullable()
    .when('noteType', {
      is: (noteType: string) => noteType === NOTE_TYPES.BRING_FORWARD,
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
      is: (noteType: string) => noteType === NOTE_TYPES.BRING_FORWARD,
      then: () => string().oneOf(BringForwardTypes),
      otherwise: () => mixed().nullable()
    })
    .label('Bring forward state'),
  note: string().required().label('Note'),
  noteType: string().oneOf(NoteTypes).label('Note type'),
  title: string().required().max(255, 'Title too long').label('Title')
});

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete() {
  if (props.note) {
    confirm.require({
      message: 'Please confirm that you want to delete the selected note.',
      header: 'Confirm delete',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      accept: () => {
        noteService
          .deleteNote(props.note?.noteId as string)
          .then(() => {
            submissionStore.removeNote(props.note as Note);
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

const onNoteTypeChange = (e: { OriginalEvent: Event; value: string }) => {
  if (e.value === NOTE_TYPES.BRING_FORWARD) {
    formRef.value?.setFieldValue('bringForwardState', BRING_FORWARD_TYPES.UNRESOLVED);
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
    if (!props.note) {
      const result = (await noteService.createNote({ ...data, activityId: props.activityId })).data;
      submissionStore.addNote(result, true);
      resetForm();
    } else {
      const result = (await noteService.updateNote({ ...data, activityId: props.activityId })).data;
      submissionStore.updateNote(props.note, result);
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
    class="app-info-dialog w-6"
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
      <div class="formgrid grid">
        <Calendar
          class="col-6"
          name="createdAt"
          label="Date"
          :disabled="!props.note"
          :show-time="true"
        />
        <div class="col-6" />
        <Dropdown
          class="col-6"
          name="noteType"
          label="Note type"
          :options="NoteTypes"
          @on-change="(e) => onNoteTypeChange(e)"
        />
        <Calendar
          v-if="showBringForward"
          class="col-6"
          name="bringForwardDate"
          label="Bring forward date"
        />
        <div
          v-else
          class="col-6"
        />
        <InputText
          class="col-6"
          name="title"
          label="Title"
        />
        <Dropdown
          v-if="showBringForward"
          class="col-6"
          name="bringForwardState"
          label="Bring forward state"
          :options="BringForwardTypes"
        />
        <div
          v-else
          class="col-6"
        />
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
              @click="
                () => {
                  handleReset();
                  showBringForward = props.note?.noteType === NOTE_TYPES.BRING_FORWARD;
                  visible = false;
                }
              "
            />
          </div>
          <div
            v-if="props.note"
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
