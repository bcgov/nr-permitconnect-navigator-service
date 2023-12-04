<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Spinner } from '@/components/layout';
import { Column, DataTable, FilterMatchMode, InputText } from '@/lib/primevue';

import { chefsService } from '@/services';
import { RouteNames } from '@/utils/constants';
import { formatDateShort, formatJwtUsername } from '@/utils/formatters';

import type { Ref } from 'vue';

// State
const loading: Ref<boolean> = ref(false);
const submissions: Ref<Array<any>> = ref([]);

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Actions
onMounted(async () => {
  loading.value = true;
  submissions.value = (await chefsService.getFormExport()).data;
  loading.value = false;
});
</script>

<template>
  <h1>Submissions</h1>

  <div class="flex">
    <div class="flex-grow-1">
      <DataTable
        v-model:filters="filters"
        :loading="loading"
        :value="submissions"
        data-key="id"
        class="p-datatable-sm"
        responsive-layout="scroll"
        :paginator="true"
        :rows="10"
        paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
        current-page-report-template="{first}-{last} of {totalRecords}"
        :rows-per-page-options="[10, 20, 50]"
        :global-filter-fields="['form.confirmationId', 'form.username']"
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
                v-tooltip.bottom="'Search by confirmation ID or submitting user'"
                placeholder="Search"
              />
            </span>
          </div>
        </template>
        <Column
          field="form.confirmationId"
          header="Confirmation Id"
          :sortable="true"
        >
          <template #body="{ data }">
            <div :data-submissionId="data.form.submissionId">
              <router-link
                :to="{
                  name: RouteNames.SUBMISSION,
                  query: { formId: data.form.id, submissionId: data.form.submissionId }
                }"
              >
                {{ data.form.confirmationId }}
              </router-link>
            </div>
          </template>
        </Column>
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
          field="form.assignee"
          header="Assignee"
          :sortable="true"
        />
        <Column header="Address">
          <template #body="{ data }">
            {{ data?.streetAddress }}
          </template>
        </Column>
        <Column
          field="singleFamilyUnits"
          header="# of Units"
          :sortable="true"
        />
        <Column
          field="form.status"
          header="Status"
          :sortable="true"
        />
        <Column
          field="form.username"
          header="Created By"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatJwtUsername(data?.form.username) }}
          </template>
        </Column>
        <Column
          field="form.createdAt"
          header="Submission Date"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatDateShort(data?.form.createdAt) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
