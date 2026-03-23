<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { AutoPids } from '@/components/common/icons';
import { TextArea } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Button, Panel } from '@/lib/primevue';
import { useProjectStore } from '@/store';
import { formatDateFilename } from '@/utils/formatters';

import type { GeoJSON } from 'geojson';
import type { ComponentPublicInstance, Ref } from 'vue';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();

// Store
const { getProject } = storeToRefs(useProjectStore());

// State
const formRef: Ref<ComponentPublicInstance | null> = ref(null);
const geoJson: Ref<GeoJSON | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'LocationPidsPanel', tab);

const onSaveGeoJson = () => {
  if (!geoJson.value) return;

  const file = new Blob([JSON.stringify(geoJson.value, null, 2)], {
    type: 'application/geo+json'
  });

  const downloadLink = URL.createObjectURL(file);
  const downloadElement = document.createElement('a');
  downloadElement.href = downloadLink;

  const currentDateTime = formatDateFilename(new Date().toISOString());
  const projectName = getProject.value?.projectName ?? '';
  const projectActivityId = getProject.value?.activityId ?? '';

  downloadElement.download = `${currentDateTime}_${projectName}_${projectActivityId}.geojson`;
  downloadElement.click();
  URL.revokeObjectURL(downloadLink);
};

onBeforeMount(async () => {
  if (getProject.value && 'geoJson' in getProject.value) geoJson.value = getProject.value?.geoJson ?? null;
});
</script>

<template>
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <AutoPids />
        <h3 class="section-header m-0">
          {{ t('i.housing.project.projectForm.autoGenPids') }}
        </h3>
      </div>
    </template>
    <div>
      <TextArea
        name="locationPids.auto"
        :disabled="true"
      />
      <Button
        v-if="geoJson"
        id="download-geojson"
        class="col-start-1 col-span-2 mb-2"
        outlined
        :aria-label="t('i.housing.project.projectForm.downloadGeoJson')"
        @click="onSaveGeoJson"
      >
        {{ t('i.housing.project.projectForm.downloadGeoJson') }}
      </Button>
    </div>
  </Panel>
</template>
