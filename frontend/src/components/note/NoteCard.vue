<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Card, Divider } from '@/lib/primevue';
import { userService } from '@/services';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Note } from '@/types';

// Props
type Props = {
  note: Note;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const cardData: Ref<Note> = ref(props.note);
const userName: Ref<string> = ref('');

onMounted(async () => {
  if (props.note.createdBy) {
    const res = (await userService.searchUsers({ identityId: [props.note.createdBy] })).data;
    userName.value = res.length ? res.pop().fullName : '';
  }
});
</script>

<template>
  <Card>
    <template #title>
      <h3 class="mt-3 mb-1">{{ cardData.title }}</h3>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid nested-grid">
        <!-- Left column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Date:</span>
              {{ cardData.createdAt ? formatDate(cardData.createdAt ?? '') : undefined }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Author:</span>
              {{ userName }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Category:</span>
              {{ cardData.noteType }}
            </p>
          </div>
        </div>
        <div class="col-12 mb-2">
          {{ cardData.note }}
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss">
h2 {
  margin: 0;
}

p {
  margin-top: 0;
  margin-bottom: 0;
}

.key {
  color: #38598a;
}

.p-card {
  border-style: solid;
  border-width: 1px;

  .p-card-body {
    padding-top: 0;
    padding-bottom: 0;

    .p-card-content {
      padding-bottom: 0;
    }
  }
}
</style>
