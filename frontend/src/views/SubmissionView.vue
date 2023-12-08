<script setup lang="ts">
import { onMounted, ref } from 'vue';

import SubmissionForm from '../components/submission/SubmissionForm.vue';
import { Button, useToast } from '@/lib/primevue';
import { chefsService } from '@/services';

import type { Ref } from 'vue';

// Props
type Props = {
  formId: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const editable: Ref<boolean> = ref(false);
const submission: Ref<any | undefined> = ref(undefined);
const submissionStatus: Ref<any | undefined> = ref(undefined);

// Actions
const toast = useToast();

function onCancel() {
  editable.value = false;
}

async function onSubmit(data: any) {
  console.log(data);
  editable.value = false;
  await chefsService.updateSubmission(props.formId, props.submissionId, data);
  toast.success('Form saved');
}

onMounted(async () => {
  submission.value = (await chefsService.getSubmission(props.formId, props.submissionId)).data.submission;
  submissionStatus.value = (await chefsService.getSubmissionStatus(props.formId, props.submissionId)).data[0];
});
</script>

<template>
  <h1>Submission</h1>

  <Button
    class="mb-3"
    @click="editable = !editable"
  >
    Edit mode
  </Button>

  <SubmissionForm
    v-if="submission && submissionStatus"
    :editable="editable"
    :submission="submission"
    :submission-status="submissionStatus"
    @cancel="onCancel"
    @submit="onSubmit"
  />
</template>
