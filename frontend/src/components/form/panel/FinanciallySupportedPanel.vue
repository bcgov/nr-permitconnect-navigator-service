<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues, useSetFieldValue } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FinanciallySupported } from '@/components/common/icons';
import { InputText, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Panel } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { BasicResponse } from '@/utils/enums/application';

import type { SelectChangeEvent } from 'primevue/select';
import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setHousingCoopDescription = useSetFieldValue('finance.housingCoopDescription');
const setIndigenousDescription = useSetFieldValue('finance.indigenousDescription');
const setNonProfitDescription = useSetFieldValue('finance.nonProfitDescription');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'FinanciallySupportedPanel', tab);
</script>

<template>
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <FinanciallySupported />
        <h3 class="section-header m-0">
          {{ t('i.housing.project.projectForm.financiallySupported') }}
        </h3>
      </div>
    </template>
    <div class="col-span-1 grid grid-cols-2 gap-x-6 gap-y-6">
      <Select
        class="col-span-1"
        name="finance.financiallySupportedBc"
        :label="t('i.housing.project.projectForm.bcHousing')"
        :disabled="!getEditable"
        :options="YES_NO_UNSURE_LIST"
      />
      <div class="col-span-1 grid grid-row">
        <h6 class="font-bold mb-2">{{ t('i.housing.project.projectForm.indigenousHousingProvider') }}</h6>
        <div class="grid grid-cols-4 gap-x-3">
          <Select
            class="col-span-1"
            name="finance.financiallySupportedIndigenous"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
            @on-change="
              (e) => {
                if (e.value !== BasicResponse.YES) setIndigenousDescription(null);
              }
            "
          />
          <InputText
            class="col-span-3"
            name="finance.indigenousDescription"
            :placeholder="t('i.housing.project.projectForm.nameOfOrganization')"
            :disabled="!getEditable || values.finance.financiallySupportedIndigenous !== BasicResponse.YES"
          />
        </div>
      </div>
      <div class="col-span-1 grid grid-row">
        <h6 class="font-bold mb-2">{{ t('i.housing.project.projectForm.nonProfitHousingSociety') }}</h6>
        <div class="grid grid-cols-4 gap-x-3">
          <Select
            class="col-span-1"
            name="finance.financiallySupportedNonProfit"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
            @on-change="
              (e) => {
                if (e.value !== BasicResponse.YES) setNonProfitDescription(null);
              }
            "
          />
          <InputText
            class="col-span-3"
            name="finance.nonProfitDescription"
            :placeholder="t('i.housing.project.projectForm.nameOfOrganization')"
            :disabled="!getEditable || values.finance.financiallySupportedNonProfit !== BasicResponse.YES"
          />
        </div>
      </div>

      <div class="col-span-1 grid grid-row">
        <h6 class="font-bold mb-2">{{ t('i.housing.project.projectForm.housingCoop') }}</h6>
        <div class="grid grid-cols-4 gap-x-3">
          <Select
            class="col-span-1"
            name="finance.financiallySupportedHousingCoop"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
            @on-change="
              (e) => {
                if (e.value !== BasicResponse.YES) setHousingCoopDescription(null);
              }
            "
          />
          <InputText
            class="col-span-3"
            name="finance.housingCoopDescription"
            :placeholder="t('i.housing.project.projectForm.nameOfOrganization')"
            :disabled="!getEditable || values.finance.financiallySupportedHousingCoop !== BasicResponse.YES"
          />
        </div>
      </div>
    </div>
  </Panel>
</template>
