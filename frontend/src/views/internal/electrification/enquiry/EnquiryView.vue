<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import EnquiryForm from '@/components/projectCommon/enquiry/EnquiryForm.vue';
import { Button, Message, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { enquiryService, electrificationProjectService, noteService } from '@/services';
import { useAuthZStore, useEnquiryStore, useProjectStore } from '@/store';
import { ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX } from '@/utils/constants/projectCommon';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';

import type { Note, ElectrificationProject, NoteHistory } from '@/types';
import type { Ref } from 'vue';

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

// Store
const enquiryStore = useEnquiryStore();
const projectStore = useProjectStore();
const { getEnquiry, getNoteHistory } = storeToRefs(enquiryStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const relatedElectrificationProject: Ref<ElectrificationProject | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteModalVisible: Ref<boolean> = ref(false);

const isCompleted = computed(() => {
  return getEnquiry.value?.enquiryStatus === ApplicationStatus.COMPLETED;
});

// Providers
provide(atsEnquiryPartnerAgenciesKey, Initiative.ELECTRIFICATION);
provide(atsEnquiryTypeCodeKey, Initiative.ELECTRIFICATION + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX);
provide(projectServiceKey, electrificationProjectService);

// Actions
function onAddNote(history: NoteHistory) {
  enquiryStore.addNoteHistory(history, true);
}

const onDeleteNote = (history: NoteHistory) => {
  enquiryStore.removeNoteHistory(history);
};

const onUpdateNote = (history: NoteHistory) => {
  enquiryStore.updateNoteHistory(history);
};

function onEnquiryFormSaved() {
  updateRelatedEnquiry();
}

async function updateRelatedEnquiry() {
  if (getEnquiry?.value?.relatedActivityId) {
    relatedElectrificationProject.value = (
      await electrificationProjectService.searchProjects({
        activityId: [getEnquiry?.value?.relatedActivityId]
      })
    ).data[0];
  } else relatedElectrificationProject.value = undefined;
}

onBeforeMount(async () => {
  if (enquiryId) {
    const enquiry = (await enquiryService.getEnquiry(enquiryId)).data;
    const notes = (await noteService.listNoteHistory(enquiry.activityId)).data;

    activityId.value = enquiry.activityId;

    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNoteHistory(notes);

    updateRelatedEnquiry();
  }

  if (projectId) {
    const project = (await electrificationProjectService.getProject(projectId)).data;
    projectStore.setProject(project);
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
          v-if="relatedElectrificationProject"
          severity="info"
          class="text-center"
          :closable="false"
        >
          {{ t('enquiryView.linkedActivity') }}
          <router-link
            :to="{
              name: RouteName.INT_ELECTRIFICATION_PROJECT,
              params: { projectId: relatedElectrificationProject.electrificationProjectId }
            }"
          >
            {{ getEnquiry?.relatedActivityId }}
          </router-link>
        </Message>

        <Message
          v-if="getEnquiry?.relatedActivityId && !relatedElectrificationProject"
          severity="error"
          class="text-center"
          :closable="false"
        >
          {{ t('enquiryView.invalidLinkedActivity') }}
        </Message>
        <span v-if="!loading && getEnquiry">
          <EnquiryForm
            :editable="!isCompleted && useAuthZStore().can(Initiative.ELECTRIFICATION, Resource.ENQUIRY, Action.UPDATE)"
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
            :disabled="!isCompleted && !useAuthZStore().can(Initiative.ELECTRIFICATION, Resource.NOTE, Action.CREATE)"
            @click="noteModalVisible = true"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            Add note
          </Button>
        </div>
        <div
          v-for="(history, index) in getNoteHistory"
          :key="history.noteHistoryId"
          :index="index"
          class="col-span-12"
        >
          <NoteCard
            :editable="!isCompleted"
            :note-history="history"
            @delete-note="onDeleteNote"
            @update-note="onUpdateNote"
          />
        </div>
        <NoteModal
          v-if="noteModalVisible && activityId"
          v-model:visible="noteModalVisible"
          :activity-id="activityId"
          @add-note="onAddNote"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
