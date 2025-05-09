<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import Divider from '@/components/common/Divider.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import { Button, Card } from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { Action, Resource } from '@/utils/enums/application';
import { formatDate, formatDateShort } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Note } from '@/types';

// Props
const { editable = true, note } = defineProps<{
  editable?: boolean;
  note: Note;
}>();

// Emits
const emit = defineEmits(['updateNote', 'deleteNote']);

// Store
const appStore = useAppStore();

// State
const noteModalVisible: Ref<boolean> = ref(false);
const userName: Ref<string> = ref('');

// Actions
onBeforeMount(() => {
  if (note.createdBy) {
    userService.searchUsers({ userId: [note.createdBy] }).then((res) => {
      userName.value = res?.data.length ? res?.data[0].fullName : '';
    });
  }
});
</script>

<template>
  <Card :id="note.noteId">
    <template #title>
      <div class="flex items-center">
        <div class="grow">
          <h3 class="mb-0">
            {{ note.title }}
            <span
              v-if="note.bringForwardState"
              data-test="bf-title"
            >
              {{ `(${note.bringForwardState})` }}
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
      <div class="grid grid-cols-12 gap-4 nested-grid">
        <!-- Left column -->
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Date:</span>
              {{ note.createdAt ? formatDateShort(note.createdAt) : undefined }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Author:</span>
              {{ userName }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Note type:</span>
              {{ note.noteType }}
            </p>
          </div>
        </div>
        <div
          v-if="note.bringForwardDate"
          class="col-span-12 md:col-span-6 lg:col-span-3"
        >
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Bring forward date:</span>
              {{ note.bringForwardDate ? formatDate(note.bringForwardDate) : '' }}
            </p>
          </div>
        </div>
        <p class="col-span-12 mt-0 mb-0 note-content">{{ note.note }}</p>
      </div>
    </template>
  </Card>

  <NoteModal
    v-if="note && noteModalVisible"
    v-model:visible="noteModalVisible"
    :activity-id="note.activityId"
    :note="note"
    @delete-note="
      (note: Note) => {
        emit('deleteNote', note);
      }
    "
    @update-note="(oldNote: Note, newNote: Note) => emit('updateNote', oldNote, newNote)"
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
