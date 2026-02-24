<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { RadioList, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { BasicResponse } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'RentalUnitsCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex">
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('projectIntakeForm.hasRentalUnitsCard') }}
        </span>
        <Tooltip
          right
          icon="fa-solid fa-circle-question"
          :text="t('projectIntakeForm.rentalUnitsTooltip')"
        />
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <RadioList
          class="col-span-12"
          name="housing.hasRentalUnits"
          :bold="false"
          :disabled="!getEditable"
          :options="YES_NO_UNSURE_LIST"
        />
        <Select
          v-if="values.housing?.hasRentalUnits === BasicResponse.YES"
          class="col-span-6"
          name="housing.rentalUnits"
          :disabled="!getEditable"
          :options="NUM_RESIDENTIAL_UNITS_LIST"
          placeholder="How many expected units?"
        />
      </div>
    </template>
  </Card>
</template>
