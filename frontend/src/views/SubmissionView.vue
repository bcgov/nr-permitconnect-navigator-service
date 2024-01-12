<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import SubmissionForm from '../components/submission/SubmissionForm.vue';
import { Button, useToast } from '@/lib/primevue';
import { chefsService, documentService } from '@/services';
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
</template>
