<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFieldArray, useFormValues, useSetFieldValue } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { RadioList } from '@/components/form';
import AppliedPermitsCard from '@/components/form/common/AppliedPermitsCard.vue';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { BasicResponse } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab } = defineProps<{
  tab: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setAppliedPermits = useSetFieldValue('permits.appliedPermits');
const fieldArray = useFieldArray('permits.appliedPermits');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
function onPermitsHasAppliedChange(e: string) {
  if (e === BasicResponse.YES || e === BasicResponse.UNSURE) {
    if (fieldArray.fields.value.length === 0) {
      fieldArray.push({
        permitTypeId: undefined,
        trackingId: undefined,
        submittedDate: undefined
      });
    }
  } else {
    setAppliedPermits(undefined);
  }
}

useFormErrorWatcher(formRef, 'AppliedPermitsCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex">
        <h6
          class="section-header"
          aria-level="2"
        >
          {{ t('appliedPermitsCard.header') }}
          <span class="text-[var(--p-support-required-text)]">*</span>
        </h6>
        <Tooltip
          class="mb-2"
          right
          icon="fa-solid fa-circle-question"
          :text="t('appliedPermitsCard.headerTooltip')"
        />
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <RadioList
        name="permits.hasAppliedProvincialPermits"
        :bold="false"
        :disabled="!getEditable"
        :options="YES_NO_UNSURE_LIST"
        @on-change="(e: string) => onPermitsHasAppliedChange(e)"
      />
      <div
        v-if="
          values.permits?.hasAppliedProvincialPermits === BasicResponse.YES ||
          values.permits?.hasAppliedProvincialPermits === BasicResponse.UNSURE
        "
      >
        <div class="mb-2">
          <span class="app-primary-color">
            {{ t('appliedPermitsCard.shareNotification') }}
          </span>
        </div>

        <AppliedPermitsCard />
      </div>
    </template>
  </Card>
</template>
