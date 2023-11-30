<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Spinner } from '@/components/layout';
import { Column, DataTable, FilterMatchMode, InputText } from '@/lib/primevue';

import { chefsService } from '@/services';
import { RouteNames } from '@/utils/constants';
import { formatDateLong, formatJwtUsername } from '@/utils/formatters';

import type { Ref } from 'vue';

// State
const submissions: Ref<Array<any>> = ref([]);
// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Actions
onMounted(async () => {
  submissions.value = (await chefsService.getSubmissions()).data;
});
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
        :rows="10"
        paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
        current-page-report-template="{first}-{last} of {totalRecords}"
        :rows-per-page-options="[10, 20, 50]"
        :global-filter-fields="['confirmationId', 'createdBy']"
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
          field="createdBy"
          header="Created By"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatJwtUsername(data.createdBy) }}
          </template>
        </Column>
        <Column
          field="createdAt"
          header="Created At"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatDateLong(data.createdAt) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
