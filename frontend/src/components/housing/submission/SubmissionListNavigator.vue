<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import {
  Button,
  Column,
  DataTable,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  Select,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { housingProjectService } from '@/services';
import { useAuthZStore } from '@/store';
import { APPLICATION_STATUS_LIST } from '@/utils/constants/housing';
import { Action, BasicResponse, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Pagination, HousingProject } from '@/types';

// Types
type FilterOption = { label: string; statuses: string[] };

// Props
const { loading, submissions } = defineProps<{
  loading: boolean;
  submissions: Array<HousingProject> | undefined;
}>();

// Composables
const confirmDialog = useConfirm();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// Constants
const FILTER_OPTIONS: Array<FilterOption> = [
  {
    label: 'Active projects',
    statuses: [ApplicationStatus.NEW, ApplicationStatus.IN_PROGRESS, ApplicationStatus.DELAYED]
  },
  { label: 'Completed projects', statuses: [ApplicationStatus.COMPLETED] },
  { label: 'All projects', statuses: APPLICATION_STATUS_LIST }
];

// Emits
const emit = defineEmits(['submission:delete']);

// Store
const authzStore = useAuthZStore();

// State
const dataTable = ref(null);
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedAt',
  page: 0
});
const rowsPerPageOptions: Ref<Array<number>> = ref([10, 20, 50]);
const selection: Ref<HousingProject | undefined> = ref(undefined);
const selectedFilter: Ref<FilterOption> = ref(FILTER_OPTIONS[0]);

const filteredSubmissions = computed(() => {
  return submissions?.filter((element) => {
    return selectedFilter.value.statuses.includes(element.applicationStatus);
  });
});

// read from query params if tab is set to enquiry otherwise use default values
if (!route.query.tab || route.query.tab === '0') {
  pagination.value.rows = toNumber(route.query.rows as string) ?? 10;
  pagination.value.order = toNumber(route.query.order as string) ?? -1;
  pagination.value.field = (route.query.field as string) ?? 'submittedAt';
  pagination.value.page = toNumber(route.query.page as string) ?? 0;
}

// Actions
function handleCreateNewActivity() {
  confirmDialog.require({
    header: 'Confirm create submission',
    message: 'Please confirm that you want to create a new submission.',
    accept: async () => {
      try {
        const response = (await housingProjectService.createHousingProject()).data;
        if (response?.activityId) {
          router.push({
            name: RouteName.INT_HOUSING_PROJECT,
            params: { housingProjectId: response.housingProjectId }
          });
        }
      } catch (e: any) {
        toast.error('Failed to create new submission', e.message);
      }
    },
    acceptLabel: 'Confirm',
    rejectProps: { outlined: true },
    rejectLabel: 'Cancel'
  });
}

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function onDelete(housingProjectId: string, activityId: string) {
  confirmDialog.require({
    message: 'Please confirm that you want to delete this project',
    header: 'Delete project?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => {
      housingProjectService
        .updateIsDeletedFlag(housingProjectId, true)
        .then(() => {
          emit('submission:delete', housingProjectId, activityId);
          selection.value = undefined;
          toast.success('Project deleted');
        })
        .catch((e: any) => toast.error('Failed to delete project', e.message));
    }
  });
}

function isFinanciallySupported(data: HousingProject) {
  if (
    data.financiallySupportedBC === BasicResponse.YES ||
    data.financiallySupportedHousingCoop === BasicResponse.YES ||
    data.financiallySupportedIndigenous === BasicResponse.YES ||
    data.financiallySupportedNonProfit === BasicResponse.YES
  ) {
    return BasicResponse.YES;
  } else {
    return BasicResponse.NO;
  }
}

function updateQueryParams() {
  router.replace({
    name: RouteName.INT_HOUSING,
    query: {
      rows: pagination.value.rows ?? undefined,
      order: pagination.value.order ?? undefined,
      field: pagination.value.field ?? undefined,
      page: pagination.value.page ?? undefined,
      tab: route.query.tab ?? 0
    }
  });
}

onBeforeMount(() => {
  if (submissions?.length && submissions.length > rowsPerPageOptions.value[rowsPerPageOptions.value.length - 1]) {
    rowsPerPageOptions.value.push(submissions.length);
  }
});
</script>

