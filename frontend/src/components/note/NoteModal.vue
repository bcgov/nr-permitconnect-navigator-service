<script setup lang="ts">
import { Form } from 'vee-validate';
import { mixed, object, string } from 'yup';

import { Calendar, Dropdown, InputText, TextArea } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { noteService } from '@/services';
import { BringForwardTypes, NoteTypes } from '@/utils/constants';
import { BRING_FORWARD_TYPES, NOTE_TYPES } from '@/utils/enums';

import type { Note } from '@/types';
import { nextTick, ref, watch } from 'vue';
import type { Ref } from 'vue';

// Props
type Props = {
  note?: Note;
  activityId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  note: undefined,
  activityId: undefined
});

// Emits
const emit = defineEmits(['note:delete', 'note:submit']);

// State
const visible = defineModel<boolean>('visible');
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const showBringForward: Ref<boolean> = ref(false);

// Default form values
let initialFormValues: any = {
  createdAt: new Date(),
  bringForwardDate: null,
  bringForwardState: null,
  note: props.note?.note,
  noteType: NOTE_TYPES.GENERAL
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

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: any, { resetForm }) {
  const parsedData = {
    ...data,
    createdAt: new Date(data.createdAt)
  };

  if (props.note) initialFormValues = parsedData;
  else resetForm();

  emit('note:submit', parsedData);
}

const onDelete = async () => {
  if (props.note?.noteId) {
    confirm.require({
      message: 'Please confirm that you want to delete the selected note.',
      header: 'Confirm delete',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      accept: async () => {
        try {
          if (props.note) {
            await noteService.deleteNote(props.note?.noteId);
            emit('note:delete', props.note.noteId);

            toast.success('Note deleted');
          }
        } catch (e) {
          toast.error('Failed to delete note');
        } finally {
          visible.value = false;
          formRef.value ? formRef.value.resetForm() : null;
        }
      }
    });
  }
};

const setShowBringForwardState = () => {
  formRef.value?.setFieldValue('bringForwardState', BRING_FORWARD_TYPES.UNRESOLVED);
  showBringForward.value = true;
};

const setHideBringForwardState = () => {
  showBringForward.value = false;
  formRef.value?.setFieldValue('bringForwardDate', null);
  formRef.value?.setFieldValue('bringForwardState', null);
};

const handleBringForward = (e: { OriginalEvent: Event; value: string }) => {
  if (e.value === NOTE_TYPES.BRING_FORWARD) {
    setShowBringForwardState();
  } else {
    setHideBringForwardState();
  }
};

watch(visible, (newValue) => {
  // nextTick triggers when modal becomes visible
  nextTick().then(() => {
    if (!newValue) {
      setHideBringForwardState();
      return;
    }

    // sets 'createdAt' to current time when modal is visible
    if (formRef.value) {
      formRef.value.setFieldValue('createdAt', new Date());

      // set form values if editing existing note
      if (props.note) {
        formRef.value.setFieldValue('noteId', props.note.noteId);
        formRef.value.setFieldValue('activityId', props.note.activityId);
        formRef.value.setFieldValue('bringForwardState', props.note.bringForwardState);
        formRef.value.setFieldValue('noteType', props.note.noteType);
        if (props.note.noteType === NOTE_TYPES.BRING_FORWARD) {
          setShowBringForwardState();
          formRef.value.setFieldValue(
            'bringForwardDate',
            props.note.bringForwardDate ? new Date(props.note.bringForwardDate) : null
          );
        }
        formRef.value.setFieldValue('note', props.note.note);
        formRef.value.setFieldValue('title', props.note.title);
      }
    }
  });
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
      <font-awesome-icon
        icon="fa-solid fa-plus"
        fixed-width
        class="mr-2"
      />
      <span class="p-dialog-title">Add note</span>
    </template>

    <Form
      ref="formRef"
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
          @on-change="(e) => handleBringForward(e)"
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
              @click="visible = false"
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
