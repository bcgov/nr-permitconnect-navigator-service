<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Button } from '@/lib/primevue';
import { formatDate } from '@/utils/formatters';

import type { Note } from '@/types';

// Props
const { note } = defineProps<{
  note: Note;
}>();

// Emits
const emit = defineEmits(['noteBanner:show-history']);

// Composables
const { t } = useI18n();
</script>

<template>
  <div
    v-if="note"
    class="bg-[var(--p-gold-100)] border rounded-sm border-[var(--p-gold-900)] p-4"
  >
    <div class="grid grid-cols-7 gap-4 items-center">
      <div class="font-bold">{{ t('note.noteBanner.attnReqd') }}:</div>
      <div class="font-bold col-span-2">Updated on {{ formatDate(note.createdAt) }}</div>
      <div class="col-span-3 font-bold truncate">{{ note.note }}</div>
      <div class="flex justify-end">
        <Button
          size="small"
          :label="t('note.noteBanner.viewAll')"
          outlined
          @click="emit('noteBanner:show-history')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.p-button-outlined {
  background-color: white;
}
</style>
