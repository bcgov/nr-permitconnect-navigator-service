<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Column, DataTable } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';

import type { Submission } from '@/types';
import type { Ref } from 'vue';

// Props
const { loading, submissions } = defineProps<{
  loading: boolean;
  submissions: Array<Submission> | undefined;
}>();

// State
const selection: Ref<Submission | undefined> = ref(undefined);

// Actions
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :loading="loading"
    :value="submissions"
    data-key="submissionId"
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
              params: { submissionId: data.submissionId }
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
