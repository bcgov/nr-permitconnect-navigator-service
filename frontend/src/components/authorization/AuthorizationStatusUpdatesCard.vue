<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { DatePicker, Select, TextArea } from '@/components/form';
import { Panel } from '@/lib/primevue';
import { PERMIT_NEEDED_LIST, PERMIT_STAGE_LIST, PERMIT_STATE_LIST } from '@/utils/constants/permit';
import { PermitState } from '@/utils/enums/permit';

// Props
const {
  editable,
  peachIntegratedAuthType = false,
  peachIntegratedTrackingId = false,
  showTargetDateDescription = false
} = defineProps<{
  editable?: boolean;
  peachIntegratedAuthType?: boolean;
  peachIntegratedTrackingId?: boolean;
  showTargetDateDescription?: boolean;
}>();

// Emits
const emit = defineEmits(['update:setVerifiedDate', 'update:targetDateChanged']);

// Composables
const { t } = useI18n();

const stateDisplayText = {
  [PermitState.CANCELLED]: t('authorization.authorizationStatePill.cancelledByReviewingAuthority')
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
            :label="t('authorization.common.applicationStage')"
            :options="PERMIT_STAGE_LIST"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
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
            :label="t('authorization.common.submittedDate')"
            :max-date="new Date()"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <DatePicker
            name="statusLastChanged"
            :label="t('authorization.common.statusChangeDate')"
            :max-date="new Date()"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <DatePicker
            name="decisionDate"
            :label="t('authorization.common.decisionDate')"
            :max-date="new Date()"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <span>
            <span class="font-bold text-[var(--p-primary-900)] mr-2">
              {{ t('authorization.common.targetDate') }}
            </span>
            <Tooltip
              right
              icon="fa-solid fa-circle-question"
              :text="t('authorization.authorizationStatusUpdatesCard.targetDateTooltip')"
            />
            <DatePicker
              class="mt-2"
              name="targetDate"
              :disabled="!editable"
            />
          </span>
        </div>
      </div>
      <div
        v-if="showTargetDateDescription"
        class="mt-4"
      >
        <span class="font-bold text-[var(--p-primary-900)] mr-2">
          {{ t('authorization.authorizationStatusUpdatesCard.targetDateDescription') }}
        </span>
        <Tooltip
          right
          icon="fa-solid fa-circle-question"
          :text="t('authorization.authorizationStatusUpdatesCard.targetDateDescriptionTooltip')"
        />
        <TextArea
          class="col-span-12 mt-2"
          name="targetDateDescription"
          :disabled="!editable"
        />
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
