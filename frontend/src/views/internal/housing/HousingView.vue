<script setup lang="ts">
import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';

// Store
const authzStore = useAuthZStore();
</script>

<template>
  <h1>Submissions</h1>
  <SubmissionsNavigator v-if="authzStore.canNavigate(NavigationPermission.INT_HOUSING)" />
</template>
