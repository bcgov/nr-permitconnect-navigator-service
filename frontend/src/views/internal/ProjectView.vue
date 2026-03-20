<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useRouter } from 'vue-router';

import ProjectAuthorizationsTab from '@/components/projectCommon/ProjectAuthorizationsTab.vue';
import ProjectEnquiryTab from '@/components/projectCommon/ProjectEnquiryTab.vue';
import ProjectFilesTab from '@/components/projectCommon/ProjectFilesTab.vue';
import ProjectInformationTab from '@/components/projectCommon/ProjectInformationTab.vue';
import ProjectNotesTab from '@/components/projectCommon/ProjectNotesTab.vue';
import ProjectRoadmapTab from '@/components/projectCommon/ProjectRoadmapTab.vue';
import ProjectTeamTab from '@/components/projectCommon/ProjectTeamTab.vue';
import { Button, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import {
  activityContactService,
  documentService,
  electrificationProjectService,
  enquiryService,
  generalProjectService,
  housingProjectService,
  noteHistoryService,
  permitService,
  roadmapService,
  userService
} from '@/services';
import { useAppStore, useAuthZStore, usePermitStore, useProjectStore } from '@/store';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import {
  projectAuthorizationRouteNameKey,
  projectNoteRouteNameKey,
  projectServiceKey,
  updateLiveNameKey
} from '@/utils/keys';
import { generalErrorHandler, getFilenameAndExtension } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';
import type { Document, Enquiry, User } from '@/types';

// Props
const { initialTab = '0', projectId } = defineProps<{
  initialTab?: string;
  projectId: string;
}>();

// Interfaces
interface InitiativeState {
  projectAddAuthorizationRouteName: RouteName;
  projectAuthorizationRouteName: RouteName;
  projectNoteRouteName: RouteName;
  projectProponentName: RouteName;
  projectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  projectAddAuthorizationRouteName: RouteName.INT_ELECTRIFICATION_PROJECT_ADD_AUTHORIZATION,
  projectAuthorizationRouteName: RouteName.INT_ELECTRIFICATION_PROJECT_AUTHORIZATION,
  projectNoteRouteName: RouteName.INT_ELECTRIFICATION_PROJECT_NOTE,
  projectProponentName: RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT,
  projectService: electrificationProjectService
};

const GENERAL_INITIATIVE_STATE: InitiativeState = {
  projectAddAuthorizationRouteName: RouteName.INT_GENERAL_PROJECT_ADD_AUTHORIZATION,
  projectAuthorizationRouteName: RouteName.INT_GENERAL_PROJECT_AUTHORIZATION,
  projectNoteRouteName: RouteName.INT_GENERAL_PROJECT_NOTE,
  projectProponentName: RouteName.INT_GENERAL_PROJECT_PROPONENT,
  projectService: generalProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  projectAddAuthorizationRouteName: RouteName.INT_HOUSING_PROJECT_ADD_AUTHORIZATION,
  projectAuthorizationRouteName: RouteName.INT_HOUSING_PROJECT_AUTHORIZATION,
  projectNoteRouteName: RouteName.INT_HOUSING_PROJECT_NOTE,
  projectProponentName: RouteName.INT_HOUSING_PROJECT_PROPONENT,
  projectService: housingProjectService
};

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { getPermitTypes } = storeToRefs(permitStore);
const {
  getActivityContacts,
  getDocuments,
  getProject,
  getProjectIsCompleted,
  getNoteHistory,
  getPermits,
  getRelatedEnquiries
} = storeToRefs(projectStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const liveName: Ref<string> = ref('');
const loading: Ref<boolean> = ref(true);
const noteHistoryCreatedByFullnames: Ref<{ noteHistoryId: string; createdByFullname: string }[]> = ref([]);

// Providers
const provideProjectNoteRouteName = computed(() => initiativeState.value.projectNoteRouteName);
const provideProjectAuthorizationRouteName = computed(() => initiativeState.value.projectAuthorizationRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
provide(projectNoteRouteNameKey, provideProjectNoteRouteName);
provide(projectAuthorizationRouteNameKey, provideProjectAuthorizationRouteName);
provide(projectServiceKey, provideProjectService);
provide(updateLiveNameKey, updateLiveName);

// Actions
function updateLiveName(name: string) {
  liveName.value = name;
}

onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.GENERAL:
        initiativeState.value = GENERAL_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    const project = (await initiativeState.value.projectService.getProject(projectId)).data;
    activityId.value = project.activityId;
    const [documents, notes, permits, relatedEnquiries, contacts] = (
      await Promise.all([
        documentService.listDocuments(project.activityId),
        noteHistoryService.listNoteHistories(project.activityId),
        permitService.listPermits({ activityId: project.activityId, includeNotes: true }),
        enquiryService.listRelatedEnquiries(project.activityId),
        activityContactService.listActivityContacts(project.activityId)
      ])
    ).map((r) => r.data);
    const roadMapNote = (await roadmapService.getRoadmapNote(project.activityId)).data;

    project.relatedEnquiries = relatedEnquiries.map((x: Enquiry) => x.activityId).join(', ');
    documents.forEach((d: Document) => {
      d.extension = getFilenameAndExtension(d.filename).extension;
      d.filename = decodeURI(d.filename);
    });

    projectStore.setProject(project);
    projectStore.setActivityContacts(contacts);
    projectStore.setDocuments(documents);
    projectStore.setNoteHistory(notes);
    projectStore.setPermits(permits);
    projectStore.setRelatedEnquiries(relatedEnquiries);
    projectStore.setRoadmapNote(roadMapNote);

    liveName.value = project.projectName;

    if (getPermitTypes.value.length === 0) {
      const permitTypes = (await permitService.getPermitTypes(getInitiative.value)).data;
      permitStore.setPermitTypes(permitTypes);
    }

    // Batch lookup the users who have created notes
    const noteHistoryCreatedByUsers = getNoteHistory.value
      .map((x) => ({
        noteHistoryId: x.noteHistoryId,
        createdBy: x.createdBy
      }))
      .filter((x) => x.noteHistoryId && x.createdBy);

    if (noteHistoryCreatedByUsers.length) {
      const noteHistoryUsers = (
        await userService.searchUsers({
          userId: noteHistoryCreatedByUsers.map((x) => x.createdBy!)
        })
      ).data;

      noteHistoryCreatedByFullnames.value = noteHistoryCreatedByUsers.map((x) => ({
        noteHistoryId: x.noteHistoryId as string,
        createdByFullname: noteHistoryUsers.find((user: User) => user.userId === x.createdBy).fullName
      }));
    }

    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div class="flex items-center justify-between">
    <h1>
      <span v-if="liveName">
        <span class="ml-1">{{ liveName + ': ' }}</span>
      </span>
      <span
        v-if="getProject?.activityId"
        class="mr-1"
      >
        {{ getProject.activityId }}
      </span>
      <span
        v-if="getProjectIsCompleted"
        class="ml-0"
      >
        (Completed)
      </span>
    </h1>
    <Button
      outlined
      @click="
        router.push({
          name: initiativeState.projectProponentName,
          params: {
            projectId: projectId
          }
        })
      "
    >
      <font-awesome-icon icon="fa-solid fa-eye" />
      {{ t('views.i.projectView.seePropViewButtonLabel') }}
    </Button>
  </div>

  <Tabs :value="activeTab">
    <TabList>
      <Tab :value="0">{{ t('views.i.projectView.tabInformation') }}</Tab>
      <Tab
        :value="1"
        class="no-underline"
      >
        <span class="underline">{{ t('views.i.projectView.tabFiles') }}</span>
        ({{ getDocuments.length }})
      </Tab>
      <Tab
        :value="2"
        class="no-underline"
      >
        <span class="underline">{{ t('views.i.projectView.tabAuthorizations') }}</span>
        ({{ getPermits.length }})
      </Tab>
      <Tab
        :value="3"
        class="no-underline"
      >
        <span class="underline">{{ t('views.i.projectView.tabNotes') }}</span>
        ({{ getNoteHistory.length }})
      </Tab>
      <Tab :value="4">{{ t('views.i.projectView.tabRoadmap') }}</Tab>
      <Tab
        :value="5"
        class="no-underline"
      >
        <span class="underline">{{ t('views.i.projectView.tabRelatedEnquiries') }}</span>
        ({{ getRelatedEnquiries.length }})
      </Tab>
      <Tab
        :value="6"
        class="no-underline"
      >
        <span class="underline">{{ t('views.i.projectView.tabProjectTeam') }}</span>
        ({{ getActivityContacts.length }})
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <ProjectInformationTab v-model:live-name="liveName" />
      </TabPanel>
      <TabPanel :value="1">
        <ProjectFilesTab />
      </TabPanel>
      <TabPanel :value="2">
        <ProjectAuthorizationsTab />
      </TabPanel>
      <TabPanel :value="3">
        <ProjectNotesTab />
      </TabPanel>
      <TabPanel :value="4">
        <ProjectRoadmapTab
          v-if="getProject"
          :editable="!getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.ROADMAP, Action.CREATE)"
        />
      </TabPanel>
      <TabPanel :value="5">
        <ProjectEnquiryTab />
      </TabPanel>
      <TabPanel :value="6">
        <ProjectTeamTab v-if="getProject" />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style scoped lang="scss">
.p-tabview {
  .p-tabview-title {
    font-size: 1.1rem;
    font-weight: bold;
  }
}

:deep(.p-tab) {
  &.no-underline {
    text-decoration: none;
  }
}
</style>
