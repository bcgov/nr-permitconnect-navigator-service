<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { FieldArray, useFieldArray } from 'vee-validate';
import { nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import Divider from '@/components/common/Divider.vue';
import { DatePicker, InputText, Select } from '@/components/form';
import { Button, Card } from '@/lib/primevue';
import { useFormStore, usePermitStore } from '@/store';
import { getHTMLElement } from '@/utils/utils';

import type { PermitType } from '@/types';

// Props
const { defaultRow = undefined, header = undefined } = defineProps<{
  defaultRow?: {
    permitTypeId?: number;
    trackingId?: number;
    submittedDate?: Date;
  };
  header?: string;
}>();

// Composables
const { t } = useI18n();
const fieldArray = useFieldArray('permits.appliedPermits');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);
const { getInitiativePermitTypes } = storeToRefs(usePermitStore());

// Actions
onMounted(() => {
  if (defaultRow && fieldArray.fields.value.length === 0) fieldArray.push(defaultRow);
});
</script>

<template>
  <div ref="appliedPermitsContainer">
    <Card class="no-shadow">
      <template
        v-if="header"
        #title
      >
        <h6
          class="section-header"
          aria-level="2"
        >
          {{ header }}
        </h6>
        <Divider type="solid" />
      </template>
      <template #content>
        <FieldArray
          v-slot="{ fields, push, remove }"
          name="permits.appliedPermits"
        >
          <div
            v-for="(permit, idx) in fields"
            :key="idx"
            :index="idx"
            class="grid grid-cols-3 gap-3"
          >
            <div>
              <input
                type="hidden"
                :name="`permits.appliedPermits[${idx}].permitId`"
              />
              <Select
                :disabled="!getEditable"
                :name="`permits.appliedPermits[${idx}].permitTypeId`"
                :placeholder="t('appliedPermitsCard.placeholders.permitTypeId')"
                :options="getInitiativePermitTypes"
                :option-label="(e: PermitType) => `${e.businessDomain}: ${e.name}`"
                option-value="permitTypeId"
                :loading="getInitiativePermitTypes.length === 0"
              />
            </div>
            <InputText
              :name="`permits.appliedPermits[${idx}].permitTracking[0].trackingId`"
              :disabled="!getEditable"
              :placeholder="t('appliedPermitsCard.placeholders.trackingId')"
            />
            <div class="flex justify-center">
              <DatePicker
                class="w-full"
                :name="`permits.appliedPermits[${idx}].submittedDate`"
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
            outlined
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
        </FieldArray>
      </template>
    </Card>
  </div>
</template>
