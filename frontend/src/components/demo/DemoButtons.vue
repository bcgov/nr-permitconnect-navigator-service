<script setup lang="ts">
import { Button } from '@/lib/primevue';
</script>

<template>
  <h3 class="pt-5 font-bold">Buttons</h3>
  <h4 class="pt-2">No icons</h4>
  <Button class="mr-1">Primary button</Button>
  <Button class="p-button-outlined mr-1">Secondary button</Button>
  <Button
    severity="danger"
    class="p-button-outlined mr-1"
  >
    Danger button
  </Button>

  <h4 class="pt-2">With icons</h4>
  <Button class="mr-1">
    <font-awesome-icon
      icon="fa-solid fa-download"
      class="pr-1"
    />
    Primary button
  </Button>
  <Button class="p-button-outlined mr-1">
    <font-awesome-icon
      icon="fa-solid fa-download"
      class="pr-1"
    />
    Secondary button
  </Button>
  <Button
    severity="danger"
    class="p-button-outlined mr-1"
  >
    <font-awesome-icon
      icon="fa-solid fa-trash"
      class="pr-1"
    />
    Danger button
  </Button>
</template>
