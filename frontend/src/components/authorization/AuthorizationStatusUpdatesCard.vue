<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { DatePicker, Select, TextArea } from '@/components/form';
import { Message, Panel } from '@/lib/primevue';
import { useCodeStore } from '@/store';
import { PERMIT_NEEDED_LIST } from '@/utils/constants/permit';
import type { PiesOnHold } from '@/utils/enums/codeEnums';

// Props
const {
  editable,
  peachIntegratedAuthType = false,
  peachIntegratedTrackingId = false,
  onHoldCode = undefined,
  showTargetDateDescription = false
} = defineProps<{
  editable?: boolean;
  peachIntegratedAuthType?: boolean;
  peachIntegratedTrackingId?: boolean;
  onHoldCode?: PiesOnHold | null;
  showTargetDateDescription?: boolean;
}>();

// Emits
const emit = defineEmits(['update:setVerifiedDate', 'update:targetDateChanged']);

// Composables
const { t } = useI18n();

// Store
const { codeDefinition, codeDisplay, options } = useCodeStore();
</script>

<template>
  <Panel toggleable>
    <template #header>
      <h3 class="section-header m-0">
        {{ t('authorization.authorizationStatusUpdatesCard.statusUpdates') }}
      </h3>
    </template>
    <div>
      <Message
        v-if="onHoldCode"
        class="mb-4"
        severity="warn"
        :pt:content:class="['!px-2', '!py-2.5']"
      >
        <div class="flex items-center gap-2">
          <font-awesome-icon
            class="text-[color:var(--p-support-warning-icon)]"
            icon="fas fa-circle-exclamation"
          />
          <div class="flex flex-col">
            <strong class="text-xs">
              {{
                t('authorization.authorizationCard.onHoldReason', {
                  reason: codeDisplay.PiesOnHold?.[onHoldCode]
                })
              }}
            </strong>
            <span class="text-xs">
              {{
                t('authorization.authorizationCard.onHoldDefinition', {
                  definition: codeDefinition.PiesOnHold?.[onHoldCode]
                })
              }}
            </span>
          </div>
        </div>
      </Message>
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
            :options="options.PermitState"
            option-label="label"
            option-value="value"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <Select
            name="stage"
            :label="t('authorization.common.applicationStage')"
            :options="options.PermitStage"
            option-label="label"
            option-value="value"
            :disabled="peachIntegratedAuthType || !editable"
          />
        </div>
        <div>
          <Select
            name="needed"
            :label="t('authorization.authorizationStatusUpdatesCard.needed')"
            :options="PERMIT_NEEDED_LIST"
            required
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
