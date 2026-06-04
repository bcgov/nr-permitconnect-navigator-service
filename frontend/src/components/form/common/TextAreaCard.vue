<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { TextArea } from '@/components/form';
import { Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';

// Props
const {
  header,
  fieldName,
  placeholder = undefined,
  required = false
} = defineProps<{
  header: string;
  fieldName: string;
  placeholder?: string;
  required?: boolean;
}>();

// Store
const { getEditable } = storeToRefs(useFormStore());
</script>

<template>
  <Card>
    <template #title>
      <h6
        class="section-header"
        aria-level="2"
      >
        {{ header }}
        <span
          v-if="required"
          class="text-[var(--p-support-required-text)]"
        >
          *
        </span>
      </h6>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <TextArea
          class="col-span-12"
          :name="fieldName"
          :placeholder="placeholder"
          :disabled="!getEditable"
          :aria-required="required"
        />
      </div>
    </template>
  </Card>
</template>
