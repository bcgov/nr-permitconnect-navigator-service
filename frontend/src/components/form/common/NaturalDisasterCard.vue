<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Divider from '@/components/common/Divider.vue';
import { RadioList } from '@/components/form';
import { Card } from '@/lib/primevue';

import { YES_NO_LIST } from '@/utils/constants/application';

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
      <div class="flex">
        <span
          class="section-header"
          role="heading"
          aria-level="2"
        >
          {{ t('submissionIntakeForm.naturalDisasterCard') }}
        </span>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <RadioList
          class="col-span-12"
          name="location.naturalDisaster"
          :bold="false"
          :disabled="!editable"
          :options="YES_NO_LIST"
        />
      </div>
    </template>
  </Card>
</template>
