<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import HeaderMenu from '../common/HeaderMenu.vue';

// Actions
const { t } = useI18n();
</script>

<template>
  <header>
    <nav id="header-branding">
      <div class="flex flex-row flex-wrap align-items-center p-2 pb-0 lg:pl-6">
        <div class="flex flex-none">
          <a href="https://www2.gov.bc.ca">
            <img
              src="@/assets/images/BCID_H_rgb_pos.png"
              width="181"
              alt="B.C. Government Logo"
            />
          </a>
        </div>
        <div class="flex flex-grow-1 ml-2">
          <h2 class="m-0 app-primary-color">{{ t('header.name') }}</h2>
        </div>
        <div class="flex justify-content-end lg:mr-6">
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
  box-shadow: 0 6px 8px -4px #b3b1b3;
  -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;
  -moz-box-shadow: 0 6px 8px -4px #b3b1b3;

  @media not print {
    border-bottom: 2px solid #fcba19;
  }
}
</style>
