<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteForm from '@/components/note/NoteForm.vue';
import { electrificationProjectService, enquiryService, housingProjectService, noteHistoryService } from '@/services';
import { useAppStore, useEnquiryStore, useProjectStore } from '@/store';
import { Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { enquiryRouteNameKey, projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Props
const {
  enquiryId = undefined,
  projectId = undefined,
  noteHistoryId = undefined
} = defineProps<{
  enquiryId?: string;
  projectId?: string;
  noteHistoryId?: string;
}>();

// Interfaces
interface InitiativeState {
  enquiryRouteName?: RouteName;
  projectRouteName?: RouteName;
  projectService: IDraftableProjectService;
  resource: Resource;
}

// Constants
const ELECTRIFICATION_INITIATIVE_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_ELECTRIFICATION_ENQUIRY,
  projectService: electrificationProjectService,
  resource: Resource.ENQUIRY
};

const ELECTRIFICATION_INITIATIVE_PROJECT_STATE: InitiativeState = {
  projectRouteName: RouteName.INT_ELECTRIFICATION_PROJECT,
  projectService: electrificationProjectService,
  resource: Resource.ELECTRIFICATION_PROJECT
};

const HOUSING_INITIATIVE_PROJECT_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_HOUSING_ENQUIRY,
  projectService: housingProjectService,
  resource: Resource.ENQUIRY
};

const HOUSING_INITIATIVE_PROJECT_PROJECT_STATE: InitiativeState = {
  projectRouteName: RouteName.INT_HOUSING_PROJECT,
  projectService: housingProjectService,
  resource: Resource.HOUSING_PROJECT
};

// State
const activityId: Ref<string | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_PROJECT_PROJECT_STATE);

// Composables
const { t } = useI18n();
const enquiryStore = useEnquiryStore();
const projectStore = useProjectStore();

// Store
const { getEnquiry } = storeToRefs(enquiryStore);
const { getProject } = storeToRefs(projectStore);

// Providers
const provideEnquiryRouteName = computed(() => initiativeState.value.enquiryRouteName);
const provideProjectRouteName = computed(() => initiativeState.value.projectRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
const provideResource = computed(() => initiativeState.value.resource);
provide(resourceKey, provideResource);
provide(enquiryRouteNameKey, provideEnquiryRouteName);
provide(projectRouteNameKey, provideProjectRouteName);
provide(projectServiceKey, provideProjectService);

onBeforeMount(async () => {
  try {
    if (projectId && enquiryId) throw new Error(t('views.i.noteView.tooManyProps'));

    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = projectId
          ? ELECTRIFICATION_INITIATIVE_PROJECT_STATE
          : ELECTRIFICATION_INITIATIVE_ENQUIRY_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = projectId
          ? HOUSING_INITIATIVE_PROJECT_PROJECT_STATE
          : HOUSING_INITIATIVE_PROJECT_ENQUIRY_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    if (!getProject.value && initiativeState.value.projectService && projectId) {
      const project = (await initiativeState.value.projectService.getProject(projectId)).data;
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
  } catch (e) {
    generalErrorHandler(e, t('views.i.noteView.noteLoadError'));
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
