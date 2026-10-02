<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { DatePicker } from '@/components/form';
import { Panel } from '@/lib/primevue';

// Props
const { editable } = defineProps<{
  editable?: boolean;
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

    <div class="grid grid-cols-3 gap-x-6 gap-y-6 flex">
      <div>
        <DatePicker
          name="consultationStartDate"
          :label="t('authorization.authorizationFirstNationConsultation.consultationStartDate')"
          :disabled="!editable"
        />
      </div>
      <div>
        <DatePicker
          name="consultationEndDate"
          :label="t('authorization.authorizationFirstNationConsultation.consultationEndDate')"
          :disabled="!editable"
        />
      </div>
    </div>
  </Panel>
</template>
