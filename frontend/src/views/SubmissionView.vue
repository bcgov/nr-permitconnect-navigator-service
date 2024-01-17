<script setup lang="ts">
import { filesize } from 'filesize';
import { onMounted, ref } from 'vue';

import FileUpload from '@/components/file/FileUpload.vue';
import SubmissionForm from '@/components/submission/SubmissionForm.vue';
import { Button, Carousel, TabPanel, TabView, useConfirm, useToast } from '@/lib/primevue';
import { chefsService, documentService } from '@/services';
import { formatDateLong } from '@/utils/formatters';

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
const responsiveOptions = ref([
  {
    breakpoint: '1600px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '1200px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '800px',
    numVisible: 1,
    numScroll: 1
  }
]);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = (documentId: string, filename: string) => {
  if (documentId) {
    confirm.require({
      message: `Please confirm that you want to delete ${filename}.`,
      header: 'Delete document?',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      accept: () => {
        documentService
          .deleteDocument(documentId)
          .then(() => {
            documents.value = documents.value.filter((x: Document) => x.documentId !== documentId);
            toast.success('File deleted');
          })
          .catch(() => {});
      }
    });
  }
};

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
      <div class="grid text-center">
        <div class="col-2">
          <FileUpload
            :submission-id="props.submissionId"
            @update:model-value="(e: Document) => documents.push(e)"
          />
        </div>
        <div class="col-10 p-0">
          <Carousel
            v-if="documents.length"
            :value="documents"
            :num-visible="3"
            :num-scroll="1"
            :responsive-options="responsiveOptions"
          >
            <template #item="slotProps">
              <div
                class="grid border-1 surface-border border-round text-center m-2 hover-hand hover-shadow"
                @click="documentService.downloadDocument(slotProps.data.documentId)"
              >
                <div class="col-12 text-center">
                  <img
                    src="../assets/images/bcboxy.png"
                    class="carousel-image"
                  />
                </div>
                <h4 class="col-12 mb-0 text-left">{{ slotProps.data.filename }}</h4>

                <h6 class="col-8 text-left mt-0 mb-0">
                  {{ formatDateLong(slotProps.data.createdAt) }}
                </h6>
                <h6 class="col-4 text-right mt-0 mb-0">{{ filesize(slotProps.data.filesize) }}</h6>
                <div class="col-10 mt-0 mb-0" />
                <div class="col-2 text-right mt-0 mb-0">
                  <Button
                    v-tooltip.bottom="'Delete document'"
                    class="p-button-lg p-button-text p-button-danger p-0 pr-2"
                    aria-label="Delete object"
                    @click="
                      (e) => {
                        confirmDelete(slotProps.data.documentId, slotProps.data.filename);
                        e.stopPropagation();
                      }
                    "
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" />
                  </Button>
                </div>
              </div>
            </template>
          </Carousel>
        </div>
      </div>
    </TabPanel>
  </TabView>
</template>

<style lang="scss">
.carousel-image {
  max-height: 140px;
  width: auto;
  height: auto;
}

.p-carousel-item {
  height: 320px;
}

.p-tabview {
  .p-tabview-nav-container {
    padding-bottom: 2rem;
  }

  .p-tabview-title {
    font-size: 1.2rem;
    font-weight: bold;
  }
}
</style>
