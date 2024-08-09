<script setup lang="ts">
import { computed } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

// Store
const authzStore = useAuthZStore();

// Actions
const getTitle = computed(() =>
  authzStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS) ? 'Submissions' : 'My drafts and submissions'
);
</script>

<template>
  <h1>{{ getTitle }}</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator v-if="authzStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS)" />

  <!-- Proponent view -->
  <SubmissionsProponent v-else-if="authzStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS_SUB)" />
</template>
@/store/authnStore
