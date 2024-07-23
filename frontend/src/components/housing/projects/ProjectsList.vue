<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, useConfirm, useToast } from '@/lib/primevue';
import { submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { IntakeStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Submission } from '@/types';

// Props
type Props = {
  loading: boolean;
  submissions: Array<Submission> | undefined;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const selection: Ref<Submission | undefined> = ref(undefined);

// Actions
// const confirm = useConfirm();
// const toast = useToast();

const sortTest = (e = 'meh') => {
  console.log('sorttest', e);
  return -1;
};
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :loading="loading"
    :value="props.submissions"
    data-key="submissionId"
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="10"
  >
    <template #empty>
      <div class="flex justify-content-center">
        <h3>No active projects</h3>
      </div>
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
              name: RouteName.HOUSING_SUBMISSION_INTAKE,
              query: { activityId: data.activityId, submissionId: data.submissionId }
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
      header="Status"
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
    <Column
      field="submittedAt"
      header="date"
      :sortable="true"
      style="min-width: 150px"
    />
  </DataTable>
</template>
