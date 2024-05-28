<script setup lang="ts">
import { computed } from 'vue';

import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';

import { PermissionService } from '@/services';
import { PERMISSIONS } from '@/services/permissionService';

// Store
const permissionService = new PermissionService();

// Actions
const getTitle = computed(() =>
  permissionService.can(PERMISSIONS.HOUSING_SUBMISSION_READ) ? 'Submissions' : 'My drafts and submissions'
);
</script>

<template>
  <h1>{{ getTitle }}</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator v-if="permissionService.can(PERMISSIONS.HOUSING_SUBMISSION_READ)" />

  <!-- Proponent view -->
  <SubmissionsProponent v-else />
</template>
