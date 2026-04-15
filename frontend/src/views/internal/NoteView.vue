<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteForm from '@/components/note/NoteForm.vue';
import {
  electrificationProjectService,
  enquiryService,
  generalProjectService,
  housingProjectService,
  noteHistoryService
} from '@/services';
import { useAppStore, useEnquiryStore, useProjectStore } from '@/store';
import { Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import {
  enquiryRouteNameKey,
  projectEnquiryRouteNameKey,
  projectRouteNameKey,
  projectServiceKey,
  resourceKey
} from '@/utils/keys';
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
  projectEnquiryRouteName?: RouteName;
  projectService: IDraftableProjectService;
  resource: Resource;
}

// Constants

/**
 * Notes are slightly complicated. There are possible 3 entry points (in order of code priority)
 *  - Enquiries related to a project
 *  - Enquiries
 *  - Projects
 * Each entry point must be taken into account in order to do correct return navigation and keep the breadcrumb intact
 */
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

const ELECTRIFICATION_INITIATIVE_PROJECT_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_ELECTRIFICATION_ENQUIRY,
  projectService: electrificationProjectService,
  projectEnquiryRouteName: RouteName.INT_ELECTRIFICATION_PROJECT_ENQUIRY,
  resource: Resource.ENQUIRY
};

const GENERAL_INITIATIVE_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_GENERAL_ENQUIRY,
  projectService: generalProjectService,
  resource: Resource.ENQUIRY
};

const GENERAL_INITIATIVE_PROJECT_STATE: InitiativeState = {
  projectRouteName: RouteName.INT_GENERAL_PROJECT,
  projectService: generalProjectService,
  resource: Resource.GENERAL_PROJECT
};

const GENERAL_INITIATIVE_PROJECT_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_GENERAL_ENQUIRY,
  projectService: generalProjectService,
  projectEnquiryRouteName: RouteName.INT_GENERAL_PROJECT_ENQUIRY,
  resource: Resource.ENQUIRY
};

const HOUSING_INITIATIVE_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_HOUSING_ENQUIRY,
  projectService: housingProjectService,
  resource: Resource.ENQUIRY
};

const HOUSING_INITIATIVE_PROJECT_STATE: InitiativeState = {
  projectRouteName: RouteName.INT_HOUSING_PROJECT,
  projectService: housingProjectService,
  resource: Resource.HOUSING_PROJECT
};

const HOUSING_INITIATIVE_PROJECT_ENQUIRY_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_HOUSING_ENQUIRY,
  projectService: housingProjectService,
  projectEnquiryRouteName: RouteName.INT_HOUSING_PROJECT_ENQUIRY,
  resource: Resource.ENQUIRY
};

// State
const activityId: Ref<string | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_PROJECT_STATE);

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
const provideProjectEnquiryRouteName = computed(() => initiativeState.value.projectEnquiryRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
const provideResource = computed(() => initiativeState.value.resource);
provide(resourceKey, provideResource);
provide(enquiryRouteNameKey, provideEnquiryRouteName);
provide(projectRouteNameKey, provideProjectRouteName);
provide(projectEnquiryRouteNameKey, provideProjectEnquiryRouteName);
provide(projectServiceKey, provideProjectService);

// Actions
const getState = (
  projectState: InitiativeState,
  enquiryState: InitiativeState,
  projectEnquiryState: InitiativeState
): InitiativeState => {
  if (projectId && enquiryId) return projectEnquiryState;
  if (enquiryId) return enquiryState;
  return projectState;
};

onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = getState(
          ELECTRIFICATION_INITIATIVE_PROJECT_STATE,
          ELECTRIFICATION_INITIATIVE_ENQUIRY_STATE,
          ELECTRIFICATION_INITIATIVE_PROJECT_ENQUIRY_STATE
        );
        break;
      case Initiative.GENERAL:
        initiativeState.value = getState(
          GENERAL_INITIATIVE_PROJECT_STATE,
          GENERAL_INITIATIVE_ENQUIRY_STATE,
          GENERAL_INITIATIVE_PROJECT_ENQUIRY_STATE
        );
        break;
      case Initiative.HOUSING:
        initiativeState.value = getState(
          HOUSING_INITIATIVE_PROJECT_STATE,
          HOUSING_INITIATIVE_ENQUIRY_STATE,
          HOUSING_INITIATIVE_PROJECT_ENQUIRY_STATE
        );
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

    activityId.value = getEnquiry.value?.activityId || getProject.value?.activityId;

    if (noteHistoryId && activityId.value) {
      const noteHistory = (await noteHistoryService.listNoteHistories(activityId.value)).data;

      if (enquiryId) enquiryStore.setNoteHistory(noteHistory);
      else if (projectId) projectStore.setNoteHistory(noteHistory);
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
      v-if="(projectId && enquiryId) || enquiryId"
      :note-history="enquiryStore.getNoteHistoryById(noteHistoryId)"
      :editable="getEnquiry?.enquiryStatus !== ApplicationStatus.COMPLETED"
    />
    <NoteForm
      v-else-if="projectId"
      :note-history="projectStore.getNoteHistoryById(noteHistoryId)"
      :editable="getProject?.applicationStatus !== ApplicationStatus.COMPLETED"
    />
  </div>
</template>
