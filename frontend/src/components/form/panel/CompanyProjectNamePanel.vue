<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSetFieldValue } from 'vee-validate';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Company } from '@/components/common/icons';
import { AutoComplete, InputText, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Panel } from '@/lib/primevue';
import { externalApiService } from '@/services';
import { useAppStore, useFormStore } from '@/store';
import { updateLiveNameKey } from '@/utils/keys';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { ComponentPublicInstance, Ref } from 'vue';
import type { OrgBookOption } from '@/types';
import { YES_NO_LIST } from '@/utils/constants/application';
import { Initiative } from '@/utils/enums/application';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Injections
const updateLiveName = inject(updateLiveNameKey);

if (!updateLiveName) {
  throw new Error('updateLiveName not provided');
}

// Composables
const { t } = useI18n();
const setCompanyIdRegistered = useSetFieldValue('companyProjectName.companyIdRegistered');
const setCompanyNameRegistered = useSetFieldValue('companyProjectName.companyNameRegistered');

// Store
const { getInitiative } = storeToRefs(useAppStore());
const { getEditable } = storeToRefs(useFormStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);
const orgBookOptions: Ref<OrgBookOption[]> = ref([]);

// Actions
useFormErrorWatcher(formRef, 'CompanyProjectNamePanel', tab);

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
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <Company />
        <h3 class="section-header m-0">
          {{ t('i.housing.project.projectForm.companyProject') }}
        </h3>
      </div>
    </template>
    <div class="grid grid-cols-3 gap-x-6 gap-y-6">
      <InputText
        name="companyProjectName.projectName"
        :label="t('i.housing.project.projectForm.projectNameLabel')"
        :disabled="!getEditable"
        @on-input="(e: Event) => updateLiveName((e.target as HTMLInputElement).value)"
      />
      <AutoComplete
        name="companyProjectName.companyNameRegistered"
        :label="t('i.housing.project.projectForm.companyLabel')"
        :bold="true"
        :disabled="!getEditable"
        :editable="true"
        :placeholder="t('i.common.projectForm.searchBCRegistered')"
        :get-option-label="(option: OrgBookOption) => option.registeredName"
        :suggestions="orgBookOptions"
        @on-change="setCompanyIdRegistered(null)"
        @on-complete="onRegisteredNameInput"
        @on-select="
          (orgBookOption: OrgBookOption) => {
            setCompanyIdRegistered(orgBookOption.registeredId);
            setCompanyNameRegistered(orgBookOption.registeredName);
          }
        "
      />
      <InputText
        name="companyProjectName.companyIdRegistered"
        :label="t('i.common.projectForm.bcRegistryId')"
        :disabled="true"
      />
      <Select
        v-if="getInitiative === Initiative.GENERAL"
        name="companyProjectName.activityType"
        :label="t('i.common.projectForm.activityType')"
        :disabled="!getEditable"
        :options="['Other']"
      />
      <Select
        v-if="getInitiative === Initiative.GENERAL"
        name="companyProjectName.isRegisteredInBc"
        :label="t('i.housing.project.projectForm.companyRegisteredInBC')"
        :disabled="!getEditable"
        :options="YES_NO_LIST"
      />
      <InputText
        v-if="getInitiative === Initiative.GENERAL"
        name="companyProjectName.projectNumber"
        :label="t('i.common.projectForm.projectNumber')"
        :disabled="true"
      />
    </div>
  </Panel>
</template>
