<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { userService } from '@/services';

// Props
const { userId } = defineProps<{
  userId: string | undefined | null;
}>();

// State
const username = ref('');

// Actions
onBeforeMount(() => {
  if (userId) {
    userService
      .searchUsers({ userId: [userId] })
      .then((res) => {
        username.value = res?.data.length ? res?.data[0].fullName : '';
      })
      .catch(() => {});
  }
});
</script>

<template>
  <span>{{ username }}</span>
</template>
