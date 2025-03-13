<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Column, DataTable } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';

import type { HousingProject } from '@/types';
import type { Ref } from 'vue';

// Props
const { loading, housingProjects } = defineProps<{
  loading: boolean;
  housingProjects: Array<HousingProject> | undefined;
}>();

// State
const selection: Ref<HousingProject | undefined> = ref(undefined);

// Actions
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :loading="loading"
    :value="housingProjects"
    data-key="housingProjectId"
    removable-sort
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="10"
  >
    <template #empty>
      <div>No active projects at the moment.</div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="projectName"
      header="Project Name"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <router-link
            :to="{
              name: RouteName.EXT_HOUSING_PROJECT,
              params: { housingProjectId: data.housingProjectId }
            }"
          >
            {{ data.projectName }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="activityId"
      header="Confirmation ID"
    />
    <Column
      field="applicationStatus"
      header="Project state"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="user"
      header="Navigator"
    >
      <template #body="{ data }">
        <div>{{ data?.user?.firstName }} {{ data?.user?.lastName }}</div>
      </template>
    </Column>
  </DataTable>
</template>
