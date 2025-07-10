<script setup lang="ts">
import { Form } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { mixed, object, string } from 'yup';

import { Checkbox, DatePicker, InputText, Select, TextArea } from '@/components/form';
import { Button, Dialog, Message, useConfirm, useToast } from '@/lib/primevue';
import { noteService } from '@/services';
import { BRING_FORWARD_TYPE_LIST, ESCALATION_TYPE_LIST, NOTE_TYPE_LIST } from '@/utils/constants/projectCommon';
import { NoteType } from '@/utils/enums/projectCommon';
import { formatDate, formatTime } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { NoteHistory } from '@/types';

// Props
const { activityId, noteHistory = undefined } = defineProps<{
  activityId: string;
  noteHistory?: NoteHistory;
}>();

// Emits
const emit = defineEmits(['addNote', 'updateNote', 'deleteNote']);

// Composables
const { t } = useI18n();

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const shownToProponent = computed(() => formRef.value?.values.shownToProponent);
const visible = defineModel<boolean>('visible');

// Default form values
let initialFormValues: any = {
  activityId: noteHistory?.activityId,
  bringForwardDate: noteHistory?.bringForwardDate ? new Date(noteHistory.bringForwardDate) : null,
  bringForwardState: noteHistory?.bringForwardState ?? null,
  shownToProponent: noteHistory?.shownToProponent,
  escalateToSupervisor: noteHistory?.escalateToSupervisor,
  escalateToDirector: noteHistory?.escalateToDirector,
  escalationType: noteHistory?.escalationType,
  noteHistoryId: noteHistory?.noteHistoryId,
  type: noteHistory?.type ?? NoteType.GENERAL,
  title: noteHistory?.title
};

// Form validation schema
const formSchema = object({
  bringForwardDate: mixed()
    .nullable()
    .when('type', {
      is: (type: string) => type === NoteType.BRING_FORWARD,
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
    .when('type', {
      is: (type: string) => type === NoteType.BRING_FORWARD,
      then: () => string().oneOf(BRING_FORWARD_TYPE_LIST),
      otherwise: () => mixed().nullable()
    })
    .label('Bring forward state'),
  note: string().label('Note'),
  type: string().oneOf(NOTE_TYPE_LIST).label('Note type'),
  title: string().required().max(255, 'Title too long').label('Title')
});

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete() {
  if (noteHistory) {
    confirm.require({
      message: t(shownToProponent.value ? 'noteModal.deleteMessageIfShown' : 'noteModal.deleteMessage'),
      header: t('noteModal.deleteHeader'),
      acceptLabel: t('noteModal.confirm'),
      acceptClass: 'p-button-danger',
      rejectLabel: t('noteModal.cancel'),
      rejectProps: { outlined: true },
      accept: () => {
        noteService
          .deleteNoteHistory(noteHistory?.noteHistoryId as string)
          .then(() => {
            emit('deleteNote', noteHistory as NoteHistory);
            toast.success(t('noteModal.noteDeleted'));
          })
          .catch((e: any) => toast.error(t('noteModal.noteDeleteFailed'), e.message))
          .finally(() => {
            visible.value = false;
            formRef.value?.resetForm();
          });
      }
    });
  }
}

async function onSubmit(data: any) {
  try {
    const body = data;

    // Force some data based on the type of note
    if (body.type === NoteType.BRING_FORWARD) {
      body.shownToProponent = false;
    } else {
      body.bringForwardDate = null;
      body.bringForwardState = null;
      body.escalateToSupervisor = false;
      body.escalateToDirector = false;
      body.escalationType = null;
    }

    if (!noteHistory) {
      const result = (await noteService.createNoteHistory({ ...body, activityId: activityId, note: data.note })).data;
      emit('addNote', result);
    } else {
      const result = (
        await noteService.updateNoteHistory(data.noteHistoryId, { ...body, activityId: activityId, note: data.note })
      ).data;
      emit('updateNote', result);
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
      <span class="p-dialog-title">{{ formRef?.values.type }}</span>
    </template>

    <Message
      v-if="shownToProponent"
      severity="success"
      :closable="false"
    >
      {{ t('noteModal.shownToProponentBanner') }}
    </Message>

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
            />
            <DatePicker
              v-if="values.type === NoteType.BRING_FORWARD"
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
              <span class="text-[var(--p-bcblue-900)]">
                {{ formatDate(noteHistory?.createdAt || new Date().toISOString()) }}
              </span>
            </div>
            <div class="flex flex-row gap-x-1">
              <span>{{ t('noteModal.lastUpdated') }}:</span>
              <span class="text-[var(--p-bcblue-900)]">{{ formatDate(noteHistory?.updatedAt) }}</span>
            </div>
            <div
              v-if="values.type === NoteType.GENERAL"
              class="flex flex-col"
            >
              <Checkbox
                name="shownToProponent"
                :label="t('noteModal.showProponent')"
                :bold="false"
              />
            </div>
            <div
              v-if="values.type === NoteType.BRING_FORWARD"
              class="flex flex-col"
            >
              <Checkbox
                name="escalateToSupervisor"
                :label="t('noteModal.escalateToSupervisor')"
                :bold="false"
              />
              <Checkbox
                name="escalateToDirector"
                :label="t('noteModal.escalateToDirector')"
                :bold="false"
              />
              <div
                v-if="values.escalateToSupervisor || values.escalateToDirector"
                class="flex flex-col"
              >
                <Select
                  name="escalationType"
                  label="Escalation type"
                  :options="ESCALATION_TYPE_LIST"
                />
              </div>
              <Select
                name="bringForwardState"
                label="Bring forward state"
                :options="BRING_FORWARD_TYPE_LIST"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-y-2 my-9">
        <div
          v-for="note in noteHistory?.note"
          :key="note.noteId"
          class="bg-[var(--p-bcblue-50)] p-2"
        >
          <div class="flex flex-row gap-x-1">
            <span class="text-[var(--p-bcblue-900)]">{{ formatDate(note.createdAt) }}:</span>
            {{ note.note }}
            <span class="text-[var(--p-greyscale-600)]">{{ formatTime(note.createdAt) }} {{ note.createdBy }}</span>
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
                visible = false;
              }
            "
          />
        </div>
        <div
          v-if="noteHistory"
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
