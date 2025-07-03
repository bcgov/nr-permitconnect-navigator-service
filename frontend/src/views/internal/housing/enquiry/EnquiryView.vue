<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import EnquiryForm from '@/components/projectCommon/enquiry/EnquiryForm.vue';
import { Button, Message, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { enquiryService, housingProjectService, noteService } from '@/services';
import { useAuthZStore, useEnquiryStore, useProjectStore } from '@/store';
import { ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX } from '@/utils/constants/projectCommon';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';
import { atsEnquiryPartnerAgenciesKey, atsEnquiryTypeCodeKey, projectServiceKey } from '@/utils/keys';

import type { Note, HousingProject } from '@/types';
import type { Ref } from 'vue';
import { provide } from 'vue';

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
const { getEnquiry, getNotes } = storeToRefs(enquiryStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const relatedHousingProject: Ref<HousingProject | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteModalVisible: Ref<boolean> = ref(false);

const isCompleted = computed(() => {
  return getEnquiry.value?.enquiryStatus === ApplicationStatus.COMPLETED;
});

// Providers
provide(atsEnquiryPartnerAgenciesKey, Initiative.HOUSING);
provide(atsEnquiryTypeCodeKey, Initiative.HOUSING + ATS_ENQUIRY_TYPE_CODE_ENQUIRY_SUFFIX);
provide(projectServiceKey, housingProjectService);

// Actions
function onAddNote(note: Note) {
  enquiryStore.addNote(note, true);
}

const onDeleteNote = (note: Note) => {
  enquiryStore.removeNote(note);
};

const onUpdateNote = (oldNote: Note, newNote: Note) => {
  enquiryStore.updateNote(oldNote, newNote);
};

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

onBeforeMount(async () => {
  if (enquiryId) {
    const enquiry = (await enquiryService.getEnquiry(enquiryId)).data;
    const notes = (await noteService.listNoteHistory(enquiry.activityId)).data;

    activityId.value = enquiry.activityId;

    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNotes(notes);

    updateRelatedEnquiry();
  }

  if (projectId) {
    const project = (await housingProjectService.getProject(projectId)).data;
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
            <p class="font-bold">Notes ({{ getNotes.length }})</p>
          </div>
          <Button
            aria-label="Add note"
            :disabled="!isCompleted && !useAuthZStore().can(Initiative.HOUSING, Resource.NOTE, Action.CREATE)"
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
          v-for="(note, index) in getNotes"
          :key="note.noteId"
          :index="index"
          class="col-span-12"
        >
          <NoteCard
            :editable="!isCompleted"
            :note="note"
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
