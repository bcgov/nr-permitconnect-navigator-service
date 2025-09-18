<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { Button, Card } from '@/lib/primevue';
import { formatDate } from '@/utils/formatters';

import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <Card class="permit-card--hover mb-4">
    <template #content>
      <div class="flex justify-between">
        <h5 class="m-0 app-primary-color cursor-pointer hover:underline">{{ permit.permitType.name }}</h5>
        <Button
          class="p-button-outlined size-fit"
          :label="t('authorization.authorizationCardProponent.more')"
        />
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 flex mb-4">
          <AuthorizationStatusPill
            class="mr-2"
            :state="permit.state"
          />
          <StatusPill
            class="mr-2"
            :stage="permit.stage"
            :border-color="'var(--p-bcblue-900)'"
            :bg-color="'var(--p-bcblue-50)'"
          />
          <div v-if="permit.statusLastVerified">
            <span class="label-verified mr-1">{{ t('authorization.authorizationCardProponent.statusVerified') }}</span>
            <span class="label-date">{{ formatDate(permit.statusLastVerified) }}</span>
          </div>
          <div v-else>
            <span class="label-verified mr-1">
              {{ t('authorization.authorizationCardProponent.statusNotVerified') }}
            </span>
          </div>
        </div>
        <div class="col-span-6">
          <div class="label-field">{{ t('authorization.authorizationCardProponent.latestUpdates') }}</div>
          <div class="permit-data">
            {{
              permit?.permitNote[0]
                ? permit?.permitNote[0].note
                : t('authorization.authorizationCardProponent.noUpdates')
            }}
          </div>
        </div>
        <div class="col-span-3">
          <div class="label-field">{{ t('authorization.authorizationCardProponent.submittedOn') }}</div>
          <div class="permit-data">
            {{ formatDate(permit?.submittedDate) }}
          </div>
        </div>
        <div class="col-span-3">
          <div class="label-field">{{ t('authorization.authorizationCardProponent.agency') }}</div>
          <div class="permit-data">
            {{ permit?.permitType.agency }}
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.permit-card {
  border-color: var(--p-greyscale-100);
  border-style: solid;
  border-width: 0.063rem;
  box-shadow: 0.25rem 0.25rem 0.25rem 0rem $app-proj-black;
  &--hover:hover {
    background-color: var(--p-bcblue-50);
  }
}

.permit-data {
  overflow: auto;
  word-break: break-word;
  text-overflow: ellipsis;
}

.label-field {
  color: #474543;
  font-family: 'BC Sans';
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.label-verified {
  color: #474543;
  font-family: 'BC Sans';
  font-size: 0.75rem;
  font-style: italic;
  font-weight: 400;
}

:deep(.p-card-body) {
  padding: 1.5rem;
}

:deep(.p-card-content) {
  padding: 0rem;
}
</style>
