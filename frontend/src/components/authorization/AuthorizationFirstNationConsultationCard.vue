<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { DatePicker } from '@/components/form';
import { Panel } from '@/lib/primevue';

// Props
const { editable, peachIntegratedAuthType = false } = defineProps<{
  editable?: boolean;
  peachIntegratedAuthType?: boolean;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <Panel toggleable>
    <template #header>
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-header m-0">
          {{ t('authorization.authorizationFirstNationConsultation.firstNationConsultation') }}
        </h3>
        <Tooltip
          right
          icon="fa-solid fa-circle-question"
          :text="t('authorization.authorizationFirstNationConsultation.toolTip')"
        />
      </div>
    </template>

    <div class="flex gap-x-6 gap-y-6">
      <div class="w-1/3">
        <DatePicker
          name="consultationStartDate"
          :label="t('authorization.authorizationFirstNationConsultation.consultationStartDate')"
          :disabled="peachIntegratedAuthType || !editable"
        />
      </div>
      <div class="w-1/3">
        <DatePicker
          name="consultationEndDate"
          :label="t('authorization.authorizationFirstNationConsultation.consultationEndDate')"
          :disabled="peachIntegratedAuthType || !editable"
        />
      </div>
    </div>
  </Panel>
</template>
