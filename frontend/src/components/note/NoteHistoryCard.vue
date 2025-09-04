<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteHistoryModal from '@/components/note/NoteHistoryModal.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { Button, Card, Divider } from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore, useCodeStore, useAuthZStore } from '@/store';
import { Action, Resource } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { NoteHistory } from '@/types';

// Props
const {
  editable = true,
  noteHistory,
  createdByFullName = undefined
} = defineProps<{
  editable?: boolean;
  noteHistory: NoteHistory;
  createdByFullName?: string;
}>();

// Emits
const emit = defineEmits(['editNoteHistory', 'updateNoteHistory', 'deleteNoteHistory']);

// Store
const appStore = useAppStore();

// State
const noteHistoryModalVisible: Ref<boolean> = ref(false);
const userName: Ref<string | undefined> = ref(createdByFullName);

// Composables
const { t } = useI18n();
const { options } = useCodeStore();

// Actions
const getEscalationLabel = computed(() => (type: string) => {
  return options.EscalationType.find((e) => e.value === type)?.label;
});

onBeforeMount(() => {
  if (!userName.value && noteHistory.createdBy) {
    userService.searchUsers({ userId: [noteHistory.createdBy] }).then((res) => {
      userName.value = res?.data.length ? res?.data[0].fullName : '';
    });
  }
});
</script>

<template>
  <Card :id="noteHistory.noteHistoryId">
    <template #title>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <h3
            class="cursor-pointer truncate max-w-[50ch] inline-block hover:underline"
            :disabled="!editable || !useAuthZStore().can(appStore.getInitiative, Resource.NOTE, Action.UPDATE)"
            @click="noteHistoryModalVisible = true"
          >
            {{ noteHistory.title }}
          </h3>
          <Divider
            v-if="noteHistory.bringForwardState"
            layout="vertical"
            class="h-7 border-l border-[var(--p-greyscale-700)]"
          />
          <h3
            v-if="noteHistory.bringForwardState"
            data-test="bf-title"
          >
            {{ `${noteHistory.bringForwardState}` }}
          </h3>
          <Divider
            v-if="noteHistory.escalationType"
            layout="vertical"
            class="h-7 border-l border-[var(--p-greyscale-700)]"
          />
          <h3
            v-if="noteHistory.escalationType"
            data-test="bf-title"
          >
            {{ `${getEscalationLabel(noteHistory.escalationType)}` }}
          </h3>
        </div>
        <StatusPill
          v-if="noteHistory.shownToProponent"
          :status="t('note.noteHistoryCard.shownToProponent')"
          :bg-color="'var(--p-gold-600)'"
          :icon="'fa-solid fa-eye'"
        />
        <StatusPill
          v-if="noteHistory.escalateToDirector || noteHistory.escalateToSupervisor"
          :status="t('note.noteHistoryCard.escalated')"
          :bg-color="'var(--p-red-400)'"
          :icon="'fa-solid fa-exclamation'"
          :content-color="'var(--p-red-50)'"
        />
      </div>
    </template>
    <template #content>
      <div class="flex flex-row">
        <p>
          <span class="key">{{ t('note.noteHistoryCard.created') }}:</span>
          {{ formatDate(noteHistory.createdAt) }}
        </p>
        <Divider layout="vertical" />
        <p>
          <span class="key">{{ t('note.noteHistoryCard.lastUpdated') }}:</span>
          {{ noteHistory.updatedAt ? formatDate(noteHistory.updatedAt) : formatDate(noteHistory.createdAt) }}
        </p>
        <Divider
          v-if="noteHistory.bringForwardDate"
          layout="vertical"
        />
        <p v-if="noteHistory.bringForwardDate">
          <span class="key">{{ t('note.noteHistoryCard.bringForward') }}:</span>
          {{
            noteHistory.updatedAt ? formatDate(noteHistory.bringForwardDate) : formatDate(noteHistory.bringForwardDate)
          }}
        </p>
        <Divider layout="vertical" />
        <p>
          <span class="key">{{ t('note.noteHistoryCard.author') }}:</span>
          {{ userName }}
        </p>
      </div>
      <div class="mt-4 flex justify-between items-center">
        <p class="note-content truncate max-w-[145ch] text-base sm:text-md">{{ noteHistory.note[0].note }}</p>
        <Button
          class="p-button-outlined"
          aria-label="Edit"
          :disabled="!editable || !useAuthZStore().can(appStore.getInitiative, Resource.NOTE, Action.UPDATE)"
          @click="emit('editNoteHistory', noteHistory.noteHistoryId)"
        >
          <font-awesome-icon
            class="pr-2"
            icon="fa-solid fa-edit"
          />
          Edit
        </Button>
      </div>
    </template>
  </Card>

  <NoteHistoryModal
    v-if="noteHistory && noteHistoryModalVisible"
    v-model:visible="noteHistoryModalVisible"
    :activity-id="noteHistory.activityId"
    :note-history="noteHistory"
    @delete-note-history="
      (history: NoteHistory) => {
        emit('deleteNoteHistory', history);
      }
    "
    @update-note-history="(history: NoteHistory) => emit('updateNoteHistory', history)"
  />
</template>

<style scoped lang="scss">
p {
  margin-top: 0;
  margin-bottom: 0;
}

.key {
  color: #38598a;
}
</style>
