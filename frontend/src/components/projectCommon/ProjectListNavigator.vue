<script setup lang="ts">
import { Mutex } from 'async-mutex';
import { isAxiosError } from 'axios';
import { computed, inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProjectListNavigatorElectrification from '@/components/electrification/project/ProjectListNavigatorElectrification.vue';
import ProjectListNavigatorGeneral from '@/components/general/project/ProjectListNavigatorGeneral.vue';
import ProjectListNavigatorHousing from '@/components/housing/project/ProjectListNavigatorHousing.vue';
import {
  Button,
  DataTable,
  DatePicker,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  Select,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { useAppStore, useAuthZStore } from '@/store';
import { APPLICATION_STATUS_LIST } from '@/utils/constants/projectCommon';
import { Action, Initiative } from '@/utils/enums/application';
import { ActivityContactRole, ApplicationStatus } from '@/utils/enums/projectCommon';
import { projectRouteNameKey, projectServiceKey, resourceKey } from '@/utils/keys';
import { generalErrorHandler, toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { ActivityContact, Pagination, Project, ProjectService, SearchProjectsResponse } from '@/types';

// Types
interface FilterOption {
  label: string;
  statuses: string[];
}

// Injections
const projectResource = inject(resourceKey);
const projectRoute = inject(projectRouteNameKey);
const projectService = inject<Ref<ProjectService<Project>>>(projectServiceKey);

// Composables
const confirmDialog = useConfirm();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

// Constants
const FILTER_OPTIONS: readonly FilterOption[] = [
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
const dateRange: Ref<[Date, Date] | undefined> = ref(undefined);
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedAt',
  page: 0
});
const rowsPerPageOptions: Ref<number[]> = ref([10, 20, 50]);
const selection: Ref<Project | undefined> = ref(undefined);
const applicationStatus: Ref<FilterOption> = ref(FILTER_OPTIONS[0]!);
const loading: Ref<boolean> = ref(true);
const searchResponse: Ref<SearchProjectsResponse> = ref({ projects: [], totalRecords: 0 });
const searchTag: Ref<string | undefined> = ref(undefined);

/**
 * Filter projects based on status and reduce contacts to primary contact only
 * Inject a joined location field for housing for proper sorting and searching
 */
const filteredProjects = computed(() => {
  return searchResponse?.value?.projects?.map((x) => {
    const primaryContact = x.activity?.activityContact?.find(
      (contact: ActivityContact) => contact.role === ActivityContactRole.PRIMARY
    );

    if ('housingProjectId' in x || 'generalProjectId' in x) {
      return {
        ...x,
        location: [x.streetAddress, x.locality, x.province].filter((str) => str?.trim()).join(', '),
        activity: {
          ...x.activity,
          activityContact: primaryContact ? [primaryContact] : []
        }
      };
    } else
      return {
        ...x,
        activity: {
          ...x.activity,
          activityContact: primaryContact ? [primaryContact] : []
        }
      };
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
        if (!projectService) throw new Error('No service');

        const response = await projectService.value.createProject({});
        if (response?.activityId) {
          router.push({
            name: projectRoute?.value,
            params: { projectId: response.projectId }
          });
        }
      } catch (e) {
        if (isAxiosError(e) || e instanceof Error) toast.error('Failed to create new submission', e.message);
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
      projectService?.value
        ?.deleteProject({ projectId })
        .then(() => {
          emit('submission:delete', projectId, activityId);
          selection.value = undefined;
          toast.success('Project deleted');
        })
        .catch((e: Error) => toast.error('Failed to delete project', e.message));
    }
  });
}

function updateQueryParams() {
  router.replace({
    name: router.currentRoute.value.name,
    query: {
      rows: pagination.value.rows ?? undefined,
      order: pagination.value.order ?? undefined,
      field: pagination.value.field ?? undefined,
      page: pagination.value.page ?? undefined,
      tab: route.query.tab ?? 0
    }
  });
}

const searchMutex = new Mutex();
let timeoutId: ReturnType<typeof setTimeout>;

async function searchProjects() {
  searchTag.value = searchTag?.value?.trim();
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    await searchMutex.runExclusive(async () => {
      try {
        loading.value = true;
        const res = await projectService?.value.searchProjects({
          applicationStatus: applicationStatus.value ? applicationStatus.value.statuses : undefined,
          dateRange: dateRange.value,
          searchTag: searchTag.value?.trim() ? searchTag.value.trim() : undefined,
          skip: (pagination.value.page && pagination.value.rows
            ? pagination.value.page * pagination.value.rows
            : 0
          ).toString(),
          take: pagination.value.rows?.toString(),
          sortField: pagination.value.field,
          sortOrder: pagination.value.order?.toString()
        });
        if (res) searchResponse.value = res;
      } catch (e) {
        generalErrorHandler(e, undefined, undefined, toast);
      } finally {
        loading.value = false;
      }
    });
  }, 500);
}

function onDateRangeChange(value: Date | Date[] | (Date | null)[] | null | undefined) {
  // range selection emits after the first date too; only search once both dates (or a clear) are set
  if (!value || (Array.isArray(value) && value[0] && value[1])) searchProjects();
}

onBeforeMount(() => {
  searchProjects();
});
</script>
<template>
  <DataTable
    v-model:filters="filters"
    v-model:selection="selection"
    lazy
    data-key="projectId"
    :value="filteredProjects"
    :loading="loading"
    loading-icon="pi pi-spinner pi-spin"
    removable-sort
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="pagination.rows"
    :total-records="searchResponse.totalRecords"
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
        searchProjects();
      }
    "
    @update:sort-order="
      (e) => {
        pagination.order = e ?? -1;
        pagination.page = 0;
        updateQueryParams();
        searchProjects();
      }
    "
    @page="
      (e) => {
        pagination.page = e.page;
        pagination.rows = e.rows;
        updateQueryParams();
        searchProjects();
      }
    "
  >
    <template #empty>
      <div class="flex justify-center">
        <h3>No items found.</h3>
      </div>
    </template>
    <template #header>
      <div class="flex justify-between mb-3">
        <div class="grid grid-cols-3 gap-3">
          <Select
            v-model="applicationStatus"
            class="col-span-1"
            :options="FILTER_OPTIONS as FilterOption[]"
            option-label="label"
            @change="searchProjects"
          />
          <IconField
            class="col-span-1"
            icon-position="left"
          >
            <InputIcon class="pi pi-search" />
            <InputText
              id="searchTag"
              v-model="searchTag"
              class="h-full"
              :placeholder="t('authorization.common.search')"
              @update:model-value="searchProjects"
            />
          </IconField>
          <DatePicker
            v-model="dateRange"
            :placeholder="t('authorization.authorizationListNavigator.dateRange')"
            selection-mode="range"
            :max-date="new Date()"
            hide-on-range-selection
            show-clear
            @value-change="onDateRangeChange"
          />
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

    <ProjectListNavigatorHousing
      v-if="useAppStore().getInitiative === Initiative.HOUSING"
      :on-delete-callback="onDelete"
      :selection="selection"
    />
    <ProjectListNavigatorGeneral
      v-if="useAppStore().getInitiative === Initiative.GENERAL"
      :on-delete-callback="onDelete"
      :selection="selection"
    />
    <ProjectListNavigatorElectrification
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
