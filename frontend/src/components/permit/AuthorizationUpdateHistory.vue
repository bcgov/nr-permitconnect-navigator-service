<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// Composables
const { t } = useI18n();
</script>

<template>
  <div class="gap-x-6 gap-y-6 update-history px-5 pt-5 mt-4 py-5">
    <h5>{{ t('i.common.authorization.authorizationForm.updateNoteHistory') }}</h5>
  </div>
</template>
<style lang="scss" scoped>
.update-history {
  background-color: $app-grey;
  border-radius: 0.5rem;
}
</style>
