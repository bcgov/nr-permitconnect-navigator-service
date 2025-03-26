<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import EnquiryForm from '@/components/housing/enquiry/EnquiryForm.vue';
import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import { Button, Message, Tab, Tabs, TabList, TabPanel, TabPanels } from '@/lib/primevue';
import { enquiryService, housingProjectService, noteService } from '@/services';
import { useAuthZStore, useEnquiryStore, useHousingProjectStore } from '@/store';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/housing';

import type { Note, HousingProject } from '@/types';
import type { Ref } from 'vue';

// Props
const {
  enquiryId,
  housingProjectId,
  initialTab = '0'
} = defineProps<{
  enquiryId: string;
  housingProjectId?: string;
  initialTab?: string;
}>();

// Composables
const { t } = useI18n();

// Store
const enquiryStore = useEnquiryStore();
const housingProjectStore = useHousingProjectStore();
const { getEnquiry, getNotes } = storeToRefs(enquiryStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const activityId: Ref<string | undefined> = ref(undefined);
const relatedHousingProjects: Ref<HousingProject | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteModalVisible: Ref<boolean> = ref(false);

const isCompleted = computed(() => {
  return getEnquiry.value?.enquiryStatus === ApplicationStatus.COMPLETED;
});

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
    relatedHousingProjects.value = (
      await housingProjectService.searchHousingProjects({
        activityId: [getEnquiry?.value?.relatedActivityId]
      })
    ).data[0];
  } else relatedHousingProjects.value = undefined;
}

onBeforeMount(async () => {
  if (enquiryId) {
    const enquiry = (await enquiryService.getEnquiry(enquiryId)).data;
    const notes = (await noteService.listNotes(enquiry.activityId)).data;

    activityId.value = enquiry.activityId;

    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNotes(notes);

    updateRelatedEnquiry();
  }

  if (housingProjectId) {
    const submission = (await housingProjectService.getHousingProject(housingProjectId)).data;
    housingProjectStore.setHousingProject(submission);
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
          v-if="relatedHousingProjects"
          severity="info"
          class="text-center"
          :closable="false"
        >
          {{ t('enquiryView.linkedActivity') }}
          <router-link
            :to="{
              name: RouteName.INT_HOUSING_PROJECT,
              params: { housingProjectId: relatedHousingProjects.housingProjectId }
            }"
          >
            {{ getEnquiry?.relatedActivityId }}
          </router-link>
        </Message>

        <Message
          v-if="getEnquiry?.relatedActivityId && !relatedHousingProjects"
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
            :related-ats-number="relatedHousingProjects?.atsClientId"
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
