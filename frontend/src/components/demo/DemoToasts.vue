<script setup lang="ts">
import { Button, useToast } from '@/lib/primevue';

// Actions
const toast = useToast();
</script>

<template>
  <h3 class="pt-5 font-bold">Toasts</h3>
  <Button
    class="mr-1"
    @click="toast.success('This is a success.')"
  >
    Success
  </Button>

  <Button
    class="mr-1"
    severity="danger"
    @click="toast.error('This is an error.')"
  >
    Error
  </Button>

  <Button
    class="mr-1"
    severity="info"
    @click="toast.info('This is some information.')"
  >
    Information
  </Button>

  <Button
    class="mr-1"
    severity="warning"
    @click="toast.warn('This is a warning.')"
  >
    Warning
  </Button>
</template>
