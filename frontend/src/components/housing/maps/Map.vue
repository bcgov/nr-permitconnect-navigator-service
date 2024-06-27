<script setup lang="ts">
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { onMounted, onUpdated } from 'vue';

import {
  BC_BOUNDARIES_LOWER,
  BC_BOUNDARIES_UPPER,
  MAP_ICON_OPTIONS_RED,
  MAP_INITIAL_START_POINT,
  OSM_TILE_LAYER_OPTIONS,
  OSM_URL_TEMPLATE
} from '@/utils/constants/mapping';

type Props = {
  latitude?: number;
  longitude?: number;
};

const props = withDefaults(defineProps<Props>(), {
  latitude: undefined,
  longitude: undefined
});

// Actions
let marker: L.Marker;
let map: L.Map;

async function initMap() {
  const osm = L.tileLayer(OSM_URL_TEMPLATE, OSM_TILE_LAYER_OPTIONS);

  map = L.map('map', {
    ...MAP_INITIAL_START_POINT,
    layers: [osm]
  });

  // Don't allow dragging outside BC
  const bcBounds = new L.LatLngBounds(BC_BOUNDARIES_LOWER, BC_BOUNDARIES_UPPER);
  map.setMaxBounds(bcBounds);
  map.on('drag', function () {
    map.panInsideBounds(bcBounds, { animate: false });
  });
}

// Map component will be misaligned if mounted while not visible. Trigger resize to fix on show
// Parent component needs to trigger nextTick().then(() => mapRef?.value?.resizeMap()
function resizeMap() {
  if (map) map.invalidateSize();
}

function setAddressMarker(coords: any) {
  if (marker) map.removeLayer(marker);
  // Custom(-ish) markers courtesy of https://github.com/pointhi/leaflet-color-markers
  const redIcon = new L.Icon(MAP_ICON_OPTIONS_RED);
  marker = L.marker(coords, { icon: redIcon });
  map.addLayer(marker);
}

defineExpose({ resizeMap });

onMounted(async () => {
  await initMap();
});

onUpdated(async () => {
  if (props.latitude && props.longitude) {
    const addressLocation = { lat: props.latitude, lng: props.longitude };
    map.flyTo(addressLocation, 17);
    setAddressMarker(addressLocation);
  }
});
</script>

<template>
  <div class="grid nested-grid">
    <div class="col-12">
      <!-- map -->
      <div id="map" />
    </div>
  </div>
</template>

<style scoped lang="scss">
#map {
  height: 400px;
  width: 100%;
}
</style>
