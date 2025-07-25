<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { DatePicker, Select, TextArea } from '@/components/form';
import { Panel } from '@/lib/primevue';
import { PERMIT_AUTHORIZATION_STATUS_LIST, PERMIT_NEEDED_LIST, PERMIT_STATUS_LIST } from '@/utils/constants/permit';

// Emits
const emit = defineEmits(['update:setVerifiedDate']);

// Composables
const { t } = useI18n();
</script>

<template>
  <Panel toggleable>
    <template #header>
      <h3 class="section-header m-0">
        {{ t('authorization.authorizationStatusUpdatesCard.statusUpdates') }}
      </h3>
    </template>
    <div>
      <div class="grid grid-cols-3 gap-x-6 gap-y-6 flex">
        <div>
          <div class="flex justify-between mb-2">
            <div class="font-bold text-[var(--p-bcblue-900)]">
              {{ t('authorization.authorizationStatusUpdatesCard.statusVerifiedDate') }}
            </div>
            <div class="cursor-pointer">
              <a @click="emit('update:setVerifiedDate')">
                {{ t('authorization.authorizationStatusUpdatesCard.updateToToday') }}
              </a>
            </div>
          </div>
          <DatePicker
            name="statusLastVerified"
            :max-date="new Date()"
          />
        </div>
        <div>
          <Select
            name="authStatus"
            :label="t('authorization.authorizationStatusUpdatesCard.authorizationStatus')"
            :options="PERMIT_AUTHORIZATION_STATUS_LIST"
          />
        </div>
        <div>
          <Select
            name="status"
            :label="t('authorization.authorizationStatusUpdatesCard.applicationStage')"
            :options="PERMIT_STATUS_LIST"
          />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-x-6 gap-y-6 mt-4">
        <div>
          <Select
            name="needed"
            :label="t('authorization.authorizationStatusUpdatesCard.needed')"
            :options="PERMIT_NEEDED_LIST"
          />
        </div>
        <div>
          <DatePicker
            name="submittedDate"
            :label="t('authorization.authorizationStatusUpdatesCard.submittedDate')"
            :max-date="new Date()"
          />
        </div>
        <div>
          <DatePicker
            name="adjudicationDate"
            :label="t('authorization.authorizationStatusUpdatesCard.decisionDate')"
            :max-date="new Date()"
          />
        </div>
      </div>
      <div class="mt-4">
        <TextArea
          :label="t('authorization.authorizationStatusUpdatesCard.updateNoteForProponent')"
          class="col-span-12"
          name="permitNote"
        />
      </div>
    </div>
  </Panel>
</template>
<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
