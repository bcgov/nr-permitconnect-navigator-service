<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { chefsService } from '@/services';

import type { Ref } from 'vue';

// Props
type Props = {
  formId: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const submission: Ref<any | undefined> = ref(undefined);

// Actions
onMounted(async () => {
  submission.value = (await chefsService.getSubmission(props.formId, props.submissionId)).data.submission;
});
</script>

<template>
  <h1>Submission</h1>

  <pre>{{ submission }}</pre>
</template>
