<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import EnquiryForm from '@/components/enquiry/EnquiryForm.vue';
import { Button, Message, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import {
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  userService
} from '@/services';
import { useAppStore, useAuthZStore, useEnquiryStore, useProjectStore } from '@/store';
import { ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX } from '@/utils/constants/projectCommon';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import {
  atsEnquiryPartnerAgenciesKey,
  atsEnquiryTypeCodeKey,
  projectRouteNameKey,
  projectServiceKey
} from '@/utils/keys';
import { generalErrorHandler, toTitleCase } from '@/utils/utils';

import type { Ref } from 'vue';
import type { ElectrificationProject, HousingProject, User } from '@/types';
import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Props
const {
  enquiryId,
  projectId = undefined,
  initialTab = '0'
} = defineProps<{
  enquiryId: string;
  projectId?: string;
  initialTab?: string;
}>();

// Interfaces
interface InitiativeState {
  atsEnquiryPartnerAgencies: Initiative;
  atsEnquiryTypeCode: string;
  enquiryNoteRouteName: RouteName;
  projectRouteName: RouteName;
  projectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  atsEnquiryPartnerAgencies: Initiative.ELECTRIFICATION,
  atsEnquiryTypeCode: toTitleCase(Initiative.ELECTRIFICATION) + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX,
  enquiryNoteRouteName: RouteName.INT_ELECTRIFICATION_ENQUIRY_NOTE,
  projectRouteName: RouteName.INT_ELECTRIFICATION_PROJECT,
  projectService: electrificationProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  atsEnquiryPartnerAgencies: Initiative.HOUSING,
  atsEnquiryTypeCode: toTitleCase(Initiative.HOUSING) + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX,
  enquiryNoteRouteName: RouteName.INT_HOUSING_ENQUIRY_NOTE,
  projectRouteName: RouteName.INT_HOUSING_PROJECT,
  projectService: housingProjectService
};

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const enquiryStore = useEnquiryStore();
const projectStore = useProjectStore();
const { getEnquiry, getNoteHistory } = storeToRefs(enquiryStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const relatedProject: Ref<ElectrificationProject | HousingProject | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteHistoryCreatedByFullnames: Ref<{ noteHistoryId: string; createdByFullname: string }[]> = ref([]);

// Providers
const provideAtsEnquiryPartnerAgencies = computed(() => initiativeState.value.atsEnquiryPartnerAgencies);
const provideAtsEnquiryTypeCode = computed(() => initiativeState.value.atsEnquiryTypeCode);
const provideProjectRouteName = computed(() => initiativeState.value.projectRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
provide(atsEnquiryPartnerAgenciesKey, provideAtsEnquiryPartnerAgencies);
provide(atsEnquiryTypeCodeKey, provideAtsEnquiryTypeCode);
provide(projectRouteNameKey, provideProjectRouteName);
provide(projectServiceKey, provideProjectService);

// Actions
const isCompleted = computed(() => {
  return getEnquiry.value?.enquiryStatus === ApplicationStatus.COMPLETED;
});

function onEnquiryFormSaved() {
  updateRelatedEnquiry();
}

async function updateRelatedEnquiry() {
  if (getEnquiry?.value?.relatedActivityId) {
    relatedProject.value = (
      await initiativeState.value.projectService.searchProjects({
        activityId: [getEnquiry?.value?.relatedActivityId]
      })
    ).data[0];
  } else relatedProject.value = undefined;
}

function toEditNote(noteHistoryId: string) {
  router.push({
    name: RouteName.INT_HOUSING_ENQUIRY_NOTE,
    params: {
      enquiryId: enquiryId,
      noteHistoryId: noteHistoryId
    }
  });
}

onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    if (enquiryId) {
      const enquiry = (await enquiryService.getEnquiry(enquiryId)).data;
      const notes = (await noteHistoryService.listNoteHistories(enquiry.activityId)).data;

      activityId.value = enquiry.activityId;

      enquiryStore.setEnquiry(enquiry);
      enquiryStore.setNoteHistory(notes);

      updateRelatedEnquiry();
    }

    if (projectId) {
      const project = (await initiativeState.value.projectService.getProject(projectId)).data;
      projectStore.setProject(project);
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
  <h1>
    {{ t('views.i.enquiryView.header') }}
    <span
      v-if="getEnquiry?.activityId"
      class="mr-1"
    >
      {{ getEnquiry.activityId }}
    </span>
    <span
      v-if="isCompleted"
      class="ml-0"
    >
      {{ t('views.i.enquiryView.completed') }}
    </span>
  </h1>
  <Tabs :value="activeTab">
    <TabList>
      <Tab :value="0">Information</Tab>
      <Tab :value="1">Notes</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <Message
          v-if="relatedProject"
          severity="info"
          class="text-center"
          :closable="false"
        >
          {{ t('views.i.enquiryView.linkedActivity') }}
          <router-link
            :to="{
              name: initiativeState.projectRouteName,
              params: { projectId: relatedProject.projectId }
            }"
          >
            {{ getEnquiry?.relatedActivityId }}
          </router-link>
        </Message>

        <Message
          v-if="getEnquiry?.relatedActivityId && !relatedProject"
          severity="error"
          class="text-center"
          :closable="false"
        >
          {{ t('views.i.enquiryView.invalidLinkedActivity') }}
        </Message>
        <span v-if="!loading && getEnquiry">
          <EnquiryForm
            :editable="!isCompleted && useAuthZStore().can(getInitiative, Resource.ENQUIRY, Action.UPDATE)"
            :enquiry="getEnquiry"
            @enquiry-form:saved="onEnquiryFormSaved"
          />
        </span>
      </TabPanel>
      <TabPanel :value="1">
        <div class="flex items-center pb-2">
          <div class="grow">
            <p class="font-bold">Notes ({{ getNoteHistory.length }})</p>
          </div>
          <Button
            aria-label="Add note"
            :disabled="!isCompleted && !useAuthZStore().can(getInitiative, Resource.NOTE, Action.CREATE)"
            @click="
              router.push({
                name: initiativeState.enquiryNoteRouteName,
                params: {
                  enquiryId: enquiryId
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
        <div v-if="!loading">
          <div
            v-for="(noteHistory, index) in getNoteHistory"
            :key="noteHistory.noteHistoryId"
            :index="index"
            class="col-span-12"
          >
            <NoteHistoryCard
              :editable="!isCompleted"
              :note-history="noteHistory"
              :created-by-full-name="
                noteHistoryCreatedByFullnames.find((x) => x.noteHistoryId === noteHistory.noteHistoryId)
                  ?.createdByFullname
              "
              @edit-note-history="(e) => toEditNote(e)"
              @delete-note-history="(e) => enquiryStore.removeNoteHistory(e)"
              @update-note-history="(e) => enquiryStore.updateNoteHistory(e)"
            />
          </div>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
