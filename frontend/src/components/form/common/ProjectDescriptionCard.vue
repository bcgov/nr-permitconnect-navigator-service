<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import { TextArea } from '@/components/form';
import { Card, Divider } from '@/lib/primevue';
import { computed, ref, type ComponentPublicInstance, type Ref } from 'vue';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { useAppStore, useCodeStore, useFormStore } from '@/store';
import { storeToRefs } from 'pinia';
import { Initiative } from '@/utils/enums/application';
import { useFormValues } from 'vee-validate';

// Props
const {
  activityId = undefined,
  tab = 0,
  tooltip = false
} = defineProps<{
  activityId?: string;
  tab?: number;
  tooltip?: boolean;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const { enums } = useCodeStore();
const { getEditable } = storeToRefs(useFormStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);
const header = computed(() => {
  if (getInitiative.value === Initiative.ELECTRIFICATION) {
    if (values.value.project.projectType === enums.ElectrificationProjectType.OTHER)
      return t('projectDescriptionCard.headers.required');
    else return t('projectDescriptionCard.headers.optional');
  } else {
    return t('projectDescriptionCard.headers.required');
  }
});

// Actions
useFormErrorWatcher(formRef, 'ProjectDescriptionCard', tab);
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
      <div
        v-if="tooltip"
        class="col-span-12 my-0 py-0"
      >
        <div class="flex items-center">
          <label>{{ t('projectDescriptionCard.labels.projectDescription') }}</label>
          <Tooltip
            class="pl-2 mb-2"
            right
            icon="fa-solid fa-circle-question"
            :text="t('projectIntakeForm.additionalInfoTooltip')"
          />
        </div>
      </div>
      <TextArea
        class="col-span-12 mb-0 pb-0"
        name="basic.projectDescription"
        :placeholder="t('projectDescriptionCard.placeholders.projectDescription')"
        :disabled="!getEditable"
      />
      <i18n-t
        keypath="projectDescriptionCard.upload"
        tag="label"
        class="col-span-12 mt-0 pt-0"
        scope="global"
      >
        <template #shapeLink>
          <a
            href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
            target="_blank"
            class="text-blue-500 underline"
          >
            {{ t('projectDescriptionCard.links.shapeFiles') }}
          </a>
        </template>
      </i18n-t>
      <AdvancedFileUpload
        :activity-id="activityId"
        :disabled="!getEditable"
      />
    </template>
  </Card>
</template>
