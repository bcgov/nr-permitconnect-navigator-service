<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSetFieldValue } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import { AutoComplete } from '@/components/form';
import { externalApiService } from '@/services';
import { useAppStore, useFormStore } from '@/store';
import { BC_HYDRO_POWER_AUTHORITY } from '@/utils/constants/electrification';
import { Initiative } from '@/utils/enums/application';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { OrgBookOption } from '@/types';

// Props
const orgBookOptions = defineModel<OrgBookOption[]>('orgBookOptions');

// Composables
const { t } = useI18n();
const setRegisteredName = useSetFieldValue('basic.registeredName');
const setRegisteredId = useSetFieldValue('basic.registeredId');

// Store
const { getInitiative } = storeToRefs(useAppStore());
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// Actions
async function onRegisteredNameInput(e: AutoCompleteCompleteEvent) {
  if (e?.query?.length >= 2) {
    const results = (await externalApiService.searchOrgBook({ query: e.query }))?.results ?? [];
    let suggestions: OrgBookOption[] = results
      .filter((obo) => obo.type === 'name')
      // map value and topic_source_id for AutoComplete display and selection
      .map((obo) => ({
        registeredName: obo.value,
        registeredId: obo.topic_source_id
      }));

    // If the searched company name includes BC Hydro Power Authority, add it as an option since it is not registered
    if (
      getInitiative.value === Initiative.ELECTRIFICATION &&
      BC_HYDRO_POWER_AUTHORITY.includes(e.query.toUpperCase())
    ) {
      suggestions.push({
        registeredName: BC_HYDRO_POWER_AUTHORITY,
        registeredId: undefined
      });
    }

    // Sort options alphabetically
    suggestions.sort((a: OrgBookOption, b: OrgBookOption) => a.registeredName.localeCompare(b.registeredName));

    orgBookOptions.value = suggestions;
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
