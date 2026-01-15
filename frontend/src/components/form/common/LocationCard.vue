<script setup lang="ts">
import type { SelectChangeEvent } from 'primevue/select';
import { useFormValues, useSetFieldValue, useValidateField } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Divider from '@/components/common/Divider.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { EditableSelect, InputNumber, InputText, RadioList } from '@/components/form';
import Map from '@/components/housing/maps/Map.vue';
import { Button, Card } from '@/lib/primevue';
import { externalApiService } from '@/services';
import { PROJECT_LOCATION_LIST } from '@/utils/constants/housing';
import { ProjectLocation } from '@/utils/enums/housing';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { GeocoderEntry } from '@/types';

// Types
interface PinUpdateEvent {
  longitude: number;
  latitude: number;
  address: string;
}

// Props
const { editable = true } = defineProps<{
  editable?: boolean;
}>();

// Composables
const { t } = useI18n();
const values = useFormValues();
const setLatitude = useSetFieldValue('location.latitude');
const setLongitude = useSetFieldValue('location.longitude');
const setStreetAddress = useSetFieldValue('location.streetAddress');
const setLocality = useSetFieldValue('location.locality');
const setProvince = useSetFieldValue('location.province');
const setGeoJson = useSetFieldValue('location.geoJson');
const validateLatitude = useValidateField('location.latitude');
const validateLongitude = useValidateField('location.longitude');

// State
const addressGeocoderOptions: Ref<any[]> = ref([]);
const mapLatitude: Ref<number | undefined> = ref(undefined);
const mapLongitude: Ref<number | undefined> = ref(undefined);
const mapRef: Ref<InstanceType<typeof Map> | null> = ref(null);

// Actions
function clearAddress() {
  setLatitude(null);
  setLongitude(null);
  setStreetAddress(null);
  setLocality(null);
  setProvince(null);
}

function clearGeoJson() {
  setGeoJson(null);
}

const getAddressSearchLabel = (e: GeocoderEntry) => {
  return e?.properties?.fullAddress;
};

function handleProjectLocationClick() {
  const location = values.value?.location;
  if (location?.latitude || location?.longitude) {
    setLatitude(null);
    setLongitude(null);
    setStreetAddress(null);
    setLocality(null);
    setProvince(null);
  }
}

async function onAddressSearchInput(e: IInputEvent) {
  const input = e.target.value;
  addressGeocoderOptions.value =
    ((await externalApiService.searchAddressCoder(input))?.data?.features as GeocoderEntry[]) ?? [];
}

async function onAddressSelect(e: SelectChangeEvent) {
  if (e.originalEvent instanceof InputEvent) return;

  if (e.value as GeocoderEntry) {
    const properties = e.value?.properties;
    const geometry = e.value?.geometry;

    mapRef?.value?.pinToMap(geometry.coordinates[1], geometry.coordinates[0]);

    setStreetAddress(`${properties?.civicNumber} ${properties?.streetName} ${properties?.streetType}`);
    setLocality(properties?.localityName);
    setLatitude(geometry?.coordinates[1]);
    setLongitude(geometry?.coordinates[0]);
    setProvince(properties?.provinceCode);
    clearGeoJson();
  }
}

async function onLatLongInput() {
  const validLat = (await validateLatitude())?.valid;
  const validLong = (await validateLongitude())?.valid;

  if (validLat && validLong) {
    const location = values.value?.location;
    if (mapRef.value?.pinToMap && (location.latitude || location.longitude)) {
      mapRef.value.pinToMap(location.latitude, location.longitude);
      clearGeoJson();
    }
  }
}

function onPolygonUpdate(data: any) {
  clearAddress();
  setGeoJson(data.geoJson);
}

function onPinUpdate(pinUpdateEvent: PinUpdateEvent) {
  const addressSplit = pinUpdateEvent.address.split(',');
  clearAddress();
  clearGeoJson();
  setStreetAddress(addressSplit[0]);
  setLocality(addressSplit[1]);
  setProvince(addressSplit[2]);
  setLatitude(pinUpdateEvent.latitude);
  setLongitude(pinUpdateEvent.longitude);
}

function resizeMap() {
  mapRef.value?.resizeMap();
}

defineExpose({ resizeMap, onLatLongInput });
</script>

