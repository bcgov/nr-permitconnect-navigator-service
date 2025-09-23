<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Button, Message } from '@/lib/primevue';
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
  <Message
    v-if="note"
    severity="warn"
  >
    <div class="flex flex-row gap-4 items-center">
      <div class="flex">
        <span class="font-bold mr-4">{{ t('note.noteBanner.attnReqd') }}:</span>
      </div>
      <div class="flex">
        <span class="font-bold">
          {{ t('note.noteBanner.updatedOn') }}
          {{ formatDate(note.createdAt) }}
        </span>
      </div>
      <div class="flex truncate text-ellipsis">{{ note.note }}</div>
      <div class="flex grow justify-end">
        <Button
          size="small"
          :label="t('note.noteBanner.viewAll')"
          outlined
          @click="emit('noteBanner:show-history')"
        />
      </div>
    </div>
  </Message>
</template>

<style scoped lang="scss">
:deep(.p-message-text) {
  width: 100%;
}

.p-button-outlined {
  background-color: white;
}
</style>
