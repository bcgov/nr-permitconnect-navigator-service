<script setup lang="ts">
import { Card } from '@/lib/primevue';
</script>

<template>
  <Card>
    <template #content>
      <span class="flex font-bold">
        <p>
          Go to
          <a
            class="no-underline"
            href="https://permitconnectbc.gov.bc.ca/#authorizations"
            target="_blank"
          >
            Permit Connect BC
          </a>
          to learn more about permits issued by the provincial government
        </p>
      </span>
    </template>
  </Card>
</template>
