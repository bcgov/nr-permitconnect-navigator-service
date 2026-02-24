<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ErrorMessage, useFormErrors, useFormValues, useIsFormTouched } from 'vee-validate';
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
const errors = useFormErrors();
const touched = useIsFormTouched();
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
      <span
        class="section-header"
        role="heading"
        aria-level="2"
      >
        {{ t('projectIntakeForm.singleFamilySelectedCard') }}
      </span>
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
            :invalid="!!errors.housing && touched"
          />
        </div>
        <Select
          v-if="values.housing?.singleFamilySelected"
          class="col-span-6"
          name="housing.singleFamilyUnits"
          :disabled="!getEditable || !values.housing?.singleFamilySelected"
          :options="NUM_RESIDENTIAL_UNITS_LIST"
          placeholder="How many expected units?"
        />
        <div class="col-span-12">
          <div class="flex">
            <Checkbox
              class="content-center"
              name="housing.multiFamilySelected"
              label="Multi-family"
              :bold="false"
              :disabled="!getEditable"
              :invalid="!!errors.housing && touched"
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
          placeholder="How many expected units?"
        />
        <div class="col-span-12">
          <Checkbox
            name="housing.otherSelected"
            label="Other"
            :bold="false"
            :disabled="!getEditable"
            :invalid="!!errors?.housing && touched"
          />
        </div>
        <InputText
          v-if="values.housing?.otherSelected"
          class="col-span-6"
          name="housing.otherUnitsDescription"
          :disabled="!getEditable || !values.housing?.otherSelected"
          placeholder="Type to describe what other type of housing"
        />
        <div class="col-span-6" />
        <Select
          v-if="values.housing?.otherSelected"
          class="col-span-6"
          name="housing.otherUnits"
          :disabled="!getEditable || !values.housing?.otherSelected"
          :options="NUM_RESIDENTIAL_UNITS_LIST"
          placeholder="How many expected units?"
        />
        <ErrorMessage
          v-if="touched"
          class="col-span-12"
          name="housing"
        />
      </div>
    </template>
  </Card>
</template>
