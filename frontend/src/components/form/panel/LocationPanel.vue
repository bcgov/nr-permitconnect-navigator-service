<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFormValues, useSetFieldValue } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Location } from '@/components/common/icons';
import { EditableSelect, InputText, InputNumber, Select } from '@/components/form';
import { useFormErrorWatcher } from '@/composables/useFormErrorWatcher';
import { Panel } from '@/lib/primevue';
import { externalApiService } from '@/services';
import { useFormStore } from '@/store';
import { YES_NO_LIST } from '@/utils/constants/application';

import type { SelectChangeEvent } from 'primevue/select';
import type { ComponentPublicInstance, Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { GeocoderFeature } from '@/types';

// Props
const { tab = 0 } = defineProps<{
  tab?: number;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setStreetAddress = useSetFieldValue('location.streetAddress');
const setLocality = useSetFieldValue('location.locality');
const setProvince = useSetFieldValue('location.province');
const setLocationAddress = useSetFieldValue('location.locationAddress');

// Store
const formStore = useFormStore();
const { getEditable } = storeToRefs(formStore);

// State
const addressGeocoderFeatures: Ref<GeocoderFeature[]> = ref([]);
const formRef: Ref<ComponentPublicInstance | null> = ref(null);

// Actions
useFormErrorWatcher(formRef, 'LocationPanel', tab);

const getAddressSearchLabel = (e: GeocoderFeature) => {
  return e.properties.fullAddress ?? '';
};

async function onAddressSearchInput(e: IInputEvent) {
  const input = e.target.value;
  if (input.length == 0) {
    setStreetAddress(null);
    setLocality(null);
    setProvince(null);
  } else {
    addressGeocoderFeatures.value = (await externalApiService.searchAddressCoder(input))?.data?.features ?? [];
  }
}

async function onAddressSelect(e: SelectChangeEvent) {
  if (e.originalEvent instanceof InputEvent) return;
  if (e.value as GeocoderFeature) {
    const properties = e.value?.properties;
    setStreetAddress(`${properties?.civicNumber} ${properties?.streetName} ${properties?.streetType}`);
    setLocality(properties?.localityName);
    setProvince(properties?.provinceCode);
  }
}

function updateLocationAddress() {
  const locationAddressStr = [
    values.value.location?.streetAddress,
    values.value.location?.locality,
    values.value.location?.province
  ]
    .filter((str) => str?.trim())
    .join(', ');

  setLocationAddress(locationAddressStr);

  return locationAddressStr;
}
</script>

<template>
  <Panel
    ref="formRef"
    toggleable
  >
    <template #header>
      <div class="flex items-center gap-x-2.5">
        <Location />
        <h3 class="section-header m-0">
          {{ t('i.housing.project.projectForm.location') }}
        </h3>
      </div>
    </template>
    <EditableSelect
      class="mb-6"
      name="addressSearch"
      :get-option-label="getAddressSearchLabel"
      :options="addressGeocoderFeatures"
      :placeholder="t('i.housing.project.projectForm.addressSearchPlaceholder')"
      :bold="false"
      :disabled="!getEditable"
      @on-input="onAddressSearchInput"
      @on-change="onAddressSelect"
    />
    <div class="grid grid-row-3 gap-y-6">
      <div class="grid grid-cols-4 gap-x-6 gap-y-6">
        <InputText
          class="col-span-2"
          name="location.streetAddress"
          :label="t('i.housing.project.projectForm.streetAddress')"
          :disabled="true"
          @on-change="updateLocationAddress"
        />
        <InputText
          class="col-span-1"
          name="location.locality"
          :label="t('i.housing.project.projectForm.locality')"
          :disabled="true"
          @on-change="updateLocationAddress"
        />
        <InputText
          class="col-span-1"
          name="location.province"
          :label="t('i.housing.project.projectForm.province')"
          :disabled="true"
          @on-change="updateLocationAddress"
        />
      </div>
      <InputText
        class="col-span-3"
        name="location.locationPids"
        :label="t('i.housing.project.projectForm.locationPIDs')"
        :disabled="!getEditable"
      />
      <div class="grid grid-cols-3 gap-x-6">
        <InputNumber
          name="location.latitude"
          :label="t('i.housing.project.projectForm.locationLatitude')"
          :help-text="t('i.housing.project.projectForm.locationLatitudeHelp')"
          :disabled="!getEditable"
        />
        <InputNumber
          name="location.longitude"
          :label="t('i.housing.project.projectForm.locationLongitude')"
          :help-text="t('i.housing.project.projectForm.locationLongitudeHelp')"
          :disabled="!getEditable"
        />
        <Select
          name="location.naturalDisaster"
          :label="t('i.housing.project.projectForm.affectedByNaturalDisaster')"
          :disabled="!getEditable"
          :options="YES_NO_LIST"
        />
      </div>
      <InputText
        class="col-span-3"
        name="location.geomarkUrl"
        :label="t('i.housing.project.projectForm.geomarkUrl')"
        :disabled="!getEditable"
      />
    </div>
  </Panel>
</template>
