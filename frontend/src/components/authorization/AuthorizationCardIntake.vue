<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { FieldArray } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref } from 'vue';

import { Checkbox, InputText, Select } from '@/components/form';
import { Button, Panel } from '@/lib/primevue';
import { permitService, sourceSystemKindService } from '@/services';
import { useAppStore, useCodeStore, usePermitStore } from '@/store';

import type { Ref } from 'vue';
import type { SourceSystemKind } from '@/types';

// Props
const { editable } = defineProps<{
  editable?: boolean;
}>();

// Emits
const emit = defineEmits(['update:uncheckShownToProponent']);

// Composables
const { locale, t } = useI18n();
const codeStore = useCodeStore();
const permitStore = usePermitStore();

// Store

const { codeDisplay } = codeStore;
const { getPermitTypes } = storeToRefs(permitStore);

// State
const sourceSystemKinds: Ref<Array<SourceSystemKind>> = ref([]);

// Actions
const sortForDisplayOrder = (a: SourceSystemKind, b: SourceSystemKind) => {
  const srcSysCompare = codeDisplay.SourceSystem[a.sourceSystem].localeCompare(
    codeDisplay.SourceSystem[b.sourceSystem],
    locale.value,
    { sensitivity: 'base' }
  );
  if (srcSysCompare !== 0) return srcSysCompare;
  return a.description.localeCompare(b.description, locale.value, { sensitivity: 'base' });
};

onBeforeMount(async () => {
  if (getPermitTypes.value.length === 0) {
    const permitTypes = (await permitService.getPermitTypes(useAppStore().getInitiative)).data;
    permitStore.setPermitTypes(permitTypes);
  }

  const data = (await sourceSystemKindService.getSourceSystemKinds()).data;
  sourceSystemKinds.value = data.sort(sortForDisplayOrder);
});
</script>

<template>
  <Panel toggleable>
    <template #header>
      <h3>{{ t('authorization.authorizationCardIntake.authorizationTypeID') }}</h3>
    </template>
    <div>
      <Select
        name="authorizationType"
        :label="t('authorization.authorizationCardIntake.authorization')"
        :placeholder="t('authorization.authorizationCardIntake.selectAuthorization')"
        :options="getPermitTypes"
        :option-label="(e) => `${e.businessDomain}: ${e.name}`"
        :disabled="!editable"
      />
      <div class="mt-5 mb-3 font-bold text-[var(--p-bcblue-900)]">
        {{ t('authorization.authorizationCardIntake.trackingIds') }}
      </div>
      <FieldArray
        v-slot="{ fields, push, remove }"
        name="permitTracking"
      >
        <div>
          <div
            v-for="(tracking, idx) in fields"
            :key="idx"
            :index="idx"
          >
            <input
              type="hidden"
              name="permitTrackingId"
            />
            <div class="grid grid-cols-3 gap-x-6 gap-y-6 mt-2">
              <Select
                :name="`permitTracking[${idx}].sourceSystemKindId`"
                :placeholder="t('authorization.authorizationCardIntake.selectId')"
                :options="sourceSystemKinds"
                :option-label="(e) => `${e.description}, ${codeDisplay.SourceSystem[e.sourceSystem]}`"
                option-value="sourceSystemKindId"
                :disabled="!editable"
              />
              <InputText
                :name="`permitTracking[${idx}].trackingId`"
                :placeholder="t('authorization.authorizationCardIntake.typeNumber')"
                :disabled="!editable"
              />
              <div class="flex">
                <Checkbox
                  :name="`permitTracking[${idx}].shownToProponent`"
                  :label="t('authorization.authorizationCardIntake.shownToProponent')"
                  :checked="`permitTracking[${idx}].shownToProponent`"
                  :disabled="!editable"
                  @change="emit('update:uncheckShownToProponent', idx)"
                />
                <Button
                  class="p-button-lg p-button-text p-button-danger ml-7"
                  aria-label="Delete tracking ID"
                  :disabled="!editable"
                  @click="remove(idx)"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            class="p-button mt-2"
            aria-label="Add an ID"
            :disabled="!editable"
            @click="push({ sourceSystemKindId: undefined, trackingId: '', shownToProponent: false })"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            {{ t('authorization.authorizationCardIntake.addId') }}
          </Button>
        </div>
      </FieldArray>
      <div class="grid grid-cols-3 gap-x-6 gap-y-6 mt-6">
        <InputText
          name="issuedPermitId"
          :label="t('authorization.authorizationCardIntake.issuedPermitId')"
          :disabled="!editable"
        />
      </div>
    </div>
  </Panel>
</template>
