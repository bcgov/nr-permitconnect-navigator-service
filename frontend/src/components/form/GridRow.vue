<script setup lang="ts">
const {
  label = undefined,
  value = undefined,
  link = undefined
} = defineProps<{
  label?: string;
  value?: string;
  link?: object;
}>();
</script>

<template>
  <div class="col-span-12">
    <div class="grid grid-cols-12 gap-4">
      <div
        v-if="value && label"
        class="col-fixed"
      >
        {{ label }}:
      </div>
      <div
        v-if="value && link"
        class="col wrap-block w-9/12"
      >
        <router-link :to="link">
          {{ value }}
        </router-link>
      </div>
      <div
        v-if="value && !link"
        class="col wrap-block w-9/12"
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>
