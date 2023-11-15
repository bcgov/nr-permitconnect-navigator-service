<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, FilterMatchMode, InputSwitch, InputText } from '@/lib/primevue';

import { chefsService } from '@/services';
import { useConfigStore } from '@/store';

import type { Ref } from 'vue';

// Props
type Props = {
  submissionId: any;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const { getConfig } = storeToRefs(useConfigStore());

// State
const submission: Ref<any | undefined> = ref(undefined);

// Actions
onMounted(async () => {
  submission.value = (await chefsService.getSubmission(props.submissionId)).data.submission;
});
</script>

<template>
  <h1>Submission</h1>

  <pre>{{ submission }}</pre>
</template>

<style lang="scss" scoped>
h1 {
  padding-left: 1rem;
}

.black {
  color: black;
}
.heading svg {
  color: $app-primary;
}
</style>
