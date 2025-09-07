<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import NoteHistoryCard from '@/components/note/NoteHistoryCard.vue';
import EnquiryForm from '@/components/projectCommon/enquiry/EnquiryForm.vue';
import { Button, Message, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { enquiryService, housingProjectService, noteHistoryService, userService } from '@/services';
import { useAuthZStore, useEnquiryStore, useProjectStore } from '@/store';
import { ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX } from '@/utils/constants/projectCommon';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';
import { toTitleCase } from '@/utils/utils';

import type { Ref } from 'vue';
import type { HousingProject, User } from '@/types';

// Props
const {
  enquiryId,
  projectId,
  initialTab = '0'
} = defineProps<{
  enquiryId: string;
  projectId?: string;
  initialTab?: string;
}>();

// Composables
const { t } = useI18n();
const router = useRouter();

// Store
const enquiryStore = useEnquiryStore();
const projectStore = useProjectStore();
const { getEnquiry, getNoteHistory } = storeToRefs(enquiryStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const relatedHousingProject: Ref<HousingProject | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteHistoryCreatedByFullnames: Ref<{ noteHistoryId: string; createdByFullname: string }[]> = ref([]);

const isCompleted = computed(() => {
  return getEnquiry.value?.enquiryStatus === ApplicationStatus.COMPLETED;
});

// Providers
provide(atsEnquiryPartnerAgenciesKey, Initiative.HOUSING);
provide(atsEnquiryTypeCodeKey, toTitleCase(Initiative.HOUSING) + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX);
provide(projectServiceKey, ref(housingProjectService));

// Actions
function onEnquiryFormSaved() {
  updateRelatedEnquiry();
}

async function updateRelatedEnquiry() {
  if (getEnquiry?.value?.relatedActivityId) {
    relatedHousingProject.value = (
      await housingProjectService.searchProjects({
        activityId: [getEnquiry?.value?.relatedActivityId]
      })
    ).data[0];
  } else relatedHousingProject.value = undefined;
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
  if (enquiryId) {
    const enquiry = (await enquiryService.getEnquiry(enquiryId)).data;
    const notes = (await noteHistoryService.listNoteHistories(enquiry.activityId)).data;

    activityId.value = enquiry.activityId;

    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNoteHistory(notes);

    updateRelatedEnquiry();
  }

  if (projectId) {
    const project = (await housingProjectService.getProject(projectId)).data;
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
});
</script>

<template>
  <h1>
    {{ t('enquiryView.header') }}
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
      {{ t('enquiryView.completed') }}
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
          v-if="relatedHousingProject"
          severity="info"
          class="text-center"
          :closable="false"
        >
          {{ t('enquiryView.linkedActivity') }}
          <router-link
            :to="{
              name: RouteName.INT_HOUSING_PROJECT,
              params: { projectId: relatedHousingProject.housingProjectId }
            }"
          >
            {{ getEnquiry?.relatedActivityId }}
          </router-link>
        </Message>

        <Message
          v-if="getEnquiry?.relatedActivityId && !relatedHousingProject"
          severity="error"
          class="text-center"
          :closable="false"
        >
          {{ t('enquiryView.invalidLinkedActivity') }}
        </Message>
        <span v-if="!loading && getEnquiry">
          <EnquiryForm
            :editable="!isCompleted && useAuthZStore().can(Initiative.HOUSING, Resource.ENQUIRY, Action.UPDATE)"
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
            :disabled="!isCompleted && !useAuthZStore().can(Initiative.HOUSING, Resource.NOTE, Action.CREATE)"
            @click="
              router.push({
                name: RouteName.INT_HOUSING_ENQUIRY_NOTE,
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
