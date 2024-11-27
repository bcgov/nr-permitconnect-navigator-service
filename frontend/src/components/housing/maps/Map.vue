<script setup lang="ts">
import * as L from 'leaflet';
import type { GeoJSON } from 'geojson';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { onMounted, onUpdated, ref, watch } from 'vue';

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

import type { Ref } from 'vue';

// Props
const {
  disabled = false,
  latitude = undefined,
  longitude = undefined,
  pinOrDraw = false
} = defineProps<{
  disabled?: boolean;
  latitude?: number;
  longitude?: number;
  pinOrDraw?: boolean;
}>();

// Constants
const POINT = 'Point';

// Actions
let marker: L.Marker;
let map: L.Map;
const geoJSON: Ref<GeoJSON | undefined> = ref(undefined);
const toast = useToast();

const oldLayer = ref<L.Layer | undefined>(undefined);
// Emits
const emit = defineEmits(['map:polygonUpdated', 'map:pinUpdated']);

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
          //@ts-ignore
          map.removeLayer(oldLayer.value);
          oldLayer.value = undefined;
        }
        oldLayer.value = e.layer;

        //@ts-ignore
        if (geo.toGeoJSON().geometry.type === POINT) {
          //@ts-ignore
          let latitude = geo.toGeoJSON().geometry.coordinates[1];
          //@ts-ignore
          let longitude = geo.toGeoJSON().geometry.coordinates[0];

          getNearestOccupant(longitude, latitude);
        } else {
          geoJSON.value = geo.toGeoJSON();

          emit('map:polygonUpdated', { geoJSON: geoJSON.value });
        }
        //@ts-ignore
        // geoJSON.value = geo.toGeoJSON();

        // Zoom in
        if (geo.getBounds) map.fitBounds(geo.getBounds());
        //@ts-ignore
        else map.flyTo(geo.getLatLng(), 17);
      } catch (e: any) {
        toast.error('Error', e.message);
      }
    });

    // On feature remove
    map.on('pm:remove', async (e) => {
      try {
        const geo = e.layer as L.GeoJSON;
      } catch (e: any) {
        // toast.error('Error', e.message);
      }
    });
    initControls();
  }
}

// Function to remove all markers from the map
function removeAllMarkers(coords: any) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
}

// show parcel data from Geocoder
async function showPMBCParcelData(polygon: Array<any>) {
  console.log('polygonArray=== ' + JSON.stringify(polygon));
  console.log('geoJSON=== ' + JSON.stringify(geoJSON.value));

  // Make result like this [{"lat":48.42622437569091,"lng":-123.40990219359172},{"lat":48.43191964263008,"lng":-123.40990219359172} from geoJSON

  // const polygonArray = geoJSON.value?.geometry.coordinates[0].map((c: any) => {
  //   return { lat: c[1], lng: c[0] };
  // });

  // const polygonArray = geoJSON.value?.geometry.coordinates[0].map((c: any) => {'lat': c[1], 'lng': c[0]});

  // console.log('polygonArraygeoJSON=== ' + JSON.stringify(geoJSONPolygonArray));
  // await externalApiService.getParcelDataFromPMBC(polygon).then((data: any) => {
  //   parcelData.value = data.features?.map((f: any) => f.properties);
  //   // get comma separated PIDs
  //   const PIDs = parcelData.value?.map((p: any) => p.PID_FORMATTED).join(',');
  //   emit('map:polygonUpdated', { PID: PIDs, geoJSON: geoJSON.value });
  // });
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

function initControls() {
  map.pm.addControls({
    position: 'topleft',

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
  });
}

function disableInteraction() {
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
}

function enableInteraction() {
  map.dragging.enable();
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  if (map.tap) map.tap.enable();
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
  if (latitude && longitude) {
    const addressLocation = { lat: latitude, lng: longitude };
    map.flyTo(addressLocation, 17);
    setAddressMarker(addressLocation);
  }
});

watch(
  () => disabled,
  (val) => {
    if (val) disableInteraction();
    else enableInteraction();
  }
);
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
