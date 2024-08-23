<script setup lang="ts">
import { onMounted, ref } from 'vue';

import BackButton from '@/components/common/BackButton.vue';
import EnquiryForm from '@/components/housing/enquiry/EnquiryForm.vue';
import NoteCard from '@/components/note/NoteCard.vue';
import NoteModal from '@/components/note/NoteModal.vue';
import { Button, Message, TabPanel, TabView } from '@/lib/primevue';
import { enquiryService, noteService, submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';

import type { Note, Submission } from '@/types';
import type { Ref } from 'vue';
import { useEnquiryStore } from '@/store';
import { storeToRefs } from 'pinia';

// Props
type Props = {
  activityId: string;
  initialTab?: string;
  enquiryId: string;
};

const props = withDefaults(defineProps<Props>(), { initialTab: '0' });

// State
const activeTab: Ref<number> = ref(Number(props.initialTab));
const relatedSubmission: Ref<Submission | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteModalVisible: Ref<boolean> = ref(false);

// Store
const enquiryStore = useEnquiryStore();
const { getEnquiry, getNotes } = storeToRefs(enquiryStore);

// Actions
onMounted(async () => {
  if (props.enquiryId && props.activityId) {
    const [enquiry, notes] = (
      await Promise.all([enquiryService.getEnquiry(props?.enquiryId), noteService.listNotes(props?.activityId)])
    ).map((r) => r.data);
    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNotes(notes);

    if (enquiry?.relatedActivityId) {
      relatedSubmission.value = (
        await submissionService.searchSubmissions({
          activityId: [enquiry.relatedActivityId]
        })
      ).data[0];
    }
  }

  loading.value = false;
});

function onAddNote(note: Note) {
  enquiryStore.addNote(note, true);
}
const onUpdateNote = (oldNote: Note, newNote: Note) => {
  enquiryStore.updateNote(oldNote, newNote);
};
const onDeleteNote = (note: Note) => {
  enquiryStore.removeNote(note);
};
</script>

<template>
  <BackButton
    :route-name="RouteName.HOUSING_SUBMISSIONS"
    text="Back to Submissions"
  />

  <h1>
    Enquiry submission:
    <span
      v-if="getEnquiry?.activityId"
      class="mr-1"
    >
      {{ getEnquiry.activityId }}
    </span>
  </h1>
  <TabView v-model:activeIndex="activeTab">
    <TabPanel header="Information">
      <Message
        v-if="relatedSubmission"
        severity="info"
        class="text-center"
        :closable="false"
      >
        This activity is linked to Activity
        <router-link
          :to="{
            name: RouteName.HOUSING_SUBMISSION,
            query: { activityId: getEnquiry?.relatedActivityId, submissionId: relatedSubmission.submissionId }
          }"
        >
          {{ getEnquiry?.relatedActivityId }}
        </router-link>
      </Message>
      <span v-if="!loading && getEnquiry">
        <EnquiryForm :enquiry="getEnquiry" />
      </span>
    </TabPanel>
    <TabPanel header="Notes">
      <div class="flex align-items-center pb-2">
        <div class="flex-grow-1">
          <p class="font-bold">Notes ({{ getNotes.length }})</p>
        </div>
        <Button
          aria-label="Add note"
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
        class="col-12"
      >
        <NoteCard
          :note="note"
          @delete-note="onDeleteNote"
          @update-note="onUpdateNote"
        />
      </div>
      <NoteModal
        v-if="noteModalVisible"
        v-model:visible="noteModalVisible"
        :activity-id="props.activityId"
        @add-note="onAddNote"
      />
    </TabPanel>
  </TabView>
</template>
