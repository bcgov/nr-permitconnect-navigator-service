<script setup lang="ts">
import { computed, ref } from 'vue';

import BackButton from '@/components/common/BackButton.vue';
import SubmissionsNavigator from '@/components/housing/submission/SubmissionsNavigator.vue';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Store
const authzStore = useAuthZStore();

// State
const showCompleted: Ref<boolean> = ref(false);

// Actions
const getTitle = computed(() =>
  authzStore.canNavigate(NavigationPermission.INT_HOUSING)
    ? showCompleted.value
      ? 'Completed Submissions'
      : 'Active Submissions'
    : 'My drafts and previous entries'
);
</script>

<template>
  <BackButton
    v-if="!authzStore.canNavigate(NavigationPermission.INT_HOUSING)"
    :route-name="RouteName.EXT_HOUSING"
    text="Back to Housing"
  />

  <h1>{{ getTitle }}</h1>

  <!-- Navigator view -->
  <SubmissionsNavigator
    v-if="authzStore.canNavigate(NavigationPermission.INT_HOUSING)"
    @submissions-navigator:completed="showCompleted = !showCompleted"
  />
</template>
