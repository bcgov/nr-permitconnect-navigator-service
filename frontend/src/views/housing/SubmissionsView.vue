<script setup lang="ts">
import { computed } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';
import { usePermissionStore } from '@/store';
import { NavigationPermission } from '@/store/permissionStore';

// Store
const permissionStore = usePermissionStore();

// Actions
const getTitle = computed(() =>
  permissionStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS) ? 'Submissions' : 'My drafts and submissions'
);
</script>

<template>
  <h1>{{ getTitle }}</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator v-if="permissionStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS)" />

  <!-- Proponent view -->
  <SubmissionsProponent v-else-if="permissionStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS_SUB)" />
</template>
