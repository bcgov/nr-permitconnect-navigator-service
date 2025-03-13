<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { Column, DataTable } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Enquiry, Pagination, HousingProject } from '@/types';

// Props
const { assignedUsers, contactsHistory, loading } = defineProps<{
  assignedUsers: Record<string, string>;
  contactsHistory: Array<HousingProject | Enquiry>;
  loading: boolean;
}>();

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// State
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedAt',
  page: 0
});
const rowsPerPageOptions: Ref<Array<number>> = ref([10, 20, 50]);
const selection: Ref<Enquiry | HousingProject | undefined> = ref(undefined);

// Actions
function getUsersName(userId: string) {
  return assignedUsers[userId];
}

function getRouteToObject(data: Enquiry | HousingProject) {
  let toObject = {};
  if ('housingProjectId' in data) {
    toObject = {
      name: RouteName.INT_HOUSING_PROJECT,
      params: { housingProjectId: data.housingProjectId },
      query: { activityId: data.activityId }
    };
  } else {
    toObject = {
      name: RouteName.INT_HOUSING_ENQUIRY,
      params: { enquiryId: data.enquiryId },
      query: { activityId: data.activityId }
    };
  }
  return toObject;
}

function normalizeContactHistory() {
  return contactsHistory.map((se) => ({
    ...se,
    state: 'housingProjectId' in se ? se.applicationStatus : se.enquiryStatus,
    assignedUser: se.assignedUserId ? getUsersName(se.assignedUserId) : 'Unassigned',
    historyType: 'housingProjectId' in se ? 'Submission' : 'Enquiry'
  }));
}

function updateQueryParams() {
  router.replace({
    name: RouteName.INT_CONTACT_PAGE,
    query: {
      rows: pagination.value.rows ?? undefined,
      order: pagination.value.order ?? undefined,
      field: pagination.value.field ?? undefined,
      page: pagination.value.page ?? undefined,
      tab: route.query.tab ?? 0
    }
  });
}

onMounted(() => {
  // If contactsHistory > largest page option a add page display option to include all items
  if (
    contactsHistory?.length &&
    contactsHistory.length > rowsPerPageOptions.value[rowsPerPageOptions.value.length - 1]
  ) {
    rowsPerPageOptions.value.push(contactsHistory.length);
  }

  // If path query pagination params present, read, else set defaults
  pagination.value.rows = toNumber(route.query.rows as string) ?? 10;
  pagination.value.order = toNumber(route.query.order as string) ?? -1;
  pagination.value.field = (route.query.field as string) ?? 'lastName';
  pagination.value.page = toNumber(route.query.page as string) ?? 0;
});
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :loading="loading"
    :value="normalizeContactHistory()"
    data-key="activityId"
    removable-sort
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="pagination.rows"
    :sort-field="pagination.field"
    :sort-order="pagination.order"
    paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
    current-page-report-template="{first}-{last} of {totalRecords}"
    :rows-per-page-options="rowsPerPageOptions"
    selection-mode="single"
    :first="pagination.page && pagination.rows ? pagination.page * pagination.rows : 0"
    @update:sort-field="
      (newField) => {
        if (newField !== pagination.field) {
          pagination.field = newField;
          pagination.page = 0;
          updateQueryParams();
        }
      }
    "
    @update:sort-order="
      (newOrder) => {
        if (newOrder !== pagination.order) {
          pagination.order = newOrder ?? -1;
          pagination.page = 0;
          updateQueryParams();
        }
      }
    "
    @page="
      (e) => {
        if (e.page !== pagination.page || e.rows !== pagination.rows) {
          pagination.page = e.page;
          pagination.rows = e.rows;
          updateQueryParams();
        }
      }
    "
  >
    <template #empty>
      <div class="flex justify-center">
        <h3>{{ t('contactHistoryList.noItems') }}</h3>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="activityId"
      header="Project ID"
      :sortable="true"
      style="min-width: 150px"
      frozen
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <router-link :to="getRouteToObject(data)">
            {{ data.activityId }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="historyType"
      header="Type"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="submittedAt"
      header="Submitted date"
      :sortable="true"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        {{ formatDate(data?.submittedAt) }}
      </template>
    </Column>
    <Column
      field="assignedUser"
      header="Assigned to"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="state"
      header="State"
      :sortable="true"
      style="min-width: 150px"
    />
  </DataTable>
</template>
