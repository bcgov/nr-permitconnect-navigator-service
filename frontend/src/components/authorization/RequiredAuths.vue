<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from '@/lib/primevue';

import type { Permit } from '@/types';

// Props
const { authsNeeded, authsNotNeeded, authsUnderInvestigation } = defineProps<{
  authsNeeded: Permit[];
  authsNotNeeded: Permit[];
  authsUnderInvestigation: Permit[];
}>();

// Composables
const { t } = useI18n();

// Actions
const authsNotNeededCSV = computed(() => `${authsNotNeeded.map((a) => a.permitType?.name).join(', ')}`);
</script>

<template>
  <Accordion
    v-if="authsNeeded?.length || authsUnderInvestigation?.length"
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
        <ul
          v-for="permit in authsNeeded"
          :key="permit.permitId"
          class="mb-6 mt-3 list-disc ml-6"
        >
          <li>
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
          </li>
        </ul>
        <div
          v-if="authsNotNeeded.length"
          class="mb-6"
        >
          <span>{{ t('authorization.requiredAuths.notNeededDesc') }}</span>
          <ul class="mb-6 mt-3 list-disc ml-6">
            <li class="mt-3">
              {{ authsNotNeededCSV }}
              <span v-if="authsNotNeeded.length > 1">{{ t('authorization.requiredAuths.areNotNeeded') }}</span>
              <span v-else>{{ t('authorization.requiredAuths.isNotNeeded') }}</span>
            </li>
          </ul>
        </div>
        <div v-if="authsUnderInvestigation.length">
          <span>{{ t('authorization.requiredAuths.underInvestigation') }}</span>
          <ul
            v-for="permit in authsUnderInvestigation"
            :key="permit.permitId"
            class="mb-6 mt-3 list-disc ml-6"
          >
            <li>
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
            </li>
          </ul>
        </div>
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>
