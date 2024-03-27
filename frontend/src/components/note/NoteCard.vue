<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Card, Divider } from '@/lib/primevue';
import { userService } from '@/services';
import { formatDateShort } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Note } from '@/types';

// Props
type Props = {
  note: Note;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const userName: Ref<string> = ref('');

onMounted(() => {
  if (props.note.createdBy) {
    userService.searchUsers({ userId: [props.note.createdBy] }).then((res) => {
      userName.value = res?.data.length ? res?.data[0].fullName : '';
    });
  }
});
</script>

<template>
  <Card>
    <template #title>
      <h3 class="mt-1 mb-1">
        {{ props.note.title }}
        <span v-if="props.note.bringForwardState">{{ '(Unresolved)' }}</span>
      </h3>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid nested-grid">
        <!-- Left column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Date:</span>
              {{ props.note.createdAt ? formatDateShort(props.note.createdAt) : undefined }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Author:</span>
              {{ userName }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Note type:</span>
              {{ props.note.noteType }}
            </p>
          </div>
        </div>
        <div
          v-if="props.note.bringForwardDate"
          class="col-12 md:col-6 lg:col-3"
        >
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Bring forward date:</span>
              {{ props.note.bringForwardDate }}
            </p>
          </div>
        </div>
        <p class="col-12 mt-0 mb-0 note-content">{{ props.note.note }}</p>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss">
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
.note-content {
  white-space: pre;
  text-wrap: balance;
}
</style>
