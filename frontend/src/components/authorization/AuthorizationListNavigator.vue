<script setup lang="ts">
import { Mutex } from 'async-mutex';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { Column, DataTable, DatePicker, IconField, InputIcon, InputText, Select } from '@/lib/primevue';
import { permitService, sourceSystemKindService } from '@/services';
import { useAppStore, useCodeStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { formatDateOnly } from '@/utils/formatters';
import { generalErrorHandler, toNumber } from '@/utils/utils';

import type { DataTableSortEvent } from 'primevue/datatable';
import type { Ref } from 'vue';
import type { Pagination, Permit, PermitTracking, PermitType, SourceSystemKind } from '@/types';

// Interfaces
interface InitiativeState {
  projectAuthorizationRouteName: RouteName;
}

// Composables
const { t } = useI18n();
const route = useRoute();

// Constants
const AUTHORIZATION_TAB_INDEX = 1;
const ELECTRIFICATION_INITIATIVE_STATE: InitiativeState = {
  projectAuthorizationRouteName: RouteName.INT_ELECTRIFICATION_PROJECT_AUTHORIZATION
};

const GENERAL_INITIATIVE_STATE: InitiativeState = {
  projectAuthorizationRouteName: RouteName.INT_GENERAL_PROJECT_AUTHORIZATION
};

const HOUSING_INITIATIVE_STATE: InitiativeState = {
  projectAuthorizationRouteName: RouteName.INT_HOUSING_PROJECT_AUTHORIZATION
};

// Store
const { getInitiative } = storeToRefs(useAppStore());
const codeStore = useCodeStore();
const { codeDisplay } = codeStore;

// State
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedDate',
  page: 0
});

const loading: Ref<boolean> = ref(true);
const initiativeState: Ref<InitiativeState> = ref(HOUSING_INITIATIVE_STATE);
const dateRange: Ref<[Date, Date] | undefined> = ref(undefined);
const selection: Ref<Permit | undefined> = ref(undefined);
const permits: Ref<Permit[]> = ref([]);
const permitTypes: Ref<PermitType[]> = ref([]);
const sourceSystemKinds: Ref<SourceSystemKind[]> = ref([]);
const authorizationType: Ref<PermitType | undefined> = ref(undefined);
const authorizationTracking: Ref<PermitTracking | undefined> = ref(undefined);
const searchTag: Ref<string | undefined> = ref(undefined);
const totalRecords: Ref<number> = ref(0);

// read from query params if tab is set to enquiry otherwise use default values
if (route.query.tab === AUTHORIZATION_TAB_INDEX.toString()) {
  pagination.value.rows = toNumber(route.query.rows as string) ?? 10;
  pagination.value.order = toNumber(route.query.order as string) ?? -1;
  pagination.value.field = (route.query.field as string) ?? 'submittedAt';
  pagination.value.page = toNumber(route.query.page as string) ?? 0;
}

// Actions
onBeforeMount(async () => {
  switch (getInitiative.value) {
    case Initiative.ELECTRIFICATION:
      initiativeState.value = ELECTRIFICATION_INITIATIVE_STATE;
      break;
    case Initiative.GENERAL:
      initiativeState.value = GENERAL_INITIATIVE_STATE;
      break;
    case Initiative.HOUSING:
      initiativeState.value = HOUSING_INITIATIVE_STATE;
      break;
    default:
      generalErrorHandler(t('views.initiativeStateError'));
  }
  searchPermits();
  permitTypes.value = (await permitService.getPermitTypes(useAppStore().getInitiative)).data;
  const kinds = (await sourceSystemKindService.getSourceSystemKinds()).data;
  sourceSystemKinds.value = kinds.sort((a: SourceSystemKind, b: SourceSystemKind) =>
    (codeDisplay.SourceSystem[a.sourceSystem] || '').localeCompare(codeDisplay.SourceSystem[b.sourceSystem] || '')
  );
  loading.value = false;
});

function getLocation(streetAddress: string | undefined, locality: string | undefined, province: string | undefined) {
  return [streetAddress, locality, province].filter((str) => str?.trim()).join(', ');
}

function onSort(event: DataTableSortEvent) {
  pagination.value.field = typeof event.sortField === 'string' ? event.sortField : '';
  pagination.value.order = event.sortOrder ?? 1;
  pagination.value.page = 0;
  searchPermits();
}

const searchMutex = new Mutex();
let timeoutId: ReturnType<typeof setTimeout>;

// Actions
async function searchPermits() {
  if (!authorizationType.value) authorizationTracking.value = undefined;
  searchTag.value = searchTag?.value?.trim();
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    await searchMutex.runExclusive(async () => {
      try {
        loading.value = true;
        permitService
          .searchPermits({
            dateRange: dateRange.value,
            permitTypeId: authorizationType.value?.permitTypeId,
            sourceSystemKindId: authorizationTracking.value?.sourceSystemKindId,
            searchTag: searchTag.value?.trim() ? searchTag.value.trim() : undefined,
            skip: pagination.value.page && pagination.value.rows ? pagination.value.page * pagination.value.rows : 0,
            take: pagination.value.rows,
            sortField: pagination.value.field,
            sortOrder: pagination.value.order
          })
          .then((res) => {
            permits.value = res.data.permits;
            totalRecords.value = res.data.totalRecords;
          })
          .finally(() => {
            loading.value = false;
          });
      } catch (e) {
        generalErrorHandler(e);
      }
    });
  }, 500);
}

