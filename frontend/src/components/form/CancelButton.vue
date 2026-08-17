<script setup lang="ts">
import { useIsFormDirty } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import { Button } from '@/lib/primevue';

// Props
const { canDisable = true, editable = true } = defineProps<{
  canDisable?: boolean;
  editable?: boolean;
}>();

// Emits
const emit = defineEmits(['clicked']);

// State
const isDirty = useIsFormDirty();

// Actions
const { t } = useI18n();
</script>

<template>
  <Button
    outlined
    class="ml-2 p-button-danger"
    icon="pi pi-times"
    :disabled="canDisable && (!editable || !isDirty)"
    :label="t('ui.actions.cancel')"
    @click="emit('clicked')"
  />
</template>
