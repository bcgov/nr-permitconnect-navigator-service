<script setup lang="ts">
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { onMounted, ref, toRaw, watch } from 'vue';

import { useToast } from '@/lib/primevue';
import { externalApiService } from '@/services';
import {
  BC_BOUNDARIES_LOWER,
  BC_BOUNDARIES_UPPER,
  MAP_ICON_OPTIONS_RED,
  MAP_INITIAL_START_POINT,
  OSM_TILE_LAYER_OPTIONS,
  OSM_URL_TEMPLATE
} from '@/utils/constants/mapping';

import type { GeoJSON } from 'geojson';
import type { Ref } from 'vue';
import instance from '@/i18n';

// Props
const {
  disabled = false,
  geoJsonData = undefined,
  pinOrDraw = false
} = defineProps<{
  disabled?: boolean;
  geoJsonData?: GeoJSON;
  pinOrDraw?: boolean;
}>();

// Constants
const POINT = 'Point';

// Emits
const emit = defineEmits(['map:polygonUpdated', 'map:pinUpdated', 'map:erased']);

// Actions
let marker: L.Marker;
let map: L.Map;
const geoJson: Ref<GeoJSON | undefined> = ref(undefined);
const toast = useToast();
const oldLayer = ref<L.Layer | undefined>(undefined);

const drawControlOptions = {
  position: 'topleft' as L.ControlPosition,

  // Create
  drawCircleMarker: false,
  drawCircle: false,
  drawText: false,
  drawPolyline: false,

  // Edit
  cutPolygon: false,
  dragMode: false,
  editMode: false,
  rotateMode: false
};

async function initMap() {
  L.Icon.Default.prototype = new L.Icon(MAP_ICON_OPTIONS_RED);
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

  if (pinOrDraw) {
    map.on('pm:create', async (e) => {
      try {
        const geo = e.layer as L.GeoJSON;

        if (oldLayer.value) {
          // @ts-expect-error - insufficient type definitions
          map.removeLayer(toRaw(oldLayer.value));
          oldLayer.value = undefined;
        }
        oldLayer.value = e.layer;

        // @ts-expect-error - insufficient type definitions
        if (geo.toGeoJSON().geometry.type === POINT) {
          // @ts-expect-error - insufficient type definitions
          let latitude = geo.toGeoJSON().geometry.coordinates[1];
          // @ts-expect-error - insufficient type definitions
          let longitude = geo.toGeoJSON().geometry.coordinates[0];

          getNearestOccupant(longitude, latitude);
        } else {
          geoJson.value = geo.toGeoJSON();

          emit('map:polygonUpdated', { geoJson: toRaw(geoJson.value) });
        }
        // Zoom in
        zoomToGeometry(geo);
      } catch (e) {
        if (e instanceof Error) toast.error('Error', e.message);
      }
    });
    // On erase
    map.on('pm:remove', () => {
      emit('map:erased');
    });
    enableDrawControls();
  }
}

// Function to remove all markers from the map
function removeAllMarkers() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
}

// show parcel data from Geocoder
async function getNearestOccupant(longitude: string, latitude: string) {
  const result = await externalApiService.getNearestOccupant(longitude, latitude);
  const address = result.data.properties.occupantAliasAddress;
  if (!address || address.length == 0) {
    toast.warn('No address found');
  }
  emit('map:pinUpdated', {
    longitude: longitude,
    latitude: latitude,
    address: address
  });
}

function disableInteraction() {
  if (pinOrDraw) disableDrawControls();
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tapHold) map.tapHold.disable();
}

function disableDrawControls() {
  map.pm.removeControls();
}

function enableInteraction() {
  if (pinOrDraw) enableDrawControls();
  map.dragging.enable();
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  if (map.tapHold) map.tapHold.enable();
}

function enableDrawControls() {
  map.pm.addControls(drawControlOptions);
}

// Map component will be misaligned if mounted while not visible. Trigger resize to fix on show
// Parent component needs to trigger nextTick().then(() => mapRef?.value?.resizeMap()
function resizeMap() {
  if (map) {
    map.invalidateSize();
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        zoomToGeometry(layer);
      }
    });
  }
}

function setAddressMarker(coords: any) {
  if (marker) map.removeLayer(marker);
  // Custom(-ish) markers courtesy of https://github.com/pointhi/leaflet-color-markers
  const redIcon = new L.Icon(MAP_ICON_OPTIONS_RED);
  marker = L.marker(coords, { icon: redIcon });
  map.addLayer(marker);
  oldLayer.value = marker;
}

function zoomToGeometry(geo: L.GeoJSON) {
  if (!geo) return;
  // Zoom in
  if (geo.getBounds) map.fitBounds(geo.getBounds());
  // @ts-expect-error - insufficient type definitions
  else map.flyTo(geo.getLatLng(), 17);
}

function drawGeoJson() {
  const geo = L.geoJSON(geoJsonData) as L.GeoJSON;
  geo.addTo(map);
  oldLayer.value = geo;
}

defineExpose({ resizeMap, pinToMap });

onMounted(async () => {
  await initMap();
  if (geoJsonData) drawGeoJson();
  if (disabled) disableInteraction();
  else enableInteraction();

  // Clear all markers on mount
  removeAllMarkers();
});

function pinToMap(lat: number, lng: number) {
  if (!(lat && lng)) return;
  const addressLocation = { lat: lat, lng: lng };
  map.flyTo(addressLocation, 17);
  setAddressMarker(addressLocation);
}

watch(
  () => disabled,
  () => {
    if (disabled) disableInteraction();
    else enableInteraction();
  }
);
</script>

<template>
  <div class="grid grid-cols-12 gap-4 nested-grid">
    <div class="col-span-12">
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
