<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from '@/lib/primevue';

import type { Permit } from '@/types';

// Props
const { authsNeeded, authsNotNeeded } = defineProps<{
  authsNeeded: Permit[];
  authsNotNeeded: Permit[];
}>();

// Composables
const { t } = useI18n();

// Actions
const authsNotNeededCSV = computed(() => `${authsNotNeeded.map((a) => a.permitType?.name).join(', ')}`);
</script>

<template>
  <Accordion
    v-if="authsNeeded?.length"
    class="app-primary-color"
    :value="undefined"
    collapse-icon="pi pi-chevron-up"
    expand-icon="pi pi-chevron-right"
  >
    <AccordionPanel value="0">
      <AccordionHeader>
        <h5>{{ t('authorization.requiredAuths.moreInfo') }}</h5>
      </AccordionHeader>
      <AccordionContent class="pb-1">
        <p class="mt-4">{{ t('authorization.requiredAuths.requiredAuthsDesc') }}</p>
        <div
          v-for="permit in authsNeeded"
          :key="permit.permitId"
          class="mb-6 mt-3"
        >
          <a
            v-if="permit.permitType?.infoUrl"
            class="m-0 p-0"
            :href="permit.permitType?.infoUrl"
            target="_blank"
          >
            <span class="underline">{{ permit.permitType?.name }}</span>
          </a>
          <span
            v-else
            class="m-0 p-0"
          >
            {{ permit.permitType?.name }}
          </span>
          <span
            v-if="permit.permitNote?.[0]"
            class="ml-2"
          >
            ({{ permit.permitNote[0].note }})
          </span>
        </div>
        <div v-if="authsNotNeeded.length">
          <span>{{ t('authorization.requiredAuths.notNeededDesc') }}</span>
          {{ authsNotNeededCSV }}
          <span v-if="authsNotNeeded.length > 1">{{ t('authorization.requiredAuths.areNotNeeded') }}</span>
          <span v-else>{{ t('authorization.requiredAuths.isNotNeeded') }}</span>
        </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>
