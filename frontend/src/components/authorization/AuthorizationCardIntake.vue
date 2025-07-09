<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { FieldArray } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';

import { Checkbox, InputText, Select } from '@/components/form';
import { Button, Panel } from '@/lib/primevue';
import { permitService, sourceSystemKindService } from '@/services';
import { useAppStore, useCodeStore, usePermitStore } from '@/store';

import type { Ref } from 'vue';
import type { SourceSystemKind } from '@/types';

// Emits
const emit = defineEmits(['update:uncheckShownToProponent']);

// Composables
const { t } = useI18n();
const codeStore = useCodeStore();
const permitStore = usePermitStore();

// Store

const { codeDisplay } = codeStore;
const { getPermitTypes } = storeToRefs(permitStore);

// State
const sourceSystemKinds: Ref<Array<SourceSystemKind>> = ref([]);

// Actions
onMounted(async () => {
  if (getPermitTypes.value.length === 0) {
    const permitTypes = (await permitService.getPermitTypes(useAppStore().getInitiative)).data;
    permitStore.setPermitTypes(permitTypes);
  }

  sourceSystemKinds.value = (await sourceSystemKindService.getSourceSystemKinds()).data;
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
            <div class="grid grid-cols-3 gap-x-6 gap-y-6 mt-2">
              <Select
                :name="`permitTracking[${idx}].sourceSystemKindId`"
                :placeholder="t('authorization.authorizationCardIntake.selectId')"
                :options="sourceSystemKinds"
                :option-label="(e) => `${e.description}, ${codeDisplay.SourceSystem[e.sourceSystem]}`"
                option-value="sourceSystemKindId"
              />
              <InputText
                :name="`permitTracking[${idx}].trackingId`"
                :placeholder="t('authorization.authorizationCardIntake.typeNumber')"
              />
              <div class="flex">
                <Checkbox
                  :name="`permitTracking[${idx}].shownToProponent`"
                  :label="t('authorization.authorizationCardIntake.shownToProponent')"
                  :checked="`permitTracking[${idx}].shownToProponent`"
                  @change="emit('update:uncheckShownToProponent', idx)"
                />
                <Button
                  class="p-button-lg p-button-text p-button-danger ml-7"
                  aria-label="Delete tracking ID"
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
        />
      </div>
    </div>
  </Panel>
</template>
