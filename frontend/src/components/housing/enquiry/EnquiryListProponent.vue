<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Column, DataTable } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { IntakeStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Enquiry } from '@/types';

// Props
const { loading, enquiries } = defineProps<{
  loading: boolean;
  enquiries: Array<Enquiry> | undefined;
}>();

// State
const selection: Ref<Enquiry | undefined> = ref(undefined);
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :loading="loading"
    :value="enquiries"
    data-key="enquiryId"
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="10"
    sort-field="submittedAt"
    :sort-order="-1"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    current-page-report-template="({currentPage} of {totalPages})"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
  >
    <template #empty>
      <div class="flex justify-content-center">
        <p class="font-bold text-xl">
          Submit a general enquiry for questions that are not related to existing projects
        </p>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="activity.activityId"
      header="Confirmation ID"
      :sortable="true"
      frozen
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <router-link
            :to="{
              name: RouteName.HOUSING_ENQUIRY_INTAKE,
              query: { activityId: data.activityId, enquiryId: data.enquiryId }
            }"
          >
            {{ data.activityId }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="intakeStatus"
      header="State"
      :sortable="true"
    />

    <Column
      field="submittedAt"
      header="Submitted date"
      :sortable="true"
    >
      <template #body="{ data }">
        {{ data.intakeStatus !== IntakeStatus.DRAFT ? formatDate(data?.submittedAt) : undefined }}
      </template>
    </Column>
  </DataTable>
</template>