function shouldDisplayLocation() {
  return getInitiative.value !== Initiative.ELECTRIFICATION;
}
</script>

<template>
  <div>
    <DataTable
      v-model:selection="selection"
      lazy
      :value="permits"
      data-key="permitId"
      removable-sort
      :loading="loading"
      loading-icon="pi pi-spinner pi-spin"
      scrollable
      responsive-layout="scroll"
      :paginator="true"
      :rows="pagination.rows"
      :total-records="totalRecords"
      :sort-field="pagination.field"
      :sort-order="pagination.order"
      paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
      current-page-report-template="{first}-{last} of {totalRecords}"
      :rows-per-page-options="[10, 20, 50]"
      selection-mode="single"
      :first="pagination.page && pagination.rows ? pagination.page * pagination.rows : 0"
      @sort="onSort"
      @page="
        (e) => {
          pagination.page = e.page;
          pagination.rows = e.rows;
          searchPermits();
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
          <div class="grid grid-cols-[2fr_1.5fr_1fr] gap-3">
            <Select
              v-model="authorizationType"
              name="authorizationType"
              :label="t('authorization.common.authorization')"
              placeholder="Authorization type"
              :options="permitTypes"
              :option-label="(e) => `${e.businessDomain}: ${e.name}`"
              show-clear
              @change="searchPermits"
            />
            <Select
              v-model="authorizationTracking"
              :placeholder="t('authorization.common.selectId')"
              :options="
                authorizationType
                  ? sourceSystemKinds.filter((ssk) => ssk.permitTypeIds.includes(authorizationType!.permitTypeId))
                  : undefined
              "
              :option-label="(e) => `${e.description}, ${codeDisplay.SourceSystem[e.sourceSystem]}`"
              :disabled="!authorizationType"
              show-clear
              @change="searchPermits"
            />

            <DatePicker
              v-model="dateRange"
              :placeholder="t('authorization.authorizationListNavigator.dateRange')"
              selection-mode="range"
              :max-date="new Date()"
              hide-on-range-selection
              show-clear
              @value-change="searchPermits()"
            />
          </div>
          <div>
            <IconField
              class="col-span-1"
              icon-position="left"
            >
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchTag"
                class="h-full"
                :placeholder="t('authorization.common.search')"
                @update:model-value="searchPermits"
              />
            </IconField>
          </div>
        </div>
      </template>
      <Column
        field="authorizationType"
        header="Authorization Type"
        style="min-width: 240px"
        frozen
      >
        <template #body="{ data }">
          <div :data-activityId="data.activityId">
            <router-link
              :to="{
                name: initiativeState.projectAuthorizationRouteName,
                params: { permitId: data.permitId, projectId: data.activity.project?.[0]?.projectId }
              }"
            >
              {{ data.permitType.businessDomain }} : {{ data.permitType.name }}
            </router-link>
          </div>
        </template>
      </Column>
      <Column
        field="submittedDate"
        :header="t('authorization.common.submittedDate')"
        :sortable="true"
        style="min-width: 150px"
      >
        <template #body="{ data }">
          {{ formatDateOnly(data?.submittedDate) }}
        </template>
      </Column>

      <Column
        field="state"
        :header="t('authorization.authorizationListNavigator.applicationStatus')"
        :sortable="true"
        style="min-width: 200px"
      />
      <Column
        field="stage"
        :header="t('authorization.common.applicationStage')"
        :sortable="true"
        style="min-width: 200px"
      />
      <Column
        field="statusLastChanged"
        :header="t('authorization.common.statusChangeDate')"
        :sortable="true"
        style="min-width: 200px"
      >
        <template #body="{ data }">
          {{ formatDateOnly(data?.statusLastChanged) }}
        </template>
      </Column>
      <Column
        field="decisionDate"
        :header="t('authorization.common.decisionDate')"
        :sortable="true"
        style="min-width: 170px"
      >
        <template #body="{ data }">
          {{ formatDateOnly(data?.decisionDate) }}
        </template>
      </Column>
      <Column
        field="projectName"
        :header="t('authorization.common.projectName')"
        style="min-width: 150px"
      >
        <template #body="{ data }">
          {{ data.activity.project?.[0]?.projectName }}
        </template>
      </Column>
      <Column
        field="activityId"
        :header="t('authorization.common.projectId')"
        style="min-width: 120px"
      >
        <template #body="{ data }">
          {{ data.activity.project?.[0]?.activityId }}
        </template>
      </Column>
      <Column
        field="companyNameRegistered"
        :header="t('authorization.common.company')"
        style="min-width: 200px"
      >
        <template #body="{ data }">
          {{ data.activity.project?.[0]?.companyNameRegistered }}
        </template>
      </Column>
      <Column
        v-if="shouldDisplayLocation()"
        field="location"
        :header="t('authorization.common.location')"
        style="min-width: 150px"
      >
        <template #body="{ data }">
          {{
            getLocation(
              data.activity.project?.[0]?.streetAddress,
              data.activity.project?.[0]?.locality,
              data.activity.project?.[0]?.province
            )
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<style scoped lang="scss">
:deep(.header-center .p-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-header) {
  padding-right: 0;
  padding-left: 0;
}

:deep(.p-datatable-loading-icon) {
  color: var(--p-bcblue-800);
}
</style>
