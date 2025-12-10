<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { DatePicker, Select, TextArea } from '@/components/form';
import { Panel } from '@/lib/primevue';
import { PERMIT_NEEDED_LIST, PERMIT_STAGE_LIST, PERMIT_STATE_LIST } from '@/utils/constants/permit';
import { PermitState } from '@/utils/enums/permit';

// Props
const {
  editable,
  peachIntegratedAuthType = false,
  peachIntegratedTrackingId = false
} = defineProps<{
  editable?: boolean;
  peachIntegratedAuthType?: boolean;
  peachIntegratedTrackingId?: boolean;
}>();

// Emits
const emit = defineEmits(['update:setVerifiedDate']);

// Composables
const { t } = useI18n();

const stateDisplayText = {
  [PermitState.CANCELLED]: t('authorization.authorizationStatusPill.cancelledByReviewingAuthority')
};
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
            :disabled="!editable"
          />
        </div>
        <div>
          <Select
            name="state"
            :label="t('authorization.authorizationStatusUpdatesCard.authorizationStatus')"
            :options="PERMIT_STATE_LIST"
            :option-label="(option) => stateDisplayText[option as keyof typeof stateDisplayText] ?? option"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <Select
            name="stage"
            :label="t('authorization.authorizationStatusUpdatesCard.applicationStage')"
            :options="PERMIT_STAGE_LIST"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-x-6 gap-y-6 mt-4">
        <div>
          <Select
            name="needed"
            :label="t('authorization.authorizationStatusUpdatesCard.needed')"
            :options="PERMIT_NEEDED_LIST"
            :disabled="(peachIntegratedAuthType && peachIntegratedTrackingId) || !editable"
          />
        </div>
        <div>
          <DatePicker
            name="submittedDate"
            :label="t('authorization.authorizationStatusUpdatesCard.submittedDate')"
            :max-date="new Date()"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <DatePicker
            name="statusLastChanged"
            :label="t('authorization.authorizationStatusUpdatesCard.statusChangeDate')"
            :max-date="new Date()"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <DatePicker
            name="decisionDate"
            :label="t('authorization.authorizationStatusUpdatesCard.decisionDate')"
            :max-date="new Date()"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
      </div>
      <div class="mt-4">
        <TextArea
          :label="t('authorization.authorizationStatusUpdatesCard.updateNoteForProponent')"
          class="col-span-12"
          name="permitNote"
          :disabled="!editable"
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