<template>
  <Card>
    <template #title>
      <div class="flex align-items-center">
        <div class="flex flex-grow-1">
          <span
            class="section-header"
            role="heading"
            aria-level="2"
          >
            {{ t('locationCard.header') }}
          </span>
          <Tooltip
            class="mb-2"
            right
            icon="fa-solid fa-circle-question"
            :text="t('locationCard.addressTooltip')"
          />
        </div>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <RadioList
          class="col-span-12"
          name="location.projectLocation"
          :bold="false"
          :disabled="!editable"
          :options="PROJECT_LOCATION_LIST"
          @on-click="handleProjectLocationClick"
        />
        <div
          v-if="values.location?.projectLocation === ProjectLocation.STREET_ADDRESS"
          class="col-span-12"
        >
          <Card class="no-shadow">
            <template #content>
              <div class="grid grid-cols-12 gap-4 nested-grid">
                <EditableSelect
                  class="col-span-12"
                  name="addressSearch"
                  :get-option-label="getAddressSearchLabel"
                  :options="addressGeocoderOptions"
                  :placeholder="t('locationCard.addressSearchPlaceholder')"
                  :bold="false"
                  :disabled="!editable"
                  @on-input="onAddressSearchInput"
                  @on-change="onAddressSelect"
                />
                <InputText
                  class="col-span-4"
                  name="location.streetAddress"
                  disabled
                  :placeholder="t('locationCard.streetAddressPlaceholder')"
                />
                <InputText
                  class="col-span-4"
                  name="location.locality"
                  disabled
                  :placeholder="t('locationCard.localityPlaceholder')"
                />
                <InputText
                  class="col-span-4"
                  name="location.province"
                  disabled
                  :placeholder="t('locationCard.provincePlaceholder')"
                />
                <InputNumber
                  class="col-span-4"
                  name="location.latitude"
                  disabled
                  :help-text="
                    values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES
                      ? t('locationCard.provideLatitude')
                      : ''
                  "
                  :placeholder="t('locationCard.latitudePlaceholder')"
                />
                <InputNumber
                  class="col-span-4"
                  name="location.longitude"
                  disabled
                  :help-text="
                    values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES
                      ? t('locationCard.provideLongitude')
                      : ''
                  "
                  :placeholder="t('locationCard.longitudePlaceholder')"
                />
                <div
                  v-if="values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES"
                  class="col-span-12 text-blue-500"
                >
                  {{ t('locationCard.acceptableCoordinates') }}
                </div>
              </div>
            </template>
          </Card>
        </div>
        <div
          v-if="values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES"
          class="col-span-12"
        >
          <Card class="no-shadow">
            <template #content>
              <div class="grid grid-cols-12 gap-4 nested-grid">
                <InputNumber
                  class="col-span-4"
                  name="location.latitude"
                  :disabled="!editable"
                  :help-text="t('locationCard.provideLatitude')"
                  :placeholder="t('locationCard.latitudePlaceholder')"
                  @keyup.enter="onLatLongInput"
                />
                <InputNumber
                  class="col-span-4"
                  name="location.longitude"
                  :disabled="!editable"
                  :help-text="t('locationCard.provideLongitude')"
                  :placeholder="t('locationCard.longitudePlaceholder')"
                  @keyup.enter="onLatLongInput"
                />
                <div class="col-span-4">
                  <Button
                    class="lat-long-btn"
                    :label="t('locationCard.showOnMap')"
                    :disabled="!editable"
                    @click="onLatLongInput"
                  />
                </div>
              </div>
              <div>
                <div class="text-blue-500">
                  {{ t('locationCard.acceptableCoordinates') }}
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
      <div v-if="values.location?.projectLocation !== ProjectLocation.PIN_OR_DRAW">
        <Map
          ref="mapRef"
          :disabled="!editable"
          :latitude="mapLatitude"
          :longitude="mapLongitude"
        />
      </div>
      <div v-if="values.location?.projectLocation === ProjectLocation.PIN_OR_DRAW">
        <Map
          ref="mapRef"
          :pin-or-draw="true"
          :disabled="!editable"
          :geo-json-data="values.location.geoJson"
          :latitude="mapLatitude"
          :longitude="mapLongitude"
          @map:erased="
            clearGeoJson();
            clearAddress();
          "
          @map:polygon-updated="onPolygonUpdate"
          @map:pin-updated="onPinUpdate"
        />
        <Card class="no-shadow">
          <template #content>
            <div class="grid grid-cols-12 gap-4 nested-grid">
              <InputText
                class="col-span-4"
                name="location.streetAddress"
                disabled
                :placeholder="t('locationCard.streetAddressPlaceholder')"
              />
              <InputText
                class="col-span-4"
                name="location.locality"
                disabled
                :placeholder="t('locationCard.localityPlaceholder')"
              />
              <InputText
                class="col-span-4"
                name="location.province"
                disabled
                :placeholder="t('locationCard.provincePlaceholder')"
              />
              <InputNumber
                class="col-span-4"
                name="location.latitude"
                disabled
                :help-text="
                  values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES
                    ? t('locationCard.provideLatitude')
                    : ''
                "
                :placeholder="t('locationCard.latitudePlaceholder')"
              />
              <InputNumber
                class="col-span-4"
                name="location.longitude"
                disabled
                :help-text="
                  values.location?.projectLocation === ProjectLocation.LOCATION_COORDINATES
                    ? t('locationCard.provideLongitude')
                    : ''
                "
                :placeholder="t('locationCard.longitudePlaceholder')"
              />
            </div>
          </template>
        </Card>
      </div>
    </template>
  </Card>
</template>
