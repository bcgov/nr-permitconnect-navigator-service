<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { InputText } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel, Card, Divider } from '@/lib/primevue';
import { useFormStore } from '@/store';

import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);
const geomarkAccordionIndex: Ref<number | undefined> = ref(undefined);
const parcelAccordionIndex: Ref<number | undefined> = ref(undefined);

// Actions
useFormErrorWatcher(formRef, 'LocationAdditionalCard', tab);
</script>

<template>
  <Card ref="formRef">
    <template #title>
      <div class="flex align-items-center">
        <div class="flex flex-grow-1">
          <span
            class="section-header"
            role="heading"
            aria-level="2"
          >
            {{ t('projectIntakeForm.additionalLocationCard') }}
          </span>
        </div>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <Accordion
        collapse-icon="pi pi-chevron-up"
        expand-icon="pi pi-chevron-right"
        :value="parcelAccordionIndex"
      >
        <AccordionPanel value="0">
          <AccordionHeader>Parcel ID (PID Number)</AccordionHeader>
          <AccordionContent>
            <Card class="no-shadow">
              <template #content>
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12">
                    <label>
                      <a
                        href="https://ltsa.ca/property-owners/about-land-records/property-information-resources/"
                        target="_blank"
                      >
                        LTSA PID Lookup
                      </a>
                    </label>
                  </div>
                  <!-- eslint-disable max-len -->
                  <InputText
                    class="col-span-12"
                    name="location.ltsaPidLookup"
                    :bold="false"
                    :disabled="!getEditable"
                    help-text="List the parcel IDs - if multiple PIDS, separate them with commas, e.g., 006-209-521, 007-209-522"
                  />
                  <!-- eslint-enable max-len -->
                </div>
              </template>
            </Card>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
      <Accordion
        collapse-icon="pi pi-chevron-up"
        expand-icon="pi pi-chevron-right"
        :value="geomarkAccordionIndex"
        class="mt-6 mb-2"
      >
        <AccordionPanel value="0">
          <AccordionHeader>Geomark</AccordionHeader>
          <AccordionContent>
            <Card class="no-shadow">
              <template #content>
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12">
                    <label>
                      <a
                        href="https://apps.gov.bc.ca/pub/geomark/overview"
                        target="_blank"
                      >
                        Open Geomark Web Service
                      </a>
                    </label>
                  </div>
                  <InputText
                    class="col-span-12"
                    name="location.geomarkUrl"
                    :bold="false"
                    :disabled="!getEditable"
                    placeholder="Type in URL"
                  />
                </div>
              </template>
            </Card>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </template>
  </Card>
</template>
