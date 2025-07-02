<script setup lang="ts">
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mixed, object, string } from 'yup';

import { Checkbox, DatePicker, InputText, Select, TextArea } from '@/components/form';
import { Button, Dialog, useConfirm, useToast } from '@/lib/primevue';
import { noteService } from '@/services';
import { BRING_FORWARD_TYPE_LIST, NOTE_TYPE_LIST } from '@/utils/constants/projectCommon';
import { BringForwardType, NoteType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Note } from '@/types';
import type { SelectChangeEvent } from 'primevue/select';
import { omit } from '@/utils/utils';

// Props
const { activityId, note = undefined } = defineProps<{
  activityId: string;
  note?: Note;
}>();

// Emits
const emit = defineEmits(['addNote', 'updateNote', 'deleteNote']);

// Composables
const { t } = useI18n();

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const header: Ref<string | undefined> = ref(note?.type);
const showBringForward: Ref<boolean> = ref(note?.type === NoteType.BRING_FORWARD);
const showProponentToggle: Ref<boolean> = ref(note?.type === NoteType.GENERAL);
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: any = {
  activityId: note?.activityId,
  bringForwardDate: note?.bringForwardDate ? new Date(note.bringForwardDate) : null,
  bringForwardState: note?.bringForwardState ?? null,
  createdAt: note?.createdAt ? new Date(note.createdAt) : new Date(),
  note: note?.note,
  noteId: note?.noteId,
  type: note?.type ?? NoteType.GENERAL,
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
  type: string().oneOf(NOTE_TYPE_LIST).label('Note type'),
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
  header.value = e.value;
  showBringForward.value = e.value === NoteType.BRING_FORWARD;
  showProponentToggle.value = e.value === NoteType.GENERAL;

  formRef.value?.setFieldValue('showToProponent', false);

  formRef.value?.setFieldValue('escalateToSupervisor', false);
  formRef.value?.setFieldValue('escalateToDirector', false);

  if (e.value === NoteType.BRING_FORWARD) {
    formRef.value?.setFieldValue('bringForwardState', BringForwardType.UNRESOLVED);
  } else {
    formRef.value?.setFieldValue('bringForwardDate', null);
    formRef.value?.setFieldValue('bringForwardState', null);
  }
};

// @ts-expect-error TS7031
// resetForm is an automatic binding https://vee-validate.logaretm.com/v4/guide/components/handling-forms/
async function onSubmit(data: any, { resetForm }) {
  try {
    if (!note) {
      const b = omit(data, ['createdAt']) as Note;
      const result = (await noteService.createNote({ ...b, activityId: activityId })).data;
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
      <span class="p-dialog-title">{{ header }} note</span>
    </template>

    <Form
      ref="formRef"
      v-slot="{ handleReset, values }"
      :initial-values="initialFormValues"
      :validation-schema="formSchema"
      @submit="onSubmit"
    >
      <div class="grid grid-cols-[3fr_1fr] gap-x-9 mt-4">
        <div class="flex flex-col gap-y-3">
          <div class="flex flex-row gap-x-3">
            <Select
              class="w-1/2"
              name="type"
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
              class="w-1/2"
              name="bringForwardDate"
              label="Bring forward date"
            />
          </div>
          <InputText
            name="title"
            label="Note title"
          />
          <TextArea
            name="note"
            label="Note"
          />
        </div>
        <div class="flex flex-col gap-y-9">
          <div class="bg-[var(--p-bcblue-50)]">
            <div class="flex flex-row gap-x-1">
              <span>{{ t('noteModal.created') }}:</span>
              <span class="text-[var(--p-bcblue-900)]">{{ formatDate(values.createdAt.toISOString()) }}</span>
            </div>
            <div class="flex flex-row gap-x-1">
              <span>{{ t('noteModal.lastUpdated') }}:</span>
              <!-- <span class="text-[var(--p-bcblue-900)]">{{ formatDate(values.updatedAt.toISOString()) }}</span> -->
            </div>
            <div
              v-if="showProponentToggle"
              class="flex flex-col"
            >
              <Checkbox
                name="shownToProponent"
                :label="t('noteModal.showProponent')"
                :bold="false"
              />
            </div>
            <div
              v-if="showBringForward"
              class="flex flex-col"
            >
              <Checkbox
                name="escalateToSupervisor"
                :label="t('noteModal.escalateSupervisor')"
                :bold="false"
              />
              <Checkbox
                name="escalateToDirector"
                :label="t('noteModal.escalateDirector')"
                :bold="false"
              />
              <Select
                name="bringForwardState"
                label="Bring forward state"
                :options="BRING_FORWARD_TYPE_LIST"
              />
            </div>
          </div>
        </div>
      </div>
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
    </Form>
  </Dialog>
</template>
