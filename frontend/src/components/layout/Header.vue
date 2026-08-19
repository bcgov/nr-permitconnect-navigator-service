<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import HeaderMenu from '@/components/common/HeaderMenu.vue';
import { AppDrawer } from '@/components/layout';

// Actions
const { t } = useI18n();
const route = useRoute();
</script>

<template>
  <header>
    <nav
      id="header-branding"
      class="bg-white text-[var(--p-bcblue-950)] whitespace-nowrap border-b-2 border-[var(--p-gold-950)]"
      role="none"
    >
      <div class="flex flex-row flex-wrap items-center lg:pl-12 py-2">
        <div class="flex flex-none">
          <a href="https://www2.gov.bc.ca">
            <img
              src="@/assets/images/BCID_H_rgb_pos.png"
              class="bc-logo max-h-[60px] h-[60px]"
              alt="B.C. Government Logo"
            />
          </a>
        </div>
        <div class="mx-2 bcds-header-line bg-[#d8d8d8] w-[1px] h-[32px]" />
        <div class="flex grow ml-2">
          <h2 class="m-0 font-bold app-primary-color">{{ t('common.header.name') }}</h2>
        </div>
        <div class="flex justify-end lg:mr-12">
          <HeaderMenu />
          <AppDrawer v-if="!route.meta?.hideAppDrawer" />
        </div>
      </div>
    </nav>
  </header>
</template>
