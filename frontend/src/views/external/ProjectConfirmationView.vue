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
  backTo: string;
  initiativeRouteName: RouteName;
  projectService: IProjectService;
  projectRouteName: RouteName;
  message: string;
}

// Composables
const { t } = useI18n();

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  backTo: t('views.e.projectConfirmationView.electrification.backTo'),
  initiativeRouteName: RouteName.EXT_ELECTRIFICATION,
  projectService: electrificationProjectService,
  projectRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT,
  message: t('views.e.projectConfirmationView.electrification.message')
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  backTo: t('views.e.projectConfirmationView.housing.backTo'),
  initiativeRouteName: RouteName.EXT_HOUSING,
  projectService: housingProjectService,
  projectRouteName: RouteName.EXT_HOUSING_PROJECT,
  message: t('views.e.projectConfirmationView.housing.message')
};

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const activityId: Ref<string | undefined> = ref(undefined);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);

// Actions
onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    activityId.value = (await initiativeState.value.projectService.getProject(projectId)).data.activityId;
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div>
    <h2>{{ t('views.e.projectConfirmationView.header') }}</h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('views.e.projectConfirmationView.success') }}
    </Message>
    <h3 class="inline-block my-7 mr-2">{{ t('views.e.projectConfirmationView.projectId') }}</h3>
    <router-link
      :to="{
        name: initiativeState.projectRouteName,
        params: { projectId: projectId }
      }"
    >
      <span class="text-2xl">{{ activityId }}</span>
    </router-link>
    <div>
      {{ initiativeState.message }}
    </div>
    <div class="mt-6">
      <router-link :to="{ name: initiativeState.initiativeRouteName }">
        {{ initiativeState.backTo }}
      </router-link>
    </div>
  </div>
</template>
