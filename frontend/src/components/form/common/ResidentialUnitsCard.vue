<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useField, useFormValues } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { Checkbox, InputText, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
// Carries only the group error, so it stays hidden until the form validates it
const { errorMessage: unitTypesError } = useField('housing.unitTypes');
const values = useFormValues();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'ResidentialUnitsCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <h6
        class="section-header"
        aria-level="2"
      >
        {{ t('projectIntakeForm.residentialUnitsCard.selectUnitTypes') }}
        <span class="text-[var(--p-support-required-text)]">*</span>
      </h6>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
          <Checkbox
            name="housing.singleFamilySelected"
            label="Single-family"
            :bold="false"
            :disabled="!getEditable"
          />
        </div>
        <Select
          v-if="values.housing?.singleFamilySelected"
          class="col-span-6"
          name="housing.singleFamilyUnits"
          :disabled="!getEditable || !values.housing?.singleFamilySelected"
          :options="NUM_RESIDENTIAL_UNITS_LIST"
          :placeholder="t('projectIntakeForm.common.noOfExpectedUnits')"
        />
        <div class="col-span-12">
          <div class="flex">
            <Checkbox
              class="content-center"
              name="housing.multiFamilySelected"
              label="Multi-family"
              :bold="false"
              :disabled="!getEditable"
            />
            <Tooltip
              class="pl-2"
              right
              icon="fa-solid fa-circle-question"
              :text="t('projectIntakeForm.multiFamilyTooltip')"
            />
          </div>
        </div>
        <Select
          v-if="values.housing?.multiFamilySelected"
          class="col-span-6 content-center"
          name="housing.multiFamilyUnits"
          :disabled="!getEditable || !values.housing?.multiFamilySelected"
          :options="NUM_RESIDENTIAL_UNITS_LIST"
          :placeholder="t('projectIntakeForm.common.noOfExpectedUnits')"
        />
        <div class="col-span-12">
          <Checkbox
            name="housing.otherSelected"
            label="Other"
            :bold="false"
            :disabled="!getEditable"
          />
          <div
            v-if="unitTypesError"
            class="mt-2 app-error-message"
          >
            {{ unitTypesError }}
          </div>
        </div>
        <InputText
          v-if="values.housing?.otherSelected"
          class="col-span-6"
          name="housing.otherUnitsDescription"
          :disabled="!getEditable || !values.housing?.otherSelected"
          :placeholder="t('projectIntakeForm.residentialUnitsCard.typesOfHousing')"
        />
        <div
          v-if="values.housing?.otherSelected"
          class="col-span-6"
        />
        <Select
          v-if="values.housing?.otherSelected"
          class="col-span-6"
          name="housing.otherUnits"
          :disabled="!getEditable || !values.housing?.otherSelected"
          :options="NUM_RESIDENTIAL_UNITS_LIST"
          :placeholder="t('projectIntakeForm.common.noOfExpectedUnits')"
        />
      </div>
    </template>
  </Card>
</template>
