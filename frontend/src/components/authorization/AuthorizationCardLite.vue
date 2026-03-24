<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationStatePill from '@/components/authorization/AuthorizationStatePill.vue';
import { Button, Card } from '@/lib/primevue';
import { ONGOING_PERMIT_STATES } from '@/utils/constants/permit';
import { PermitState } from '@/utils/enums/permit';

import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Emits
const emit = defineEmits(['authorizationCardLite:more']);

// Composables
const { t } = useI18n();

// State
const isTerminalState = computed(() => {
  return ![PermitState.NONE, ...ONGOING_PERMIT_STATES].includes(permit.state);
});
</script>

<template>
  <Card class="auth-card--hover">
    <template #content>
      <div class="flex justify-between items-center">
        <h6 class="mb-0 font-bold">{{ permit.permitType?.name }}</h6>
        <div class="flex items-center gap-5">
          <AuthorizationStatePill
            v-if="isTerminalState"
            :state="permit.state"
          />
          <Button
            class="p-button-outlined size-fit"
            :label="t('authorization.authorizationCardLite.more')"
            @click="emit('authorizationCardLite:more')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.auth-card {
  border-color: var(--p-greyscale-100);
  border-style: solid;
  border-width: 0.063rem;
  box-shadow: 0.25rem 0.25rem 0.25rem 0rem var(--p-greyscale-50);
  &--hover:hover {
    background-color: var(--p-bcblue-50);
  }
}
</style>
