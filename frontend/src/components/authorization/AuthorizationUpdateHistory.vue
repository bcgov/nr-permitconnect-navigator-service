<script setup lang="ts">
import { formatDateTime } from '@/utils/formatters';

import type { PermitNote } from '@/types';

// Props
const { authorizationNotes } = defineProps<{
  authorizationNotes?: Array<PermitNote>;
}>();
</script>

<template>
  <div class="gap-x-6 gap-y-6 px-7 mt-4 py-10 border-color px-4 py-5 border border-[0.063rem] rounded-lg">
    <div class="mt-4">
      <div v-if="authorizationNotes && authorizationNotes.length > 0">
        <div
          v-for="(note, index) in authorizationNotes"
          :key="index"
          class="mb-6"
        >
          <div class="font-bold">{{ formatDateTime(note.createdAt) }}</div>
          <p class="mt-4">{{ note.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
