<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Checkbox, Column, DataTable, FilterMatchMode, InputText } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { ChefsSubmissionForm } from '@/types';

// Props
type Props = {
  loading: boolean;
  submissions: Array<ChefsSubmissionForm> | undefined;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const selection: Ref<ChefsSubmissionForm | undefined> = ref(undefined);

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
</script>

<template>
  <DataTable
    v-model:filters="filters"
    v-model:selection="selection"
    :loading="loading"
    :value="props.submissions"
    data-key="submissionId"
    class="p-datatable-sm"
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="10"
    sort-field="submittedAt"
    :sort-order="-1"
    paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
    current-page-report-template="{first}-{last} of {totalRecords}"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
  >
    <template #empty>
      <div class="flex justify-content-center">
        <h3>No items found.</h3>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <template #header>
      <div class="flex justify-content-end">
        <span class="p-input-icon-left ml-4">
          <i class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            placeholder="Search all"
          />
        </span>
      </div>
    </template>
    <Column
      field="confirmationId"
      header="Activity"
      :sortable="true"
      frozen
    >
      <template #body="{ data }">
        <div :data-submissionId="data.submissionId">
          <router-link
            :to="{
              name: RouteNames.SUBMISSION,
              query: { formId: data.formId, submissionId: data.submissionId }
            }"
          >
            {{ data.confirmationId }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="projectName"
      header="Project Name"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="contactName"
      header="Contact"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="contactPhoneNumber"
      header="Contact phone"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="contactEmail"
      header="Contact email"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="submittedAt"
      header="Submission date"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ formatDate(data?.submittedAt) }}
      </template>
    </Column>
    <Column
      field="locationPIDs"
      header="Location PID(s)"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="assignedTo"
      header="Assigned to"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ data.user?.lastName }}{{ data.user?.lastName && data.user?.firstName ? ', ' : '' }}
        {{ data.user?.firstName }}
      </template>
    </Column>
    <Column
      field="intakeStatus"
      header="Intake status"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="applicationStatus"
      header="Activity state"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="singleFamilyUnits"
      header="Units"
      :sortable="true"
      style="min-width: 100px"
    />
    <Column
      field="streetAddress"
      header="Location address"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="latitude"
      header="Location latitude"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="longitude"
      header="Location longitude"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="queuePriority"
      header="Priority"
      :sortable="true"
      style="min-width: 100px"
    />
    <Column
      field="relatedPermits"
      header="Related permits"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="astUpdated"
      header="Automated Status Tool (AST)"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        <Checkbox
          v-model="data.astUpdated"
          :binary="true"
          disabled
        />
      </template>
    </Column>
    <Column
      field="addedToATS"
      header="Authorized Tracking System (ATS) updated"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        <Checkbox
          v-model="data.addedToATS"
          :binary="true"
          disabled
        />
      </template>
    </Column>
    <Column
      field="atsClientNumber"
      header="ATS Client #"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="ltsaCompleted"
      header="Land Title Survey Authority (LTSA) completed"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        <Checkbox
          v-model="data.ltsaCompleted"
          :binary="true"
          disabled
        />
      </template>
    </Column>
    <Column
      field="naturalDisaster"
      header="Location affected by natural disaster"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        <Checkbox
          v-model="data.naturalDisaster"
          :binary="true"
          disabled
        />
      </template>
    </Column>
    <Column
      field="financiallySupported"
      header="Financially supported"
      :sortable="true"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Checkbox
          v-model="data.financiallySupported"
          :binary="true"
          disabled
        />
      </template>
    </Column>
    <Column
      field="aaiUpdated"
      header="Authorization and Approvals Insight (AAI) updated"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        <Checkbox
          v-model="data.aaiUpdated"
          :binary="true"
          disabled
        />
      </template>
    </Column>
    <Column
      field="waitingOn"
      header="Waiting on"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="bringForwardDate"
      header="Bring forward date"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ formatDate(data?.bringForwardDate) }}
      </template>
    </Column>
  </DataTable>
</template>
