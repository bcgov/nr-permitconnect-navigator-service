<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { FieldArray } from 'vee-validate';
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Button, Divider } from '@/lib/primevue';
import { useFormStore, usePermitStore } from '@/store';
import { getHTMLElement } from '@/utils/utils';

import type { ComponentPublicInstance, Ref } from 'vue';
import type { PermitType } from '@/types';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);
const { getPermitTypes } = storeToRefs(usePermitStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'InvestigatePermitsCard', tab);
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
          {{ t('projectIntakeForm.investigatePermitsCard') }}
        </span>
        <Tooltip
          right
          icon="fa-solid fa-circle-question"
          :text="t('projectIntakeForm.potentialPermitsTooltip')"
        />
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <FieldArray
        v-slot="{ fields, push, remove }"
        name="investigatePermits"
      >
        <Card class="no-shadow">
          <template #content>
            <div ref="investigatePermitsContainer">
              <div
                v-for="(permit, idx) in fields"
                :key="idx"
                :index="idx"
                class="grid grid-cols-3"
              >
                <div class="col-span-1">
                  <div class="flex">
                    <Select
                      class="w-full"
                      :disabled="!getEditable"
                      :name="`investigatePermits[${idx}].permitTypeId`"
                      placeholder="Select Permit type"
                      :options="getPermitTypes"
                      :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
                      option-value="permitTypeId"
                      :loading="getPermitTypes === undefined"
                    />
                    <div class="flex items-center ml-2 mb-6">
                      <Button
                        v-if="getEditable"
                        class="p-button-lg p-button-text p-button-danger p-0"
                        aria-label="Delete"
                        @click="remove(idx)"
                      >
                        <font-awesome-icon icon="fa-solid fa-trash" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                v-if="getEditable"
                class="w-full flex justify-center font-bold h-10"
                @click="
                  push({ permitTypeId: undefined });
                  nextTick(() => {
                    const newPermitDropdown = getHTMLElement(
                      $refs.investigatePermitsContainer as HTMLElement,
                      'div[name*=\'investigatePermits\'] span[role=\'combobox\']'
                    );
                    if (newPermitDropdown) {
                      newPermitDropdown.focus();
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
            </div>
          </template>
        </Card>
      </FieldArray>
    </template>
  </Card>
</template>
