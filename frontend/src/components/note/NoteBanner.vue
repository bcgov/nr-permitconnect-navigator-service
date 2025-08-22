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
    class="bg-[var(--p-gold-100)] border rounded-sm border-[var(--p-gold-900)] px-4 py-2"
  >
    <div class="grid grid-cols-7 gap-4 items-center">
      <div class="col-span-2">
        <span class="font-bold mr-4">{{ t('note.noteBanner.attnReqd') }}:</span>
        <span class="font-bold">{{ t('note.noteBanner.updatedOn') }} {{ formatDate(note.createdAt) }}</span>
      </div>
      <div class="col-span-4 truncate">{{ note.note }}</div>
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
