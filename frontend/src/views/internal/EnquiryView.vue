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
  enquiryNoteRouteNameKey,
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
  provideAtsEnquiryPartnerAgencies: Initiative;
  provideAtsEnquiryTypeCode: string;
  provideEnquiryNoteRouteName: RouteName;
  provideProjectRouteName: RouteName;
  provideProjectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  provideAtsEnquiryPartnerAgencies: Initiative.ELECTRIFICATION,
  provideAtsEnquiryTypeCode: toTitleCase(Initiative.ELECTRIFICATION) + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX,
  provideEnquiryNoteRouteName: RouteName.INT_ELECTRIFICATION_ENQUIRY_NOTE,
  provideProjectRouteName: RouteName.INT_ELECTRIFICATION_PROJECT,
  provideProjectService: electrificationProjectService
};

const HOUSING_VIEW_STATE: InitiativeState = {
  provideAtsEnquiryPartnerAgencies: Initiative.HOUSING,
  provideAtsEnquiryTypeCode: toTitleCase(Initiative.HOUSING) + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX,
  provideEnquiryNoteRouteName: RouteName.INT_HOUSING_ENQUIRY_NOTE,
  provideProjectRouteName: RouteName.INT_HOUSING_PROJECT,
  provideProjectService: housingProjectService
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
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);
const relatedProject: Ref<ElectrificationProject | HousingProject | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteHistoryCreatedByFullnames: Ref<{ noteHistoryId: string; createdByFullname: string }[]> = ref([]);

// Providers
const provideAtsEnquiryPartnerAgencies = computed(() => initiativeState.value.provideAtsEnquiryPartnerAgencies);
const provideAtsEnquiryTypeCode = computed(() => initiativeState.value.provideAtsEnquiryTypeCode);
const provideEnquiryNoteRouteName = computed(() => initiativeState.value.provideEnquiryNoteRouteName);
const provideProjectRouteName = computed(() => initiativeState.value.provideProjectRouteName);
const provideProjectService = computed(() => initiativeState.value.provideProjectService);
provide(atsEnquiryPartnerAgenciesKey, provideAtsEnquiryPartnerAgencies);
provide(atsEnquiryTypeCodeKey, provideAtsEnquiryTypeCode);
provide(enquiryNoteRouteNameKey, provideEnquiryNoteRouteName);
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
      await initiativeState.value.provideProjectService.searchProjects({
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
        initiativeState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error(t('i.common.view.initiativeStateError'));
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
      const project = (await initiativeState.value.provideProjectService.getProject(projectId)).data;
      projectStore.setProject(project);
    }

    // Batch lookup the users who have created notes
    const noteHistoryCreatedByUsers = getNoteHistory.value.map((x) => ({
      noteHistoryId: x.noteHistoryId,
      createdBy: x.createdBy
    }));

    if (noteHistoryCreatedByUsers.length) {
      const noteHistoryUsers = (
        await userService.searchUsers({
          userId: noteHistoryCreatedByUsers.map((x) => x.createdBy).filter((x) => x !== undefined)
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
              name: initiativeState.provideProjectRouteName,
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
                name: initiativeState.provideEnquiryNoteRouteName,
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
