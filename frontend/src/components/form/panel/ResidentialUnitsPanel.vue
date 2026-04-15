<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues, useSetFieldValue } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HousingUnits } from '@/components/common/icons';
import { InputText, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Panel } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { BasicResponse } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setOtherUnits = useSetFieldValue('units.otherUnits');
const setOtherUnitsDescription = useSetFieldValue('units.otherUnitsDescription');
const setRentalUnits = useSetFieldValue('units.rentalUnits');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'ResidentialUnitsPanel', tab);
</script>

<template>
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <HousingUnits />
        <h3 class="section-header m-0">
          {{ t('i.housing.project.projectForm.housingUnits') }}
        </h3>
      </div>
    </template>
    <div class="grid grid-cols-3 gap-x-6 gap-y-6">
      <Select
        name="units.singleFamilyUnits"
        :label="t('i.housing.project.projectForm.singleFamilyUnits')"
        :disabled="!getEditable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Select
        name="units.multiFamilyUnits"
        :label="t('i.housing.project.projectForm.multiFamilyUnits')"
        :disabled="!getEditable"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <Select
        name="units.hasRentalUnits"
        :label="t('i.housing.project.projectForm.rentalIncluded')"
        :disabled="!getEditable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="
          (e) => {
            if (e.value !== BasicResponse.YES) setRentalUnits(null);
          }
        "
      />
      <Select
        name="units.rentalUnits"
        :label="t('i.housing.project.projectForm.rentalUnits')"
        :disabled="!getEditable || values.units.hasRentalUnits !== BasicResponse.YES"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
      <InputText
        name="units.otherUnitsDescription"
        :label="t('i.housing.project.projectForm.otherType')"
        :disabled="!getEditable"
        @on-change="
          (e) => {
            if (!e.target.value) {
              setOtherUnitsDescription(null);
              setOtherUnits(null);
            }
          }
        "
      />
      <Select
        name="units.otherUnits"
        :label="t('i.housing.project.projectForm.otherTypeUnits')"
        :disabled="!getEditable || !values.units.otherUnitsDescription"
        :options="NUM_RESIDENTIAL_UNITS_LIST"
      />
    </div>
  </Panel>
</template>
