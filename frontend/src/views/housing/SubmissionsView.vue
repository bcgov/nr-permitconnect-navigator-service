<script setup lang="ts">
import { computed } from 'vue';

import BackButton from '@/components/common/BackButton.vue';
import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';

import { PermissionService } from '@/services';
import { Permissions } from '@/services/permissionService';
import { RouteName } from '@/utils/enums/application';

// Store
const permissionService = new PermissionService();

// Actions
const getTitle = computed(() =>
  permissionService.can(Permissions.HOUSING_SUBMISSION_READ) ? 'Submissions' : 'My drafts and previous entries'
);
</script>

<template>
  <BackButton
    v-if="!permissionService.can(Permissions.HOUSING_SUBMISSION_READ)"
    :route-name="RouteName.HOUSING"
    text="Back to Housing"
  />

  <h1>{{ getTitle }}</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator v-if="permissionService.can(Permissions.HOUSING_SUBMISSION_READ)" />

  <!-- Proponent view -->
  <SubmissionsProponent v-else-if="permissionService.can(Permissions.HOUSING_SUBMISSION_READ_SELF)" />
</template>
