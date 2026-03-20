<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';

import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import { Button } from '@/lib/primevue';
import { useAppStore, useAuthZStore, useProjectStore } from '@/store';
import { Action, Resource } from '@/utils/enums/application';
import { projectNoteRouteNameKey } from '@/utils/keys';

import type { Ref } from 'vue';

// Injections
const projectNoteRouteName = inject(projectNoteRouteNameKey);

// Composables
const router = useRouter();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const projectStore = useProjectStore();
const { getProject, getProjectIsCompleted, getNoteHistory } = storeToRefs(projectStore);

// State
const noteHistoryCreatedByFullnames: Ref<{ noteHistoryId: string; createdByFullname: string }[]> = ref([]);

// Actions
function toEditNote(noteHistoryId: string) {
  router.push({
    name: projectNoteRouteName?.value,
    params: {
      noteHistoryId: noteHistoryId,
      projectId: getProject.value?.projectId
    }
  });
}
</script>
<template>
  <div>
    <div class="flex items-center pb-5">
      <div class="grow">
        <p class="font-bold">Notes ({{ getNoteHistory.length }})</p>
      </div>
      <Button
        aria-label="Add note"
        :disabled="getProjectIsCompleted || !useAuthZStore().can(getInitiative, Resource.NOTE, Action.CREATE)"
        @click="
          router.push({
            name: projectNoteRouteName,
            params: {
              projectId: getProject?.projectId
            }
          })
        "
      >
        <font-awesome-icon
          class="pr-2"
          icon="fa-solid fa-plus"
        />
        Add note
      </Button>
    </div>
    <div
      v-for="(noteHistory, index) in getNoteHistory"
      :key="noteHistory.noteHistoryId"
      :index="index"
      class="mb-6"
    >
      <NoteHistoryCard
        :editable="!getProjectIsCompleted"
        :note-history="noteHistory"
        :created-by-full-name="
          noteHistoryCreatedByFullnames.find((x) => x.noteHistoryId === noteHistory.noteHistoryId)?.createdByFullname
        "
        @edit-note-history="(e) => toEditNote(e)"
        @delete-note-history="(e) => projectStore.removeNoteHistory(e)"
        @update-note-history="(e) => projectStore.updateNoteHistory(e)"
      />
    </div>
  </div>
</template>
