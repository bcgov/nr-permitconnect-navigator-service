<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { formatDateTime } from '@/utils/formatters';

import type { PermitNote } from '@/types';

// Props
const { authorizationNotes } = defineProps<{
  authorizationNotes?: Array<PermitNote>;
}>();

// Composables
const { t } = useI18n();
</script>

<template>
  <div class="gap-x-6 gap-y-6 update-history px-7 mt-4 py-10">
    <h5>{{ t('authorization.authorizationForm.updateNoteHistory') }}</h5>
    <div class="mt-8">
      <div
        v-if="authorizationNotes && authorizationNotes.length > 0"
        class="mt-8"
      >
        <div
          v-for="(note, index) in authorizationNotes"
          :key="index"
          class="mb-6"
        >
          <span class="font-bold">{{ formatDateTime(note.createdAt) }},</span>
          <span class="ml-2">{{ note.note }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.update-history {
  background-color: var(--p-greyscale-50);
  border-radius: 0.5rem;
}
</style>
