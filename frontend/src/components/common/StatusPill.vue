<script setup lang="ts">
import { toKebabCase } from '@/utils/utils';

// Props
const { authStatus } = defineProps<{
  authStatus?: string;
}>();
</script>

<template>
  <div class="mr-3 flex justify-content-center">
    <div
      class="align-items-center auth-indicator"
      :class="[toKebabCase(authStatus)]"
    >
      {{ authStatus }}
    </div>
  </div>
</template>
<style scoped lang="scss">
.auth-indicator {
  height: 30px;
  width: 100px;
  text-align: center;
  line-height: 30px;
  font-size: 0.9rem;
}

.in-review {
  background-color: none;
  color: var(-p-green-500);
  border-radius: 1rem;
  border-color: var(-p-green-500);
  border-style: solid;
  border-width: 1px;
}

.issued {
  background-color: var(-p-green-500);
  color: white;
  border-radius: 1rem;
  border-color: var(-p-green-500);
  border-style: solid;
  border-width: 1px;
}

.denied {
  background-color: var(--p-red-500);
  color: white;
  border-radius: 1rem;
  border-color: var(--p-red-500);
  border-style: solid;
  border-width: 1px;
}

.pending {
  background-color: none;
  color: var(--p-red-500);
  border-radius: 1rem;
  border-color: var(--p-red-500);
  border-style: solid;
  border-width: 1px;
}
</style>
