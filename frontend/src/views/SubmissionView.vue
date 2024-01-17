<script setup lang="ts">
import { onMounted, ref } from 'vue';

import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import SubmissionForm from '@/components/submission/SubmissionForm.vue';
import { Button, TabPanel, TabView, useToast } from '@/lib/primevue';
import { chefsService, documentService } from '@/services';

import type { Ref } from 'vue';
import type { Document } from '@/types';

// Props
type Props = {
  formId: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const editable: Ref<boolean> = ref(false);
const submission: Ref<any | undefined> = ref(undefined);
const documents: Ref<Array<Document>> = ref([]);

// Actions
const toast = useToast();

function onCancel() {
  editable.value = false;
}

async function onSubmit(data: any) {
  editable.value = false;
  await chefsService.updateSubmission(props.submissionId, {
    ...data,
    submissionId: props.submissionId
  });
  toast.success('Form saved');
}

onMounted(async () => {
  submission.value = (await chefsService.getSubmission(props.formId, props.submissionId)).data;
  documents.value = (await documentService.listDocuments(props.submissionId)).data;
});
</script>

<template>
  <h1>Activity submission</h1>

  <TabView>
    <TabPanel header="Info">
      <Button
        class="mb-3"
        @click="editable = !editable"
      >
        Edit
      </Button>

      <SubmissionForm
        v-if="submission"
        :editable="editable"
        :submission="submission"
        @cancel="onCancel"
        @submit="onSubmit"
      />
    </TabPanel>
    <TabPanel header="Files">
      <div class="grid nested-grid">
        <div class="col-2">
          <FileUpload
            :submission-id="props.submissionId"
            @update:model-value="(e: Document) => documents.push(e)"
          />
        </div>
        <div class="col-10">
          <div class="grid">
            <div
              v-for="(document, index) in documents"
              :key="document.documentId"
              :index="index"
              class="col-12 md:col-6 lg:col-4 xl:col-3"
            >
              <DocumentCard
                :document="document"
                class="hover-hand hover-shadow"
                @click="documentService.downloadDocument(document.documentId)"
                @document:deleted="
                  (documentId) => (documents = documents.filter((x: Document) => x.documentId !== documentId))
                "
              />
            </div>
          </div>
        </div>
      </div>
    </TabPanel>
  </TabView>
</template>

<style lang="scss">
.p-tabview {
  .p-tabview-title {
    font-size: 1.1rem;
    font-weight: bold;
  }
}
</style>
