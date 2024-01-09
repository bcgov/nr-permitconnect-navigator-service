<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import FileUpload from '@/components/file/FileUpload.vue';
import SubmissionForm from '@/components/submission/SubmissionForm.vue';
import { Button, Carousel, TabPanel, TabView, useToast } from '@/lib/primevue';
import { chefsService } from '@/services';
import { useFileStore } from '@/store';
import { formatDateLong } from '@/utils/formatters';
import { useConfigStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  formId: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const { getConfig } = storeToRefs(useConfigStore());

// State
const editable: Ref<boolean> = ref(false);
const submission: Ref<any | undefined> = ref(undefined);

const { getFiles } = storeToRefs(useFileStore());

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
});

const onUpload = async (file: File) => {
  await documentService.createDocument(file, props.submissionId, getConfig.value.coms.bucketId);
};
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
      <div class="grid border-1 surface-border border-round text-center">
        <div class="col-2">
          <FileUpload />
        </div>
        <div class="col-10 p-0">
          <Carousel
            v-if="getFiles.length > 0"
            :value="getFiles"
            :num-visible="3"
            :num-scroll="3"
          >
            <template #item="slotProps">
              <div class="grid border-1 surface-border border-round text-center m-2">
                <div class="col-12 text-center">
                  <img
                    src="../assets/images/bcboxy.png"
                    class="carousel-image"
                  />
                </div>
                <h4 class="col-12 mb-0 text-left">{{ slotProps.data.name }}</h4>

                <h6 class="col-8 text-left mt-0">
                  {{ formatDateLong(slotProps.data.lastModifiedDate.toISOString()) }}
                </h6>
                <h6 class="col-4 text-right mt-0">{{ slotProps.data.size }}</h6>
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
  height: 270px;
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
