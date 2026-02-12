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
  backTo: string;
  initiativeRouteName: RouteName;
  message: string;
}

// Composables
const { t } = useI18n();

// Constants
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  backTo: t('views.e.enquiryConfirmationView.electrification.backTo'),
  initiativeRouteName: RouteName.EXT_ELECTRIFICATION,
  message: t('views.e.enquiryConfirmationView.electrification.message')
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  backTo: t('views.e.enquiryConfirmationView.housing.backTo'),
  initiativeRouteName: RouteName.EXT_HOUSING,
  message: t('views.e.enquiryConfirmationView.housing.message')
};

// Store
const { getInitiative } = storeToRefs(useAppStore());

// State
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);

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
  } catch (e) {
    generalErrorHandler(e);
  }
});
</script>

<template>
  <div>
    <h2 class="mb-9">
      {{ t('views.e.enquiryConfirmationView.confirmationHeader') }}
    </h2>
    <Message
      severity="success"
      :closable="false"
    >
      {{ t('views.e.enquiryConfirmationView.confirmationBanner') }}
    </Message>
    <div class="mt-9">
      {{ initiativeState.message }}
    </div>
    <div class="mt-7">
      <router-link :to="{ name: initiativeState.initiativeRouteName }">
        {{ initiativeState.backTo }}
      </router-link>
    </div>
  </div>
</template>
