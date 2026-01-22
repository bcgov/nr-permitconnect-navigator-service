<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import { Button, Card } from '@/lib/primevue';
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
</script>

<template>
  <Card class="auth-card--hover">
    <template #content>
      <div class="flex justify-between items-center">
        <h6 class="mb-0 font-bold">{{ permit.permitType?.name }}</h6>
        <div class="flex items-center gap-5">
          <AuthorizationStatusPill
            v-if="
              permit.state !== PermitState.NONE &&
              permit.state !== PermitState.IN_PROGRESS &&
              permit.state !== PermitState.PENDING_CLIENT
            "
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
