<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';
import { electrificationProjectService } from '@/services';

import type { Ref } from 'vue';
import { RouteName } from '@/utils/enums/application';

// Props
const { projectId } = defineProps<{
  projectId: string;
}>();

// Composables
const { t } = useI18n();

// State
const activityId: Ref<string | undefined> = ref(undefined);

onBeforeMount(async () => {
  activityId.value = (await electrificationProjectService.getProject(projectId)).data.activityId;
});
</script>

<template>
  <div>
    <h2>{{ t('e.electrification.projectConfirmationView.header') }}</h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('e.electrification.projectConfirmationView.success') }}
    </Message>
    <h3 class="inline-block my-7 mr-2">{{ t('e.electrification.projectConfirmationView.projectId') }}</h3>
    <router-link
      :to="{
        name: RouteName.EXT_ELECTRIFICATION_PROJECT,
        params: { projectId: projectId }
      }"
    >
      <span class="text-2xl">{{ activityId }}</span>
    </router-link>
    <div>
      {{ t('e.electrification.projectConfirmationView.message') }}
    </div>
    <div class="mt-6">
      <router-link :to="{ name: RouteName.EXT_ELECTRIFICATION }">
        {{ t('e.electrification.projectConfirmationView.backToElectrification') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.inline-block {
  display: inline-block;
}
</style>
