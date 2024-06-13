<script setup lang="ts">
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { onMounted, onUpdated } from 'vue';

// Map component will be misaligned if mounted while not visible. Trigger resize to fix on show
// Parent component needs to trigger nextTick().then(() => mapRef?.value?.resizeMap()

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

function resizeMap() {
  if (map) map.invalidateSize();
}

function setAddressMarker(coords: any) {
  if (marker) map.removeLayer(marker);
  // Custom(-ish) markers courtesy of https://github.com/pointhi/leaflet-color-markers
  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  marker = L.marker(coords, { icon: redIcon });
  map.addLayer(marker);
}

async function initMap() {
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  map = L.map('map', {
    center: [48.428, -123.365],
    zoom: 13,
    layers: [osm]
  });

  // Don't allow dragging outside BC
  const bcBounds = new L.LatLngBounds([44, -140], [63, -109]);
  map.setMaxBounds(bcBounds);
  map.on('drag', function () {
    map.panInsideBounds(bcBounds, { animate: false });
  });
}

onMounted(async () => {
  await initMap();
});

defineExpose({ resizeMap });

onUpdated(async () => {
  if (props.latitude && props.longitude) {
    const addressLocation = { lat: props.latitude, lng: props.longitude };
    map.flyTo(addressLocation, 17);
    setAddressMarker(addressLocation);
  }
});
</script>
<template>
  <div class="grid nested-grid max-width-1500">
    <div class="col-12">
      <!-- map -->
      <div id="map" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.max-width-1500 {
  max-width: 1500px;
}
#map {
  height: 400px;
  width: 100%;
}
</style>
