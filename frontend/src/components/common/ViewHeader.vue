<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import housingBannerImg from '@/assets/images/housing_banner.png';
import elecBannerImg from '@/assets/images/elec_banner.png';
import { useAppStore } from '@/store';
import { Initiative } from '@/utils/enums/application';

// Props
const { header } = defineProps<{
  header: string;
}>();

// State
const headerImg = ref();

// Actions
watchEffect(() => {
  switch (useAppStore().getInitiative) {
    case Initiative.ELECTRIFICATION:
      headerImg.value = elecBannerImg;
      break;
    case Initiative.HOUSING:
      headerImg.value = housingBannerImg;
      break;
  }
});
</script>

<template>
  <div class="flex justify-between">
    <h1>{{ header }}</h1>
    <img
      v-if="headerImg"
      class="header-img"
      :src="headerImg"
      alt="Header image"
    />
  </div>
</template>

<style lang="scss" scoped>
.header-img {
  max-height: 105px;
  max-width: 137px;
  width: auto;
  height: auto;
}
</style>
