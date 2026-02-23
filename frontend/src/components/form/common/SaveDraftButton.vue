<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import { Button } from '@/lib/primevue';
import { useFormStore } from '@/store';

import type { GenericObject } from 'vee-validate';

// Props
const { onClickCallback } = defineProps<{
  onClickCallback: (data: GenericObject) => void;
}>();

// Composables
const values = useFormValues();
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);
</script>

<template>
  <Button
    class="p-button-sm"
    outlined
    :label="t('saveDraftButton.label')"
    :disabled="!getEditable"
    @click="onClickCallback(values)"
  />
</template>
