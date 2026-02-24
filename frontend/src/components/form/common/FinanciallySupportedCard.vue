<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues, useSetFieldValue } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import { InputText, RadioList } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Button, Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';
import { YES_NO_UNSURE_LIST } from '@/utils/constants/application';
import { BasicResponse } from '@/utils/enums/application';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setFinanciallySupportedBc = useSetFieldValue('housing.financiallySupportedBc');
const setFinanciallySupportedIndigenous = useSetFieldValue('housing.financiallySupportedIndigenous');
const setFinanciallySupportedNonProfit = useSetFieldValue('housing.financiallySupportedNonProfit');
const setFinanciallySupportedHousingCoop = useSetFieldValue('housing.financiallySupportedHousingCoop');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'FinanciallySupportedCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex items-center justify-between">
        <div class="flex flex-grow-1">
          <span
            class="section-header"
            role="heading"
            aria-level="2"
          >
            {{ t('projectIntakeForm.financiallySupportedCard') }}
          </span>
        </div>
        <Button
          class="p-button-sm mr-4 p-button-danger"
          outlined
          :disabled="!getEditable"
          @click="
            () => {
              setFinanciallySupportedBc(BasicResponse.NO);
              setFinanciallySupportedIndigenous(BasicResponse.NO);
              setFinanciallySupportedNonProfit(BasicResponse.NO);
              setFinanciallySupportedHousingCoop(BasicResponse.NO);
            }
          "
        >
          No to all
        </Button>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div>
        <div class="mb-6">
          <div class="flex items-center">
            <label>
              <a
                href="https://www.bchousing.org/projects-partners/partner-with-us"
                target="_blank"
              >
                BC Housing
              </a>
            </label>
            <Tooltip
              class="pl-2 mb-2"
              right
              icon="fa-solid fa-circle-question"
              :text="t('projectIntakeForm.bcHousingTooltip')"
            />
          </div>

          <RadioList
            name="housing.financiallySupportedBc"
            :bold="false"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
          />
        </div>

        <div class="mb-6">
          <label>
            <a
              href="https://www.bchousing.org/housing-assistance/rental-housing/indigenous-housing-providers"
              target="_blank"
            >
              Indigenous Housing Provider
            </a>
          </label>
          <RadioList
            name="housing.financiallySupportedIndigenous"
            :bold="false"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
          />
          <InputText
            v-if="values.housing?.financiallySupportedIndigenous === BasicResponse.YES"
            class="w-1/2 pl-0"
            name="housing.indigenousDescription"
            :disabled="!getEditable"
            placeholder="Name of Indigenous Housing Provider"
          />
        </div>

        <div class="mb-6">
          <label>
            <a
              href="https://bcnpha.ca/member-programs-list/"
              target="_blank"
            >
              Non-profit housing society
            </a>
          </label>
          <RadioList
            name="housing.financiallySupportedNonProfit"
            :bold="false"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
          />
          <InputText
            v-if="values.housing?.financiallySupportedNonProfit === BasicResponse.YES"
            class="w-1/2 pl-0"
            name="housing.nonProfitDescription"
            :disabled="!getEditable"
            placeholder="Name of Non-profit housing society"
          />
        </div>

        <div>
          <label>
            <a
              href="https://www.chf.bc.ca/find-co-op/"
              target="_blank"
            >
              Housing co-operative
            </a>
          </label>
          <RadioList
            name="housing.financiallySupportedHousingCoop"
            :bold="false"
            :disabled="!getEditable"
            :options="YES_NO_UNSURE_LIST"
          />
          <InputText
            v-if="values.housing?.financiallySupportedHousingCoop === BasicResponse.YES"
            class="w-1/2 pl-0"
            name="housing.housingCoopDescription"
            :disabled="!getEditable"
            placeholder="Name of Housing co-operative"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
