<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ErrorMessage, useFormValues, useSetFieldValue } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RegisteredBusinessOrgbookSearch from './RegisteredBusinessOrgbookSearch.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { InputText, RadioList } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Card, Divider } from '@/lib/primevue';
import { useContactStore, useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';
import { PROJECT_APPLICANT_LIST } from '@/utils/constants/projectCommon';
import { BasicResponse } from '@/utils/enums/application';
import { ProjectApplicant } from '@/utils/enums/projectCommon';

import type { ComponentPublicInstance, Ref } from 'vue';
import type { OrgBookOption } from '@/types';

// Props
const { tab = 0, compact = false } = defineProps<{
  tab?: number;
  compact?: boolean;
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
const header = computed(() =>
  compact ? t('registeredBusinessCard.declareBusinessName') : t('registeredBusinessCard.projectApplicantTypeCard')
);

// Actions
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
        {{ header }}
      </span>
      <Divider type="solid" />
    </template>
    <template #content>
      <div v-if="compact">
        <RegisteredBusinessOrgbookSearch v-model:org-book-options="orgBookOptions" />
      </div>
      <div
        v-else
        class="grid grid-cols-12 gap-4"
      >
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
            class="col-span-12 mt-2 mb-4 pl-0"
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
            <RegisteredBusinessOrgbookSearch v-model:org-book-options="orgBookOptions" />
          </div>
          <InputText
            v-else-if="values.basic.isDevelopedInBc === BasicResponse.NO"
            class="col-span-6 pl-0"
            name="basic.registeredName"
            :placeholder="t('registeredBusinessCard.placeholders.notInBcRegisteredName')"
            :bold="false"
            :disabled="!getEditable"
            @on-change="setRegisteredId(null)"
          />
        </span>
      </div>
      <!-- Hidden field for registeredId -->
      <InputText
        v-show="false"
        name="basic.registeredId"
      />
      <!-- Visible error message for registeredId -->
      <ErrorMessage
        name="basic.registeredId"
        class="app-error-message"
      />
    </template>
  </Card>
</template>
