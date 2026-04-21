<script setup lang="ts">
import { computed, onBeforeMount, provide, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactPage from '@/components/contact/ContactPage.vue';
import { electrificationProjectService, generalProjectService, housingProjectService } from '@/services';
import { useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { contactRouteNameKey, enquiryRouteNameKey, projectRouteNameKey, projectServiceKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { IDraftableProjectService } from '@/interfaces/IProjectService';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Interfaces
interface InitiativeState {
  enquiryRouteName: RouteName;
  initiativeContactRouteName: RouteName;
  projectRouteName: RouteName;
  projectService: IDraftableProjectService;
}

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_ELECTRIFICATION_ENQUIRY,
  initiativeContactRouteName: RouteName.INT_ELECTRIFICATION_CONTACT_PAGE,
  projectRouteName: RouteName.INT_ELECTRIFICATION_PROJECT,
  projectService: electrificationProjectService
};

const GENERAL_INITIATIVE_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_GENERAL_ENQUIRY,
  initiativeContactRouteName: RouteName.INT_GENERAL_CONTACT_PAGE,
  projectRouteName: RouteName.INT_GENERAL_PROJECT,
  projectService: generalProjectService
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  enquiryRouteName: RouteName.INT_HOUSING_ENQUIRY,
  initiativeContactRouteName: RouteName.INT_HOUSING_CONTACT_PAGE,
  projectRouteName: RouteName.INT_HOUSING_PROJECT,
  projectService: housingProjectService
};

// Composables
const { t } = useI18n();

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);

// Providers
const provideEnquiryRouteName = computed(() => initiativeState.value.enquiryRouteName);
const provideContactInitiativeRouteName = computed(() => initiativeState.value.initiativeContactRouteName);
const provideProjectRouteName = computed(() => initiativeState.value.projectRouteName);
const provideProjectService = computed(() => initiativeState.value.projectService);
provide(enquiryRouteNameKey, provideEnquiryRouteName);
provide(contactRouteNameKey, provideContactInitiativeRouteName);
provide(projectRouteNameKey, provideProjectRouteName);
provide(projectServiceKey, provideProjectService);

onBeforeMount(async () => {
  try {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
        break;
      case Initiative.GENERAL:
        initiativeState.value = GENERAL_INITIATIVE_STATE;
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
