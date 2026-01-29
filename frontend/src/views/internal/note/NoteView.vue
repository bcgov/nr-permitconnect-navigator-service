<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteForm from '@/components/note/NoteForm.vue';
import { useToast } from '@/lib/primevue';
import { electrificationProjectService, enquiryService, housingProjectService, noteHistoryService } from '@/services';
import { useAppStore, useEnquiryStore, useProjectStore } from '@/store';
import { Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { enquiryServiceKey, projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';

const {
  enquiryId = undefined,
  projectId = undefined,
  noteHistoryId = undefined
} = defineProps<{
  enquiryId?: string;
  projectId?: string;
  noteHistoryId?: string;
}>();

// State
const activityId: Ref<string | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);

// Composables
const { t } = useI18n();
const toast = useToast();
const enquiryStore = useEnquiryStore();
const projectStore = useProjectStore();

// Store
const { getEnquiry } = storeToRefs(enquiryStore);
const { getProject } = storeToRefs(projectStore);

const provideResource: Ref<Resource> = ref(Resource.HOUSING_PROJECT);
const provideProjectRouteNameKey: Ref<RouteName> = ref(RouteName.INT_HOUSING_PROJECT);
const provideProjectServiceKey: Ref<IDraftableProjectService> = ref(housingProjectService);

provide(resourceKey, provideResource);
provide(projectRouteNameKey, provideProjectRouteNameKey);
provide(projectServiceKey, provideProjectServiceKey);
provide(enquiryServiceKey, enquiryService);

onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        provideProjectServiceKey.value = electrificationProjectService;
        if (projectId) {
          provideResource.value = Resource.ELECTRIFICATION_PROJECT;
          provideProjectRouteNameKey.value = RouteName.INT_ELECTRIFICATION_PROJECT;
        }
        if (enquiryId) {
          provideResource.value = Resource.ENQUIRY;
          provideProjectRouteNameKey.value = RouteName.INT_ELECTRIFICATION_ENQUIRY;
        }
        break;
      case Initiative.HOUSING:
        provideProjectServiceKey.value = housingProjectService;
        if (projectId) {
          provideResource.value = Resource.HOUSING_PROJECT;
          provideProjectRouteNameKey.value = RouteName.INT_HOUSING_PROJECT;
        }
        if (enquiryId) {
          provideResource.value = Resource.ENQUIRY;
          provideProjectRouteNameKey.value = RouteName.INT_HOUSING_ENQUIRY;
        }
        break;
    }

    if (!getProject.value && provideProjectServiceKey.value && projectId) {
      const project = (await provideProjectServiceKey.value.getProject(projectId)).data;
      projectStore.setProject(project);
    }
    if (!getEnquiry.value && enquiryId) {
      const enquiry = (await enquiryService.getEnquiry(enquiryId)).data;
      enquiryStore.setEnquiry(enquiry);
    }

    activityId.value = getProject.value?.activityId || getEnquiry.value?.activityId;

    if (noteHistoryId && activityId.value) {
      const noteHistory = (await noteHistoryService.listNoteHistories(activityId.value)).data;

      if (projectId) projectStore.setNoteHistory(noteHistory);
      if (enquiryId) enquiryStore.setNoteHistory(noteHistory);
    }

    loading.value = false;
  } catch {
    toast.error(t('note.noteView.noteLoadError'));
  }
});
</script>

<template>
  <div v-if="!loading">
    <NoteForm
      v-if="projectId"
      :note-history="projectStore.getNoteHistoryById(noteHistoryId)"
      :editable="getProject?.applicationStatus !== ApplicationStatus.COMPLETED"
    />
    <NoteForm
      v-if="enquiryId"
      :note-history="enquiryStore.getNoteHistoryById(noteHistoryId)"
      :editable="getEnquiry?.enquiryStatus !== ApplicationStatus.COMPLETED"
    />
  </div>
</template>