<template>
  <DataTable
    ref="dataTable"
    v-model:filters="filters"
    v-model:selection="selection"
    :loading="loading"
    :value="filteredSubmissions"
    data-key="housingProjectId"
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
      (e) => {
        pagination.field = e;
        pagination.page = 0;
        updateQueryParams();
      }
    "
    @update:sort-order="
      (e) => {
        pagination.order = e ?? -1;
        pagination.page = 0;
        updateQueryParams();
      }
    "
    @page="
      (e) => {
        pagination.page = e.page;
        pagination.rows = e.rows;
        updateQueryParams();
      }
    "
  >
    <template #empty>
      <div class="flex justify-center">
        <h3>No items found.</h3>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <template #header>
      <div class="flex justify-between mb-3">
        <div class="grid grid-cols-2 gap-3">
          <Select
            v-model="selectedFilter"
            class="col-span-1"
            :options="FILTER_OPTIONS"
            option-label="label"
          />
          <IconField
            class="col-span-1"
            icon-position="left"
          >
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              class="h-full"
              placeholder="Search"
            />
          </IconField>
        </div>
        <Button
          v-if="authzStore.can(Initiative.HOUSING, Resource.HOUSING_PROJECT, Action.CREATE)"
          label="Create submission"
          type="submit"
          icon="pi pi-plus"
          @click="handleCreateNewActivity"
        />
      </div>
    </template>
    <Column
      field="projectName"
      header="Project name"
      :sortable="true"
      style="min-width: 200px"
      frozen
    >
      <template #body="{ data }">
        <div :data-projectName="data.projectName">
          <router-link
            :to="{
              name: RouteName.INT_HOUSING_PROJECT,
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
      header="Project ID"
      :sortable="true"
      style="min-width: 133px"
      frozen
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <div v-if="data.projectName">
            {{ data.activityId }}
          </div>
          <div v-else>
            <router-link
              :to="{
                name: RouteName.INT_HOUSING_PROJECT,
                params: { housingProjectId: data.housingProjectId }
              }"
            >
              {{ data.activityId }}
            </router-link>
          </div>
        </div>
      </template>
    </Column>
    <Column
      field="contacts.0.firstName"
      header="First name"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="contacts.0.lastName"
      header="Last name"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="companyNameRegistered"
      header="Company"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="streetAddress"
      header="Location address"
      :sortable="true"
      style="min-width: 250px"
    >
      <template #body="{ data }">
        {{ [data.streetAddress, data.locality, data.province].filter((str) => str?.trim()).join(', ') }}
      </template>
    </Column>
    <Column
      field="submittedAt"
      header="Submitted date"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ formatDate(data?.submittedAt) }}
      </template>
    </Column>
    <Column
      field="submissionType"
      header="Submission type"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="queuePriority"
      header="Priority"
      :sortable="true"
      style="min-width: 125px"
    />
    <Column
      field="multiPermitsNeeded"
      header="Multi-authorization project"
      :sortable="true"
      style="min-width: 125px"
    />
    <Column
      field="user.fullName"
      header="Assigned to"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="hasRelatedEnquiry"
      header="Related enquiry"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ data.hasRelatedEnquiry ? BasicResponse.YES : BasicResponse.NO }}
      </template>
    </Column>
    <Column
      field="singleFamilyUnits"
      header="Single family units"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="multiFamilyUnits"
      header="Multi family units"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="otherUnitsDescription"
      header="Other type"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="otherUnits"
      header="Other type units"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="hasRentalUnits"
      header="Rental"
      :sortable="true"
      style="min-width: 125px"
    />
    <Column
      field="rentalUnits"
      header="Rental units"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="financiallySupported"
      header="Financially supported"
      :sortable="true"
      style="min-width: 225px"
    >
      <template #body="{ data }">
        {{ isFinanciallySupported(data) }}
      </template>
    </Column>
    <Column
      field="naturalDisaster"
      header="Affected by natural disaster"
      :sortable="true"
      style="min-width: 275px"
    />
    <Column
      field="action"
      header="Action"
      class="text-center header-center"
      style="min-width: 75px"
      frozen
      align-frozen="right"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          aria-label="Delete submission"
          :disabled="!useAuthZStore().can(Initiative.HOUSING, Resource.HOUSING_PROJECT, Action.DELETE)"
          @click="
            onDelete(data.housingProjectId, data.activityId);
            selection = data;
          "
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
<style scoped lang="scss">
:deep(.header-center .p-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-header) {
  padding-right: 0;
  padding-left: 0;
}
</style>
