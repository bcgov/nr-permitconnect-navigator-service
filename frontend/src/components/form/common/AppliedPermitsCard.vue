<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { FieldArray, useFormValues, useSetFieldValue } from 'vee-validate';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { InputText, DatePicker, RadioList, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Button, Divider } from '@/lib/primevue';
import { useFormStore, usePermitStore } from '@/store';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { BasicResponse } from '@/utils/enums/application';
import { getHTMLElement } from '@/utils/utils';

import type { ComponentPublicInstance, Ref } from 'vue';
import type { PermitType } from '@/types';

// Props
const { tab } = defineProps<{
  tab: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setAppliedPermits = useSetFieldValue('appliedPermits');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);
const { getPermitTypes } = storeToRefs(usePermitStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
function onPermitsHasAppliedChange(e: string, fieldsLength: number, push: (value: unknown) => void) {
  if (e === BasicResponse.YES || e === BasicResponse.UNSURE) {
    if (fieldsLength === 0) {
      push({
        permitTypeId: undefined,
        trackingId: undefined,
        stage: undefined
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
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('appliedPermitsCard.header') }}
        </span>
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
      <FieldArray
        v-slot="{ fields, push, remove }"
        name="appliedPermits"
      >
        <RadioList
          name="permits.hasAppliedProvincialPermits"
          :bold="false"
          :disabled="!getEditable"
          :options="YES_NO_UNSURE_LIST"
          @on-change="(e: string) => onPermitsHasAppliedChange(e, fields.length, push)"
        />
        <div
          v-if="
            values.permits?.hasAppliedProvincialPermits === BasicResponse.YES ||
            values.permits?.hasAppliedProvincialPermits === BasicResponse.UNSURE
          "
          ref="appliedPermitsContainer"
        >
          <div class="mb-2">
            <span class="app-primary-color">
              {{ t('appliedPermitsCard.shareNotification') }}
            </span>
          </div>
          <Card class="no-shadow">
            <template #content>
              <div
                v-for="(permit, idx) in fields"
                :key="idx"
                :index="idx"
                class="grid grid-cols-3 gap-3"
              >
                <div>
                  <input
                    type="hidden"
                    :name="`appliedPermits[${idx}].permitId`"
                  />
                  <Select
                    :disabled="!getEditable"
                    :name="`appliedPermits[${idx}].permitTypeId`"
                    :placeholder="t('appliedPermitsCard.placeholders.permitTypeId')"
                    :options="getPermitTypes"
                    :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
                    option-value="permitTypeId"
                    :loading="getPermitTypes === undefined"
                  />
                </div>
                <InputText
                  :name="`appliedPermits[${idx}].permitTracking[0].trackingId`"
                  :disabled="!getEditable"
                  :placeholder="t('appliedPermitsCard.placeholders.trackingId')"
                />
                <div class="flex justify-center">
                  <DatePicker
                    class="w-full"
                    :name="`appliedPermits[${idx}].submittedDate`"
                    :disabled="!getEditable"
                    :placeholder="t('appliedPermitsCard.placeholders.submittedDate')"
                    :max-date="new Date()"
                  />
                  <div class="flex items-center ml-2 mb-4">
                    <Button
                      v-if="getEditable"
                      class="p-button-lg p-button-text p-button-danger p-0"
                      :aria-label="t('ui.actions.delete')"
                      @click="remove(idx)"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                v-if="getEditable"
                class="w-full flex justify-center font-bold h-10"
                @click="
                  push({
                    permitTypeId: undefined,
                    trackingId: undefined,
                    submittedDate: undefined
                  });
                  nextTick(() => {
                    const addedPermit = getHTMLElement(
                      $refs.appliedPermitsContainer as HTMLElement,
                      'div[name*=\'permitTypeId\'] span[role=\'combobox\']'
                    );
                    if (addedPermit) {
                      addedPermit.focus();
                    }
                  });
                "
              >
                <font-awesome-icon
                  icon="fa-solid fa-plus"
                  fixed-width
                />
                Add permit
              </Button>
            </template>
          </Card>
        </div>
      </FieldArray>
    </template>
  </Card>
</template>
