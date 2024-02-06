<script setup lang="ts">
import { onMounted, ref } from 'vue';

import DocumentCard from '@/components/file/DocumentCard.vue';
import PermitCard from '@/components/permit/PermitCard.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import SubmissionForm from '@/components/submission/SubmissionForm.vue';
import { Button, TabPanel, TabView, useToast } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';
import { chefsService, documentService, permitService } from '@/services';

import type { Ref } from 'vue';
import type { Document, Permit } from '@/types';

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
const permits: Ref<Array<Permit>> = ref([]);
const permitModalVisible: Ref<boolean> = ref(false);

// Actions
const toast = useToast();

function onCancel() {
  editable.value = false;
}

function onPermitDelete(data: any) {
  permits.value = permits.value.filter((x: Permit) => x.permitId !== data.permitId);
}

async function onPermitSubmit(data: any) {
  const result = (await permitService.createPermit({ ...data, submissionId: props.submissionId })).data;
  toast.success('Permit saved');
  permits.value.push(result);
  sortPermits();
  permitModalVisible.value = false;
}

async function onSubmissionSubmit(data: any) {
  editable.value = false;
  await chefsService.updateSubmission(props.submissionId, {
    ...data,
    submissionId: props.submissionId
  });
  toast.success('Form saved');
}

const sortPermits = (): void => {
  permits.value.sort((a: Permit, b: Permit) => a.permitType?.name.localeCompare(b.permitType?.name ?? '') || 0);
};

onMounted(async () => {
  submission.value = (await chefsService.getSubmission(props.formId, props.submissionId)).data;
  documents.value = (await documentService.listDocuments(props.submissionId)).data;
  permits.value = (await permitService.listPermits(props.submissionId)).data;
});
</script>

<template>
  <router-link :to="{ name: RouteNames.SUBMISSIONS }">
    <font-awesome-icon
      icon="fa fa-arrow-circle-left"
      class="mr-1"
    />
    <span>Back to Submissions</span>
  </router-link>
  <h1>
    Activity submission:
    <span v-if="submission?.confirmationId">{{ submission.confirmationId }}</span>
    <span v-if="submission?.projectName">&nbsp;- {{ submission.projectName }}</span>
  </h1>

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
        @submit="onSubmissionSubmit"
      />
    </TabPanel>
    <TabPanel header="Files">
      <div class="grid nested-grid">
        <div class="col-2">
          <FileUpload
            :submission-id="props.submissionId"
            @update:last-uploaded-document="(e: Document) => documents.push(e)"
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
    <TabPanel header="Permits">
      <div class="flex flex-row pb-2">
        <div class="flex flex-grow-1 align-items-end">
          <p class="font-bold">Applicable permits ({{ permits.length }})</p>
        </div>
        <div class="flex flex-none">
          <Button
            aria-label="Add permit"
            @click="permitModalVisible = true"
          >
            <font-awesome-icon icon="fa-solid fa-plus" />
            &nbsp; Add permit
          </Button>
        </div>
      </div>
      <div
        v-for="(permit, index) in permits"
        :key="permit.permitId"
        :index="index"
        class="col-12"
      >
        <PermitCard
          :permit="permit"
          :submission-id="submissionId"
          @permit:delete="onPermitDelete"
        />
      </div>

      <PermitModal
        v-model:visible="permitModalVisible"
        @permit:submit="onPermitSubmit"
      />
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
