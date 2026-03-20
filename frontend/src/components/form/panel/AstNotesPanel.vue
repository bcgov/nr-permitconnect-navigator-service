<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AstNote } from '@/components/common/icons';
import { TextArea } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Panel } from '@/lib/primevue';
import { useFormStore } from '@/store';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const { getEditable } = storeToRefs(useFormStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'AstNotesPanel', tab);
</script>

<template>
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <AstNote />
        <h3 class="section-header m-0">
          {{ t('i.housing.project.projectForm.astNotesHeader') }}
        </h3>
      </div>
    </template>
    <TextArea
      name="astNotes"
      :disabled="!getEditable"
    />
  </Panel>
</template>
