<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';
import { submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Props
const { submissionId } = defineProps<{
  submissionId: string;
}>();

// Composables
const { t } = useI18n();

// State
const activityId: Ref<string | undefined> = ref(undefined);

onBeforeMount(async () => {
  activityId.value = (await submissionService.getSubmission(submissionId)).data.activityId;
});
</script>

<template>
  <div>
    <h2>{{ t('projectConfirmationView.header') }}</h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('projectConfirmationView.success') }}
    </Message>
    <h3 class="inline-block my-7 mr-2">{{ t('projectConfirmationView.projectId') }}</h3>
    <router-link
      :to="{
        name: RouteName.EXT_HOUSING_PROJECT,
        params: { submissionId: submissionId }
      }"
    >
      <span class="text-2xl">{{ activityId }}</span>
    </router-link>
    <div>
      {{ t('projectConfirmationView.message') }}
    </div>
    <div class="mt-6">
      <router-link :to="{ name: RouteName.EXT_HOUSING }">{{ t('projectConfirmationView.backToHousing') }}</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inline-block {
  display: inline-block;
}
</style>
