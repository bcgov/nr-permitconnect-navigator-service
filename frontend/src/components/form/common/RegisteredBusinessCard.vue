<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues, useSetFieldValue } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { AutoComplete, InputText, RadioList } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { externalApiService } from '@/services';
import { useContactStore, useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/projectCommon';

import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete';
import type { ComponentPublicInstance, Ref } from 'vue';
import type { OrgBookOption } from '@/types';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

const orgBookOptions = defineModel<OrgBookOption[]>('orgBookOptions');

// Composables
const { t } = useI18n();
const values = useFormValues();
const setIsDevelopedInBc = useSetFieldValue('basic.isDevelopedInBc');
const setRegisteredName = useSetFieldValue('basic.registeredName');
const setRegisteredId = useSetFieldValue('basic.registeredId');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);
const { getContact } = storeToRefs(useContactStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

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

useFormErrorWatcher(formRef, 'RegisteredBusinessCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <span
        class="section-header"
        role="heading"
        aria-level="2"
      >
        {{ t('registeredBusinessCard.projectApplicantTypeCard') }}
      </span>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <RadioList
          class="col-span-12"
          name="basic.projectApplicantType"
          :bold="false"
          :disabled="!getEditable"
          :options="PROJECT_APPLICANT_LIST"
          @on-change="
            (e: string) => {
              if (e === ProjectApplicant.BUSINESS) setIsDevelopedInBc(null);
            }
          "
        />

        <span
          v-if="values.basic?.projectApplicantType === ProjectApplicant.BUSINESS"
          class="col-span-12"
        >
          <div class="flex items-center">
            <p class="font-bold">{{ t('registeredBusinessCard.registeredInBc') }}</p>
            <Tooltip
              class="pl-2"
              right
              icon="fa-solid fa-circle-question"
              :text="t('registeredBusinessCard.isRegisteredTooltip')"
            />
          </div>
          <RadioList
            class="col-span-12 mt-2 pl-0"
            name="basic.isDevelopedInBc"
            :bold="false"
            :disabled="!getEditable"
            :options="YES_NO_LIST"
            @on-change="
              () => {
                setRegisteredId(null);
                setRegisteredName(getContact?.bceidBusinessName);
              }
            "
          />
          <div v-if="values.basic.isDevelopedInBc === BasicResponse.YES">
            <AutoComplete
              class="col-span-6 mt-4 pl-0"
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
            <input
              hidden
              name="basic.registeredId"
            />
          </div>
          <InputText
            v-else-if="values.basic.isDevelopedInBc === BasicResponse.NO"
            class="col-span-6 mt-4 pl-0"
            name="basic.registeredName"
            :placeholder="t('registeredBusinessCard.placeholders.notInBcRegisteredName')"
            :bold="false"
            :disabled="!getEditable"
            @on-change="setRegisteredId(null)"
          />
        </span>
      </div>
    </template>
  </Card>
</template>
