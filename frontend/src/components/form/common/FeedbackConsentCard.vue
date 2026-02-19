<script setup lang="ts">
import { Checkbox } from '@/components/form';
import { Card } from '@/lib/primevue';

// Props
const { editable = true } = defineProps<{
  editable?: boolean;
}>();
</script>

<template>
  <Card>
    <template #content>
      <div class="mb-2 flex items-center">
        <Checkbox
          class="m-0 inline-block"
          name="basic.consentToFeedback"
          :bold="false"
          :disabled="!editable"
        />
        <span class="font-bold inline">
          Check this box if you agree to be contacted for user feedback, helping us improve our digital service. Your
          personal information will not be shared with third parties.
        </span>
      </div>
    </template>
  </Card>
</template>
