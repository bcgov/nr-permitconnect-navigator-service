<script setup lang="ts">
import { computed, onBeforeMount, provide, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactPage from '@/components/contact/ContactPage.vue';
import { electrificationProjectService, housingProjectService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { contactRouteNameKey, projectServiceKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Interfaces
interface InitiativeState {
  initiativeContactRouteName: RouteName;
  projectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  initiativeContactRouteName: RouteName.INT_ELECTRIFICATION_CONTACT_PAGE,
  projectService: electrificationProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  initiativeContactRouteName: RouteName.INT_HOUSING_CONTACT_PAGE,
  projectService: housingProjectService
};

// Composables
const { t } = useI18n();

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);

// Providers
const provideContactInitiativeRouteName = computed(() => initiativeState.value.initiativeContactRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
provide(contactRouteNameKey, provideContactInitiativeRouteName);
provide(projectServiceKey, provideProjectService);

onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_INITIATIVE_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <ContactPage :contact-id="contactId" />
</template>
