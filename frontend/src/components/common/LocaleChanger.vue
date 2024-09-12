<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { SUPPORT_LOCALES } from '@/i18n';
import { Select } from '@/lib/primevue';

const { locale } = useI18n();
</script>

<template>
  <div>
    <div>
      <Select
        v-model="locale"
        class="w-full"
        name="localeChanger"
        :options="SUPPORT_LOCALES"
      />
    </div>
  </div>
</template>
