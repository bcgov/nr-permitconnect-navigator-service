<script setup lang="ts">
import { Breadcrumb } from '@/lib/primevue';

import type { MenuItem } from 'primevue/menuitem';

// Props
const { home, model } = defineProps<{
  home: MenuItem;
  model: Array<MenuItem>;
}>();
</script>

<template>
  <Breadcrumb
    :home="home"
    :model="model"
  >
    <template #separator>/</template>
    <template #item="{ item }">
      <router-link
        v-if="item.route"
        :to="{
          name: item.route,
          params: item.params
        }"
      >
        <span
          class="app-primary-color cursor-pointer hover-underline"
          :class="[item.class]"
        >
          {{ item.label }}
        </span>
      </router-link>
      <span
        v-else
        :class="[item.class]"
      >
        {{ item.label }}
      </span>
    </template>
  </Breadcrumb>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}

.hover-underline:hover {
  text-decoration: underline;
}

.p-breadcrumb {
  border: none;
  padding: 0.125rem;
}
</style>
