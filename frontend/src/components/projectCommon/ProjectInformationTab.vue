<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import ElectrificationProjectForm from '@/components/electrification/project/ProjectFormNavigator.vue';
import { default as GeneralProjectForm } from '@/components/general/project/ProjectFormNavigator.vue';
import { default as HousingProjectForm } from '@/components/housing/project/ProjectFormNavigator.vue';
import { useAppStore, useAuthZStore, useProjectStore } from '@/store';
import { Action, Initiative, Resource } from '@/utils/enums/application';

import type { ElectrificationProject, GeneralProject, HousingProject } from '@/types';

// Props
const liveName = defineModel<string>('liveName');

// Store
const { getInitiative } = storeToRefs(useAppStore());
const { getProject, getProjectIsCompleted } = storeToRefs(useProjectStore());

// State
const electrificationProject = computed(() => getProject.value as ElectrificationProject);
const generalProject = computed(() => getProject.value as GeneralProject);
const housingProject = computed(() => getProject.value as HousingProject);

// Actions
function updateLiveName(name: string) {
  liveName.value = name;
}
</script>

<template>
  <span v-if="getProject">
    <ElectrificationProjectForm
      v-if="getInitiative === Initiative.ELECTRIFICATION"
      :editable="
        !getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.ELECTRIFICATION_PROJECT, Action.UPDATE)
      "
      :project="electrificationProject"
      @input-project-name="updateLiveName"
    />
    <GeneralProjectForm
      v-if="getInitiative === Initiative.GENERAL"
      :editable="!getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.GENERAL_PROJECT, Action.UPDATE)"
      :project="generalProject"
      @input-project-name="updateLiveName"
    />
    <HousingProjectForm
      v-if="getInitiative === Initiative.HOUSING"
      :editable="!getProjectIsCompleted && useAuthZStore().can(getInitiative, Resource.HOUSING_PROJECT, Action.UPDATE)"
      :project="housingProject"
      @input-project-name="updateLiveName"
    />
  </span>
</template>
