<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { TextArea } from '@/components/form';
import { Card, Divider } from '@/lib/primevue';

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
      <div class="flex items-center">
        <div class="flex grow">
          <span
            class="section-header"
            role="heading"
            aria-level="2"
          >
            {{ t('projectIntakeForm.projectLocationDescriptionCard') }}
          </span>
        </div>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <TextArea
        class="col-span-12"
        name="location.projectLocationDescription"
        :disabled="!editable"
      />
    </template>
  </Card>
</template>
