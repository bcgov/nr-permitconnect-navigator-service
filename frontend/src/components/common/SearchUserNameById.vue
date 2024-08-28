<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { userService } from '@/services';

// Props
type Props = {
  userId: string | undefined | null;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const username = ref('');

onBeforeMount(() => {
  if (props.userId) {
    userService
      .searchUsers({ userId: [props.userId] })
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
