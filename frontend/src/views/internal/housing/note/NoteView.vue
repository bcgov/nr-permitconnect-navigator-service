<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteForm from '@/components/note/NoteForm.vue';
import { useToast } from '@/lib/primevue';
import { housingProjectService, noteHistoryService, permitService } from '@/services';
import { useNoteHistoryStore, usePermitStore, useProjectStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { NoteHistory } from '@/types';

const { projectId, noteHistoryId } = defineProps<{
  projectId: string;
  noteHistoryId?: string;
}>();

// State
const activityId: Ref<string> = ref('');
const loading: Ref<boolean> = ref(true);

// Composables
const { t } = useI18n();
const toast = useToast();
const noteHistoryStore = useNoteHistoryStore();
const permitStore = usePermitStore();
const projectStore = useProjectStore();

// Store
const { getPermit } = storeToRefs(permitStore);
const { getProject, getNoteHistory } = storeToRefs(projectStore);
// const { getCurrentNoteHistory } = storeToRefs(useNoteHistoryStore());

// Providers
provide(projectRouteNameKey, RouteName.INT_HOUSING_PROJECT);
provide(projectServiceKey, housingProjectService);

onBeforeMount(async () => {
  try {
    if (!getProject.value) {
      const project = (await housingProjectService.getProject(projectId)).data;
      projectStore.setProject(project);
    }
    if (getProject.value?.activityId) {
      activityId.value = getProject.value.activityId;
    }
    // if (!noteHistoryId) {
    //   permitStore.reset();
    // } else {
    if (noteHistoryId) {
      const noteHistory = (await noteHistoryService.listNoteHistories(activityId.value)).data;
      projectStore.setNoteHistory(noteHistory);
      noteHistoryStore.setNoteHistory(noteHistory.find((nh: NoteHistory) => nh.noteHistoryId === noteHistoryId));
    } else {
      noteHistoryStore.reset();
    }
    // }
    loading.value = false;
  } catch {
    toast.error(t('i.housing.authorization.authorizationView.projectPermitLoadError'));
  }
});
</script>

<template>
  <div v-if="!loading">
    <!-- <NoteForm :editable="getProject?.applicationStatus !== ApplicationStatus.COMPLETED" /> -->
    <NoteForm :note-history="noteHistoryStore.getNoteHistory" />
  </div>
</template>
