<script setup lang="ts">
import { ref } from 'vue';

import { Button } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';

const items = ref([
  {
    top: 'Start a new project investigation with a Navigator',
    bottom: 'Find out what permits are needed for your project with a Navigator.',
    icon: 'fa-file-circle-check',
    route: RouteNames.HOUSING_INTAKE
  },
  {
    top: 'Submit an enquiry',
    bottom: 'For general questions, requests, or updates on your application.',
    icon: 'fa-circle-question',
    route: RouteNames.HOUSING_ENQUIRY
  },
  {
    top: 'View my drafts and submissions',
    icon: 'fa-pen-to-square',
    route: RouteNames.HOUSING_SUBMISSIONS
  },
  {
    top: 'Check the status of your applications and/or permits',
    icon: 'fa-bars-progress',
    route: RouteNames.HOME
  }
]);
</script>

<template>
  <div class="flex flex-row align-items-center w-full housing">
    <font-awesome-icon
      icon="fa-solid fa-house"
      class="mr-3 text-5xl app-primary-color"
    />
    <h1 class="app-primary-color">Housing</h1>
  </div>
  <div class="flex flex-column">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex justify-content-center mb-5"
    >
      <router-link
        v-slot="{ href, navigate }"
        :to="{ name: item.route }"
        custom
      >
        <a
          :href="href"
          @click="navigate"
        >
          <Button
            class="p-0 m-0"
            text
          >
            <div class="card">
              <div class="flex align-items-center text-left h-full mx-3">
                <div :class="['mr-2', { 'pb-4': item.bottom }]">
                  <font-awesome-icon
                    :icon="`fa-solid
                  ${item.icon}`"
                  />
                </div>
                <div>
                  <div class="font-bold">{{ item.top }}</div>
                  <div v-if="item.bottom">{{ item.bottom }}</div>
                </div>
              </div>
            </div>
          </Button>
        </a>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card {
  border-width: 2px;
  border-style: solid;
  border-radius: 0.5rem;
  border-color: $app-primary;
  width: 550px;
  height: 80px;
}

.housing {
  // background-color: #f8f9fa;
  padding-left: 3.5rem;
}
</style>
