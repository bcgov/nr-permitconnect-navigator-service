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
  color: $app-green;
  border-radius: 1rem;
  border-color: $app-green;
  border-style: solid;
  border-width: 1px;
}

.issued {
  background-color: $app-green;
  color: white;
  border-radius: 1rem;
  border-color: $app-green;
  border-style: solid;
  border-width: 1px;
}

.denied {
  background-color: $app-error;
  color: white;
  border-radius: 1rem;
  border-color: $app-error;
  border-style: solid;
  border-width: 1px;
}

.pending {
  background-color: none;
  color: $app-error;
  border-radius: 1rem;
  border-color: $app-error;
  border-style: solid;
  border-width: 1px;
}
</style>
