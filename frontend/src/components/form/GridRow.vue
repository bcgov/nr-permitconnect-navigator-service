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
  <div class="col-12">
    <div class="grid">
      <div
        v-if="value && label"
        class="col-fixed"
      >
        {{ label }}:
      </div>
      <div
        v-if="value && link"
        class="col wrap-block w-9"
      >
        <router-link :to="link">
          {{ value }}
        </router-link>
      </div>
      <div
        v-if="value && !link"
        class="col wrap-block w-9"
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>
