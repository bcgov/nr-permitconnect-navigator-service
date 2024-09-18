<script setup lang="ts">
import { useIsFormDirty } from 'vee-validate';

import { Button } from '@/lib/primevue';

// Props
const { editable = true } = defineProps<{
  editable?: boolean;
}>();

// Emits
const emit = defineEmits(['clicked']);

// State
const isDirty = useIsFormDirty();
</script>

<template>
  <Button
    label="Cancel"
    outlined
    class="ml-2 p-button-danger"
    icon="pi pi-times"
    :disabled="!editable || !isDirty"
    @click="emit('clicked')"
  />
</template>
