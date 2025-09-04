<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Form } from 'vee-validate';
import { inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { object, string, mixed } from 'yup';

import Banner from '@/components/common/Banner.vue';
import Divider from '@/components/common/Divider.vue';
import { Button, Card, useConfirm, ToggleSwitch, useToast } from '@/lib/primevue';
import { userService } from '@/services';
import { useAuthZStore, useProjectStore } from '@/store';
import { GroupName } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';
import { projectRouteNameKey } from '@/utils/keys';
import { scrollToFirstError } from '@/utils/utils';

import { Checkbox, DatePicker, InputText, Select, TextArea } from '@/components/form';
import { noteHistoryService } from '@/services';
import { useCodeStore } from '@/store';
import { BRING_FORWARD_TYPE_LIST, NOTE_TYPE_LIST } from '@/utils/constants/projectCommon';
import { BringForwardType, NoteType } from '@/utils/enums/projectCommon';
import { formatTime } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { User } from '@/types';
import type { SelectChangeEvent } from 'primevue/select';
import type { NoteHistory } from '@/types';

// Props
const { noteHistory = undefined } = defineProps<{
  noteHistory?: NoteHistory;
}>();

// Composables
const { t } = useI18n();
const authzStore = useAuthZStore();
const confirmDialog = useConfirm();
const projectStore = useProjectStore();
const router = useRouter();
const toast = useToast();
const { options } = useCodeStore();

// Store
const { getProject } = storeToRefs(projectStore);

// State
const formRef: Ref<InstanceType<typeof Form> | null> = ref(null);
const initialFormValues: Ref<any | undefined> = ref(undefined);
const visible = defineModel<boolean>('visible');
const shownToProponent: Ref<boolean> = ref(false);
const createdByFullNames: Ref<Record<string, string>> = ref({});

// Providers
const projectRouteName = inject(projectRouteNameKey);

// Actions

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

function initializeFormValues() {
  if (noteHistory) {
    initialFormValues.value = {
      activityId: noteHistory?.activityId,
      bringForwardDate: noteHistory?.bringForwardDate ? new Date(noteHistory.bringForwardDate) : null,
      bringForwardState: noteHistory?.bringForwardState ?? null,
      escalateToSupervisor: noteHistory?.escalateToSupervisor,
      escalateToDirector: noteHistory?.escalateToDirector,
      escalationType: noteHistory?.escalationType,
      noteHistoryId: noteHistory?.noteHistoryId,
      type: noteHistory?.type ?? NoteType.GENERAL,
      title: noteHistory?.title
    };
    shownToProponent.value = noteHistory.shownToProponent;
  }
}

function onInvalidSubmit(e: any) {
  scrollToFirstError(e.errors);
}

function onDelete() {
  if (noteHistory) {
    confirmDialog.require({
      message: t(shownToProponent.value ? 'noteHistoryModal.deleteMessageIfShown' : 'noteHistoryModal.deleteMessage'),
      header: t('noteHistoryModal.deleteHeader'),
      acceptLabel: t('noteHistoryModal.confirm'),
      acceptClass: 'p-button-danger',
      rejectLabel: t('noteHistoryModal.cancel'),
      rejectProps: { outlined: true },
      accept: () => {
        noteHistoryService
          .deleteNoteHistory(noteHistory?.noteHistoryId as string)
          .then(() => {
            toast.success(t('noteHistoryModal.noteDeleted'));
            toTheProject();
          })
          .catch((e: any) => toast.error(t('noteHistoryModal.noteDeleteFailed'), e.message));
      }
    });
  }
}

async function onSubmit(data: any) {
  try {
    const body = { ...data };

    // Force some data based on the type of note
    if (body.type === NoteType.BRING_FORWARD) {
      body.shownToProponent = false;
      if (!body.escalateToSupervisor && !body.escalateToDirector) body.escalationType = null;
    } else {
      body.bringForwardDate = null;
      body.bringForwardState = null;
      body.escalateToSupervisor = false;
      body.escalateToDirector = false;
      body.escalationType = null;
      body.shownToProponent = shownToProponent.value;
    }

    if (!noteHistory) {
      await noteHistoryService.createNoteHistory({
        ...body,
        activityId: getProject.value?.activityId,
        note: data.note
      });
    } else {
      await noteHistoryService.updateNoteHistory(data.noteHistoryId, {
        ...body,
        activityId: getProject.value?.activityId,
        note: data.note
      });
    }
    toast.success(t('noteHistoryModal.noteSaved'));
    toTheProject();
  } catch (e: any) {
    toast.error(t('noteHistoryModal.noteSaveFailed'), e.message);
  } finally {
    visible.value = false;
  }
}

function onTypeChange(e: SelectChangeEvent) {
  if (e.value === NoteType.BRING_FORWARD) {
    formRef.value?.setFieldValue('bringForwardState', BringForwardType.UNRESOLVED);
  }
}

async function fetchCreatedBy() {
  const userIds = Array.from(new Set(noteHistory?.note.map((n) => n.createdBy).filter(Boolean))) as [];
  const users = (await userService.searchUsers({ userId: userIds })).data;
  users.forEach((u: User) => {
    createdByFullNames.value[u.userId] = u.fullName;
  });
}

function toTheProject() {
  router.push({
    name: projectRouteName,
    params: { projectId: getProject.value?.projectId },
    query: {
      initialTab: '3'
    }
  });
}

onBeforeMount(async () => {
  initializeFormValues();
  if (noteHistory) {
    fetchCreatedBy();
  }
});
</script>

<template>
  <div class="flex flex-row gap-x-3 my-4">
    <div class="flex flex-row gap-x-1">
      <span class="text-[var(--p-bcblue-900)]">{{ t('noteHistoryModal.created') }}:</span>
      <span>
        {{ formatDate(noteHistory?.createdAt || new Date().toISOString()) }}
      </span>
    </div>
    <div class="flex flex-row gap-x-1">
      <span class="text-[var(--p-bcblue-900)]">{{ t('noteHistoryModal.lastUpdated') }}:</span>
      <span>{{ formatDate(noteHistory?.updatedAt) }}</span>
    </div>
  </div>
  <Banner
    v-if="shownToProponent"
    class="mt-5 mb-8"
    :content="t('note.noteForm.shownToPropBanner')"
  />
  <Form
    ref="formRef"
    v-slot="{ values }"
    :initial-values="initialFormValues"
    :validation-schema="formSchema"
    @invalid-submit="onInvalidSubmit"
    @submit="onSubmit"
  >
    <input
      type="hidden"
      name="noteHistoryId"
    />
    <Card>
      <template #content>
        <div class="grid grid-cols-[3fr_1fr] gap-x-9 mt-4">
          <div class="flex flex-col gap-y-3">
            <div class="flex flex-row gap-x-3">
              <Select
                class="w-1/2"
                name="type"
                label="Note type"
                :options="NOTE_TYPE_LIST"
                @on-change="onTypeChange"
              />
              <InputText
                class="w-1/2"
                name="title"
                label="Note title"
              />
            </div>

            <TextArea
              name="note"
              label="Note"
            />
          </div>

          <div class="flex">
            <Divider layout="vertical" />
            <div class="flex flex-col gap-y-9 mx-5">
              <div>
                <div
                  v-if="values.type === NoteType.GENERAL"
                  class="flex flex-col gap-y-4"
                >
                  <span class="font-bold">{{ t('noteHistoryModal.showProponent') }}</span>
                  <ToggleSwitch
                    v-model="shownToProponent"
                    class="mr-1"
                    name="shownToProponent"
                    :label="t('noteHistoryModal.showProponent')"
                  />
                </div>

                <div
                  v-if="values.type === NoteType.BRING_FORWARD"
                  class="grid grid-cols-1 gap-y-1"
                >
                  <Checkbox
                    v-if="authzStore.isInGroup([GroupName.NAVIGATOR, GroupName.NAVIGATOR_READ_ONLY])"
                    name="escalateToSupervisor"
                    :label="t('noteHistoryModal.escalateToSupervisor')"
                    :bold="false"
                  />
                  <Checkbox
                    v-if="authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER, GroupName.SUPERVISOR])"
                    name="escalateToDirector"
                    :label="t('noteHistoryModal.escalateToDirector')"
                    :bold="false"
                  />
                  <DatePicker
                    v-if="values.type === NoteType.BRING_FORWARD"
                    class="my-2"
                    name="bringForwardDate"
                    label="Bring forward date"
                  />
                  <div
                    v-if="values.escalateToSupervisor || values.escalateToDirector"
                    class="flex flex-col"
                  >
                    <Select
                      name="escalationType"
                      label="Escalation type"
                      option-label="label"
                      option-value="value"
                      :options="options.EscalationType"
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
        </div>
      </template>
    </Card>
    <div class="field flex">
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
              toTheProject();
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
  <div class="flex flex-col gap-y-2 my-9">
    <div
      v-for="note in noteHistory?.note"
      :key="note.noteId"
      class="bg-[var(--p-bcblue-50)] p-4"
    >
      <div class="flex flex-row gap-x-2">
        <span class="text-[var(--p-bcblue-900)]">{{ formatDate(note.createdAt) }}:</span>
        {{ note.note }}
        <span class="text-[var(--p-greyscale-600)]">
          {{ formatTime(note.createdAt) }}
          <span v-if="note.createdBy">{{ createdByFullNames[note.createdBy] }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
