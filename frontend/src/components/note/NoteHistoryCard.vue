<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import Divider from '@/components/common/Divider.vue';
import NoteHistoryModal from '@/components/note/NoteHistoryModal.vue';
import { Button, Card } from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { Action, Resource } from '@/utils/enums/application';
import { formatDate, formatDateShort } from '@/utils/formatters';

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
const emit = defineEmits(['updateNoteHistory', 'deleteNoteHistory']);

// Store
const appStore = useAppStore();

// State
const noteModalVisible: Ref<boolean> = ref(false);
const userName: Ref<string | undefined> = ref(createdByFullName);

// Actions
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
      <div class="flex items-center">
        <div class="grow">
          <h3 class="mb-0">
            {{ noteHistory.title }}
            <span
              v-if="noteHistory.bringForwardState"
              data-test="bf-title"
            >
              {{ `(${noteHistory.bringForwardState})` }}
            </span>
          </h3>
        </div>
        <Button
          class="p-button-outlined"
          aria-label="Edit"
          :disabled="!editable || !useAuthZStore().can(appStore.getInitiative, Resource.NOTE, Action.UPDATE)"
          @click="noteModalVisible = true"
        >
          <font-awesome-icon
            class="pr-2"
            icon="fa-solid fa-edit"
          />
          Edit
        </Button>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-4 gap-4">
        <p>
          <span class="key font-bold">Date:</span>
          {{ formatDateShort(noteHistory.createdAt) }}
        </p>
        <p>
          <span class="key font-bold">Author:</span>
          {{ userName }}
        </p>
        <p>
          <span class="key font-bold">Note type:</span>
          {{ noteHistory.type }}
        </p>
        <div>
          <p v-if="noteHistory.bringForwardDate">
            <span class="key font-bold">Bring forward date:</span>
            {{ noteHistory.bringForwardDate ? formatDate(noteHistory.bringForwardDate) : '' }}
          </p>
        </div>
        <p class="col-span-12 mt-0 mb-0 note-content">{{ noteHistory.note[0].note }}</p>
      </div>
    </template>
  </Card>

  <NoteHistoryModal
    v-if="noteHistory && noteModalVisible"
    v-model:visible="noteModalVisible"
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

.note-content {
  white-space: pre;
  text-wrap: balance;
}
</style>
