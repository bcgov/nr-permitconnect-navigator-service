<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import ElectrificationProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import GeneralProjectForm from '@/components/general/project/ProjectFormNavigator.vue';
import HousingProjectForm from '@/components/housing/project/ProjectFormNavigator.vue';
import { useAppStore, useAuthZStore, useProjectStore } from '@/store';
import { Action, Initiative, Resource } from '@/utils/enums/application';

import type { ElectrificationProject, GeneralProject, HousingProject } from '@/types';

// Store
const { getInitiative } = storeToRefs(useAppStore());
const { getProject, getProjectIsCompleted } = storeToRefs(useProjectStore());

// State
const electrificationProject = computed(() => getProject.value as ElectrificationProject);
const generalProject = computed(() => getProject.value as GeneralProject);
const housingProject = computed(() => getProject.value as HousingProject);
</script>

<template>
  <span v-if="getProject">
    <ElectrificationProjectForm
      v-if="getInitiative === Initiative.ELECTRIFICATION"
      :editable="
        !getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.ELECTRIFICATION_PROJECT, Action.UPDATE)
      "
      :project="electrificationProject"
    />
    <GeneralProjectForm
      v-if="getInitiative === Initiative.GENERAL"
      :editable="!getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.GENERAL_PROJECT, Action.UPDATE)"
      :project="generalProject"
    />
    <HousingProjectForm
      v-if="getInitiative === Initiative.HOUSING"
      :editable="!getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.HOUSING_PROJECT, Action.UPDATE)"
      :project="housingProject"
    />
  </span>
</template>
