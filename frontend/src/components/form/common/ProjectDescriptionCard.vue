<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Tooltip from '@/components/common/Tooltip.vue';
import AdvancedFileUpload from '@/components/file/AdvancedFileUpload.vue';
import { TextArea } from '@/components/form';
import { Card, Divider } from '@/lib/primevue';
import { ref, type ComponentPublicInstance, type Ref } from 'vue';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { useFormStore } from '@/store';
import { storeToRefs } from 'pinia';

// Props
const { activityId = undefined, tab = 0 } = defineProps<{
  activityId?: string;
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

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
        {{ t('projectIntakeForm.projectDescriptionCard') }}
      </span>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="col-span-12 my-0 py-0">
        <div class="flex items-center">
          <label>Provide additional information</label>
          <Tooltip
            class="pl-2 mb-2"
            right
            icon="fa-solid fa-circle-question"
            :text="t('projectIntakeForm.additionalInfoTooltip')"
          />
        </div>
      </div>

      <!-- eslint-disable max-len -->
      <TextArea
        class="col-span-12 mb-0 pb-0"
        name="general.projectDescription"
        placeholder="Provide us with additional information - short description about the project and/or project website link"
        :disabled="!getEditable"
      />
      <!-- eslint-enable max-len -->
      <label class="col-span-12 mt-0 pt-0">
        Upload documents about your project (pdfs, maps,
        <a
          href="https://portal.nrs.gov.bc.ca/documents/10184/0/SpatialFileFormats.pdf/39b29b91-d2a7-b8d1-af1b-7216f8db38b4"
          target="_blank"
          class="text-blue-500 underline"
        >
          shape files
        </a>
        , etc)
      </label>
      <AdvancedFileUpload
        :activity-id="activityId"
        :disabled="!getEditable"
      />
    </template>
  </Card>
</template>
