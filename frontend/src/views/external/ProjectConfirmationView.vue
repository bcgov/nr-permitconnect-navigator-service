<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';
import { electrificationProjectService, housingProjectService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IProjectService } from '@/interfaces/IProjectService';

// Props
const { projectId } = defineProps<{
  projectId: string;
}>();

// Interfaces
interface InitiativeState {
  initiativeRouteName: RouteName;
  projectService: IProjectService;
  projectRouteName: RouteName;
}

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  initiativeRouteName: RouteName.EXT_ELECTRIFICATION,
  projectService: electrificationProjectService,
  projectRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT
};

const HOUSING_VIEW_STATE: InitiativeState = {
  initiativeRouteName: RouteName.EXT_HOUSING,
  projectService: housingProjectService,
  projectRouteName: RouteName.EXT_HOUSING_PROJECT
};

// Composables
const { t } = useI18n();

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const activityId: Ref<string | undefined> = ref(undefined);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);

// Actions
onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error(t('i.common.view.initiativeStateError'));
    }

    activityId.value = (await initiativeState.value.projectService.getProject(projectId)).data.activityId;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div>
    <h2>{{ t('e.housing.projectConfirmationView.header') }}</h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('e.housing.projectConfirmationView.success') }}
    </Message>
    <h3 class="inline-block my-7 mr-2">{{ t('e.housing.projectConfirmationView.projectId') }}</h3>
    <router-link
      :to="{
        name: initiativeState.projectRouteName,
        params: { projectId: projectId }
      }"
    >
      <span class="text-2xl">{{ activityId }}</span>
    </router-link>
    <div>
      {{ t('e.housing.projectConfirmationView.message') }}
    </div>
    <div class="mt-6">
      <router-link :to="{ name: initiativeState.initiativeRouteName }">
        {{ t('e.housing.projectConfirmationView.backToHousing') }}
      </router-link>
    </div>
  </div>
</template>
