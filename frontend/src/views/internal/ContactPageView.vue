<script setup lang="ts">
import { computed, onBeforeMount, provide, ref, type Ref } from 'vue';

import ContactPage from '@/components/contact/ContactPage.vue';
import { electrificationProjectService, housingProjectService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { initiativeContactRouteNameKey, projectServiceKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Interfaces
interface InitiativeState {
  provideInitiativeContactRouteName: RouteName;
  provideProjectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  provideInitiativeContactRouteName: RouteName.INT_ELECTRIFICATION_CONTACT_PAGE,
  provideProjectService: electrificationProjectService
};

const HOUSING_VIEW_STATE: InitiativeState = {
  provideInitiativeContactRouteName: RouteName.INT_HOUSING_CONTACT_PAGE,
  provideProjectService: housingProjectService
};

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);

// Providers
const provideContactInitiativeRouteName = computed(() => initiativeState.value.provideInitiativeContactRouteName);
const provideProjectService = computed(() => initiativeState.value.provideProjectService);
provide(initiativeContactRouteNameKey, provideContactInitiativeRouteName);
provide(projectServiceKey, provideProjectService);

onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error(t('i.common.view.initiativeStateError'));
    }
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <ContactPage :contact-id="contactId" />
</template>
