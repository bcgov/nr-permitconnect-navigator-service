<script setup lang="ts">
import { computed } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';

import { useAuthStore } from '@/store';

import { ACCESS_ROLES } from '@/utils/enums';

// Store
const authStore = useAuthStore();

// Actions
const getTitle = computed(() => (authStore.userHasRole() ? 'Submissions' : 'My drafts and submissions'));
</script>

<template>
  <h1>{{ getTitle }}</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator
    v-if="
      authStore.userIsRole([
        ACCESS_ROLES.PCNS_ADMIN,
        ACCESS_ROLES.PCNS_DEVELOPER,
        ACCESS_ROLES.PCNS_NAVIGATOR,
        ACCESS_ROLES.PCNS_SUPERVISOR
      ])
    "
  />

  <!-- Proponent view -->
  <SubmissionsProponent v-else />
</template>
