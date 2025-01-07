<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import HeaderMenu from '../common/HeaderMenu.vue';

// Actions
const { t } = useI18n();
</script>

<template>
  <header>
    <nav id="header-branding">
      <div class="flex flex-row flex-wrap items-center lg:pl-12">
        <div class="flex flex-none">
          <a href="https://www2.gov.bc.ca">
            <img
              src="@/assets/images/BCID_H_rgb_pos.png"
              class="bc-logo"
              alt="B.C. Government Logo"
            />
          </a>
        </div>
        <div class="mx-2 bcds-header-line" />
        <div class="flex grow ml-2">
          <h2 class="m-0 font-bold app-primary-color">{{ t('header.name') }}</h2>
        </div>
        <div class="flex justify-end lg:mr-12">
          <HeaderMenu />
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
#header-branding {
  background-color: white;
  color: $app-primary;
  white-space: nowrap;
  // TODO: Reference a surface colour once PrimeVue 4 changes come in
  border-bottom: 1px solid #d8d8d8;
}

.bc-logo {
  max-height: 60px;
  height: 60px;
}

.bcds-header-line {
  // TODO: Reference a surface colour once PrimeVue 4 changes come in
  background-color: #d8d8d8;
  width: 1px;
  height: 32px;
}
</style>
