<script setup lang="ts">
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SubmissionListNavigatorElectrification from '@/components/electrification/submission/SubmissionListNavigatorElectrification.vue'; // eslint-disable-line max-len
import SubmissionListNavigatorHousing from '@/components/housing/submission/SubmissionListNavigatorHousing.vue';
import { Spinner } from '@/components/layout';
import {
  Button,
  DataTable,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  Select,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { useAppStore, useAuthZStore } from '@/store';
import { APPLICATION_STATUS_LIST } from '@/utils/constants/housing';
import { Action, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/housing';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { IProjectService } from '@/interfaces/IProjectService';
import type { ElectrificationProject, HousingProject, Pagination } from '@/types';

// Types
type FilterOption = { label: string; statuses: string[] };

// Props
const { submissions } = defineProps<{
  submissions: Array<ElectrificationProject | HousingProject> | undefined;
}>();

// Injections
const projectResource = inject('projectResource') as Resource;
const projectRoute = inject('projectRoute') as RouteName;
const projectService = inject('projectService') as IProjectService;

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
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedAt',
  page: 0
});
const rowsPerPageOptions: Ref<Array<number>> = ref([10, 20, 50]);
const selection: Ref<ElectrificationProject | HousingProject | undefined> = ref(undefined);
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
        const response = (await projectService.createProject()).data;
        if (response?.activityId) {
          router.push({
            name: projectRoute,
            params: { projectId: response.projectId }
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

function onDelete(projectId: string, activityId: string) {
  confirmDialog.require({
    message: 'Please confirm that you want to delete this project',
    header: 'Delete project?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => {
      projectService
        .updateIsDeletedFlag(projectId, true)
        .then(() => {
          emit('submission:delete', projectId, activityId);
          selection.value = undefined;
          toast.success('Project deleted');
        })
        .catch((e: any) => toast.error('Failed to delete project', e.message));
    }
  });
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
    v-model:filters="filters"
    v-model:selection="selection"
    :value="filteredSubmissions"
    data-key="projectId"
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
          v-if="authzStore.can(useAppStore().getInitiative, projectResource, Action.CREATE)"
          label="Create submission"
          type="submit"
          icon="pi pi-plus"
          @click="handleCreateNewActivity"
        />
      </div>
    </template>

    <SubmissionListNavigatorHousing
      v-if="useAppStore().getInitiative === Initiative.HOUSING"
      :on-delete-callback="onDelete"
      :selection="selection"
    />
    <SubmissionListNavigatorElectrification
      v-if="useAppStore().getInitiative === Initiative.ELECTRIFICATION"
      :on-delete-callback="onDelete"
      :selection="selection"
    />
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
