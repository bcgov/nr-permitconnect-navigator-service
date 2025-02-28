<script setup lang="ts">
import BackButton from '@/components/common/BackButton.vue';
import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import SubmissionsProponent from '@/components/housing/submission/SubmissionsProponent.vue';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

// Store
const authzStore = useAuthZStore();
</script>

<template>
  <BackButton
    v-if="!authzStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS)"
    :route-name="RouteName.HOUSING"
    text="Back to Housing"
  />

  <h1>Submissions</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator v-if="authzStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS)" />

  <!-- Proponent view -->
  <SubmissionsProponent v-else-if="authzStore.canNavigate(NavigationPermission.HOUSING_SUBMISSIONS_SUB)" />
</template>
