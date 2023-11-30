<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Spinner } from '@/components/layout';
import { Column, DataTable, FilterMatchMode, InputText } from '@/lib/primevue';

import { chefsService } from '@/services';
import { RouteNames } from '@/utils/constants';
import { formatDateShort, formatJwtUsername } from '@/utils/formatters';

import type { Ref } from 'vue';

// State
const submissions: Ref<Array<any>> = ref([]);
const displayRowsPerPage: Ref<number> = ref(10);
const topTableRowEntry: Ref<number> = ref(0);

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Actions
onMounted(async () => {
  submissions.value = (await chefsService.getSubmissions()).data;
  updateFormsObject();
});

// Tracks how many rows displayed
const updateRowsPerPage = (rowNumber: number) => {
  displayRowsPerPage.value = rowNumber;
  updateFormsObject();
};

// Only retrieve submissions data from rows displayed in table
const updateFormsObject = async () => {
  for (let i = topTableRowEntry.value; i < topTableRowEntry.value+displayRowsPerPage.value; i++) {
    if (submissions.value[i]?.retrieved) {
      continue;
    }
    chefsService.getSubmission(submissions.value[i].formId, submissions.value[i].submissionId).then((res) => {
      submissions.value[i] = {
        retrieved: true,
        ...submissions.value[i],
        ...res?.data?.submission?.submission?.data
      };
    });
  }
};

// Tracks the first submission entry displayed by table
const updateFirst = (firstRow: number) => {
  topTableRowEntry.value = firstRow;
};
</script>

<template>
  <h1>Submissions</h1>

  <div class="flex">
    <div class="flex-grow-1">
      <DataTable
        v-model:filters="filters"
        :loading="false"
        :value="submissions"
        data-key="id"
        class="p-datatable-sm"
        responsive-layout="scroll"
        :paginator="true"
        :rows="displayRowsPerPage"
        paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
        current-page-report-template="{first}-{last} of {totalRecords}"
        :rows-per-page-options="[10, 20, 50]"
        :global-filter-fields="['confirmationId', 'createdBy']"
        @update:rows="updateRowsPerPage"
        @update:first="updateFirst"
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
                placeholder="Search"
              />
            </span>
          </div>
        </template>
        <Column
          header="Submission Id"
          :sortable="true"
        >
          <template #body="{ data }">
            <div>
              <router-link
                :to="{ name: RouteNames.SUBMISSION, query: { formId: data.formId, submissionId: data.submissionId } }"
              >
                {{ data.submissionId }}
              </router-link>
            </div>
          </template>
        </Column>
        <Column
          field="confirmationId"
          header="Confirmation Id"
          :sortable="true"
        />
        <Column
          field="projectName"
          header="Project Name"
          :sortable="true"
        />
        <Column
          header="Contact"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ data?.contactLastName }}{{ data?.contactLastName && data?.contactFirstName ? ', ' : '' }}
            {{ data?.contactFirstName }}
          </template>
        </Column>
        <Column
          field="contactEmail"
          header="Contact Email"
          :sortable="true"
        />
        <Column
          field="contactPhoneNumber"
          header="Contact Phone"
          :sortable="true"
        />
        <Column
          field="assignedQueue"
          header="Assignee"
          :sortable="true"
        />
        <Column
          header="Address"
        >
          <template #body="{ data }">
            {{ data?.locationProvided?.fullAddress ?? '' }}
          </template>
        </Column>
        <Column
          field="singleFamilyUnits"
          header="# of Units"
          :sortable="true"
        />
        <Column
          field="currentPermitStatus"
          header="Status"
          :sortable="true"
        />
        <Column
          field="createdBy"
          header="Created By"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatJwtUsername(data?.createdBy) }}
          </template>
        </Column>
        <Column
          field="createdAt"
          header="Submission Date"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatDateShort(data?.createdAt) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
