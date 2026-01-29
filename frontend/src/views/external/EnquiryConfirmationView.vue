<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Message } from '@/lib/primevue';
import { useAppStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { generalErrorHandler } from '@/utils/utils';

import type { Ref } from 'vue';

// Interfaces
interface InitiativeState {
  initiativeRouteName: RouteName;
}

// Composables
const { t } = useI18n();

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  initiativeRouteName: RouteName.EXT_HOUSING
};

const HOUSING_VIEW_STATE: InitiativeState = {
  initiativeRouteName: RouteName.EXT_HOUSING
};

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);

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
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div>
    <h2 class="mb-9">
      {{ t('e.common.enquiryConfirmationView.confirmationHeader') }}
    </h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('e.common.enquiryConfirmationView.confirmationBanner') }}
    </Message>
    <div class="mt-9">
      {{ t('e.housing.enquiryConfirmationView.message') }}
    </div>
    <div class="mt-7">
      <router-link :to="{ name: initiativeState.initiativeRouteName }">
        {{ t('e.housing.projectConfirmationView.backToHousing') }}
      </router-link>
    </div>
  </div>
</template>
