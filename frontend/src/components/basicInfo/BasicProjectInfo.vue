<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Card } from '@/lib/primevue';

// Props
const { assignee, createdBy, activityId } = defineProps<{
  assignee?: string;
  createdBy: string;
  activityId: string;
}>();

// Emits
const emit = defineEmits(['basicProjectInfo:navigateToSubmissionIntakeView']);

// Composables
const { t } = useI18n();
</script>

<template>
  <div class="grid grid-cols-3 gap-x-5 bg-[var(--p-bcblue-50)] p-5">
    <Card class="mb-0">
      <template #content>
        <div class="mb-2">{{ t('basicInfo.basicProjectInfo.projectNavigator') }}</div>
        <h5 class="m-0 p-0 text-[var(--p-bcblue-950)]">{{ assignee ?? '' }}</h5>
      </template>
    </Card>
    <Card class="mb-0 card-bg-bcblue-50">
      <template #content>
        <div class="">
          <div class="mb-2">
            {{ t('basicInfo.basicProjectInfo.projectId') }}:
            <p class="ml-3 p-0 inline-block font-bold text-[var(--p-bcblue-950)]">{{ activityId }}</p>
          </div>
          <div class="mb-2">
            {{ t('basicInfo.basicProjectInfo.createdBy') }}:
            <p class="ml-2 p-0 inline-block font-bold text-[var(--p-bcblue-950)]">{{ createdBy }}</p>
          </div>
        </div>
      </template>
    </Card>
    <Card class="mb-0 card-bg-bcblue-50">
      <template #content>
        <div
          class="cursor-pointer"
          @click="emit('basicProjectInfo:navigateToSubmissionIntakeView')"
        >
          <font-awesome-icon
            class="mr-2"
            icon="fa-solid fa-file-lines"
          />

          <span class="underline app-primary-color">{{ t('basicInfo.basicProjectInfo.submittedProjectInfo') }}</span>
        </div>
      </template>
    </Card>
  </div>
</template>
<style scoped lang="scss">
:deep(.card-bg-bcblue-50.p-card) {
  background-color: var(--p-bcblue-50);
}
:deep(.p-card) {
  margin-bottom: 0;
}
</style>
