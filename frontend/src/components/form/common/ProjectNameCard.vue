<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Card, Divider } from '@/lib/primevue';
import { InputText } from '@/components/form';

// Props
const { editable = true } = defineProps<{
  editable?: boolean;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <Card>
    <template #title>
      <span
        class="section-header"
        role="heading"
        aria-level="2"
      >
        {{ t('projectIntakeForm.projectNameCard') }}
      </span>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <!-- TODO change general.projectName to something shared OR allow name field as a prop -->
        <InputText
          class="col-span-6"
          name="general.projectName"
          label="Project name - your preferred name for your project"
          :bold="false"
          :disabled="!editable"
        />
        <div class="col-span-6" />
      </div>
    </template>
  </Card>
</template>
