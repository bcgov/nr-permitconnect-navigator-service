<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationStatePill from '@/components/authorization/AuthorizationStatePill.vue';
import { Button, Card } from '@/lib/primevue';
import { ONGOING_PERMIT_STATES } from '@/utils/constants/permit';
import { PermitState } from '@/utils/enums/codeEnums';

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
  const excludedStates = [PermitState.NONE, ...ONGOING_PERMIT_STATES] as PermitState[];
  return !excludedStates.includes(permit.state as PermitState);
});
</script>

<template>
  <!-- eslint-disable max-len -->
  <Card
    class="px-0 py-4 border-[var(--p-greyscale-100)] shadow-[0.25rem_0.25rem_0.25rem_0rem_var(--p-greyscale-50)] hover:bg-[var(--p-bcblue-50)]"
  >
    <!-- eslint-enable max-len -->
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
