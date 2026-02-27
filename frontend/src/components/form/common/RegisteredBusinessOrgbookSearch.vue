<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSetFieldValue } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import { AutoComplete } from '@/components/form';
import { externalApiService } from '@/services';
import { useFormStore } from '@/store';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { OrgBookOption } from '@/types';

// Props
const orgBookOptions = defineModel<OrgBookOption[]>('orgBookOptions');

// Composables
const { t } = useI18n();
const setRegisteredName = useSetFieldValue('basic.registeredName');
const setRegisteredId = useSetFieldValue('basic.registeredId');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// Actions
async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook(e.query))?.data?.results ?? [];
    orgBookOptions.value = results
      .filter((obo: Record<string, string>) => obo.type === 'name')
      // map value and topic_source_id for AutoComplete display and selection
      .map((obo: Record<string, string>) => ({
        registeredName: obo.value,
        registeredId: obo.topic_source_id
      }));
  }
}
</script>

<template>
  <AutoComplete
    class="col-span-6 pl-0"
    name="basic.registeredName"
    :bold="false"
    :disabled="!getEditable"
    :editable="true"
    :placeholder="t('registeredBusinessCard.placeholders.inBcRegisteredName')"
    :get-option-label="(option: OrgBookOption) => option.registeredName"
    :suggestions="orgBookOptions ?? []"
    @on-complete="onRegisteredNameInput"
    @on-select="
      (orgBookOption: OrgBookOption) => {
        setRegisteredId(orgBookOption.registeredId);
        setRegisteredName(orgBookOption.registeredName);
      }
    "
  />
</template>
