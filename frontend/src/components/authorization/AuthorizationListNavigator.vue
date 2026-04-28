<script setup lang="ts">
import { Mutex } from 'async-mutex';
import { storeToRefs } from 'pinia';
import { inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Column, DataTable, DatePicker, IconField, InputIcon, InputText, Select } from '@/lib/primevue';
import { permitService, sourceSystemKindService } from '@/services';
import { useAppStore, useCodeStore } from '@/store';
import { Initiative } from '@/utils/enums/application';
import { formatDateOnly } from '@/utils/formatters';
import { projectAuthorizationRouteNameKey } from '@/utils/keys';
import { generalErrorHandler } from '@/utils/utils';

import type { DataTableSortEvent } from 'primevue/datatable';
import type { Ref } from 'vue';
import type { Pagination, Permit, PermitTracking, PermitType, SourceSystemKind } from '@/types';

// Injections
const projectAuthorizationRouteName = inject(projectAuthorizationRouteNameKey);

// Composables
const { t } = useI18n();

// Store
const { getInitiative } = storeToRefs(useAppStore());
const codeStore = useCodeStore();
const { codeDisplay } = codeStore;

// State
const authorizationTracking: Ref<PermitTracking | undefined> = ref(undefined);
const authorizationType: Ref<PermitType | undefined> = ref(undefined);
const dateRange: Ref<[Date, Date] | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedDate',
  page: 0
});
const permits: Ref<Permit[]> = ref([]);
const permitTypes: Ref<PermitType[]> = ref([]);
const searchTag: Ref<string | undefined> = ref(undefined);
const selection: Ref<Permit | undefined> = ref(undefined);
const sourceSystemKinds: Ref<SourceSystemKind[]> = ref([]);
const totalRecords: Ref<number> = ref(0);

// Actions
function getLocation(streetAddress: string | undefined, locality: string | undefined, province: string | undefined) {
  return [streetAddress, locality, province].filter((str) => str?.trim()).join(', ');
}

function onSort(event: DataTableSortEvent) {
  pagination.value.field = typeof event.sortField === 'string' ? event.sortField : undefined;
  pagination.value.order = event.sortOrder ?? 1;
  pagination.value.page = 0;
  searchPermits();
}

const searchMutex = new Mutex();
let timeoutId: ReturnType<typeof setTimeout>;

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

onBeforeMount(async () => {
  searchPermits();
  permitTypes.value = (await permitService.getPermitTypes(useAppStore().getInitiative)).data;
  const kinds = (await sourceSystemKindService.getSourceSystemKinds()).data;
  sourceSystemKinds.value = kinds.sort((a: SourceSystemKind, b: SourceSystemKind) =>
    (codeDisplay.SourceSystem[a.sourceSystem] || '').localeCompare(codeDisplay.SourceSystem[b.sourceSystem] || '')
  );
  loading.value = false;
});
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
          <h3>{{ t('common.dataTable.noItems') }}</h3>
        </div>
      </template>
      <template #header>
        <div class="flex justify-between mb-3">
          <div class="grid grid-cols-[2fr_1.5fr_1fr] gap-3">
            <Select
              v-model="authorizationType"
              name="authorizationType"
              :label="t('authorization.common.authorization')"
              :placeholder="t('authorization.common.authorizationType')"
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
        :header="t('authorization.common.authorizationType')"
        style="min-width: 240px"
        frozen
      >
        <template #body="{ data }">
          <div :data-activityId="data.activityId">
            <router-link
              :to="{
                name: projectAuthorizationRouteName,
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
</style>
