<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
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
import { enquiryService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { APPLICATION_STATUS_LIST } from '@/utils/constants/projectCommon';
import { Action, Resource } from '@/utils/enums/application';
import { ApplicationStatus, IntakeStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { enquiryRouteNameKey } from '@/utils/keys';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Enquiry, Pagination } from '@/types';

// Types
type FilterOption = { label: string; statuses: string[] };

// Props
const { enquiries } = defineProps<{
  enquiries: Array<Enquiry> | undefined;
}>();

// Injections
const enquiryRouteName = inject(enquiryRouteNameKey);

// Composables
const { t } = useI18n();
const confirm = useConfirm();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// Constants
const FILTER_OPTIONS: Array<FilterOption> = [
  {
    label: 'Active enquiries',
    statuses: [ApplicationStatus.NEW, ApplicationStatus.IN_PROGRESS, ApplicationStatus.DELAYED]
  },
  { label: 'Completed enquiries', statuses: [ApplicationStatus.COMPLETED] },
  { label: 'All enquiries', statuses: APPLICATION_STATUS_LIST }
];

// Emit
const emit = defineEmits(['enquiry:delete']);

// Store
const appStore = useAppStore();
const authzStore = useAuthZStore();

// State
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'submittedAt',
  page: 0
});
const selection: Ref<Enquiry | undefined> = ref(undefined);
const selectedFilter: Ref<FilterOption> = ref(FILTER_OPTIONS[0]);

const filteredEnquiries = computed(() => {
  return enquiries?.filter((element) => {
    return selectedFilter.value.statuses.includes(element.enquiryStatus);
  });
});

// read from query params if tab is set to enquiry otherwise use default values
if (route.query.tab === '1') {
  pagination.value.rows = toNumber(route.query.rows as string) ?? 10;
  pagination.value.order = toNumber(route.query.order as string) ?? -1;
  pagination.value.field = (route.query.field as string) ?? 'submittedAt';
  pagination.value.page = toNumber(route.query.page as string) ?? 0;
}

// Actions
function handleCreateNewActivity() {
  confirm.require({
    header: t('enquiryListNavigator.confirmCreateHeader'),
    message: t('enquiryListNavigator.confirmCreateMsg'),
    accept: async () => {
      try {
        const response = (await enquiryService.createEnquiry()).data;
        if (response?.activityId) {
          router.push({
            name: enquiryRouteName,
            params: { enquiryId: response.enquiryId }
          });
        }
      } catch (e: any) {
        toast.error(t('enquiryListNavigator.failedSubmission'), e.message);
      }
    },
    acceptLabel: t('enquiryListNavigator.confirm'),
    rejectProps: { outlined: true },
    rejectLabel: t('enquiryListNavigator.cancel')
  });
}

function onDelete(enquiryId: string, activityId: string) {
  confirm.require({
    message: 'Please confirm that you want to delete this enquiry',
    header: 'Delete enquiry?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: () => {
      enquiryService
        .updateIsDeletedFlag(enquiryId, true)
        .then(() => {
          emit('enquiry:delete', enquiryId, activityId);
          selection.value = undefined;
          toast.success('Enquiry deleted');
        })
        .catch((e: any) => toast.error('Failed to delete enquiry', e.message));
    }
  });
}

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Actions
function updateQueryParams() {
  router.replace({
    name: router.currentRoute.value.name,
    query: {
      rows: pagination.value.rows ?? undefined,
      order: pagination.value.order ?? undefined,
      field: pagination.value.field ?? undefined,
      page: pagination.value.page ?? undefined,
      tab: route.query.tab ?? 1
    }
  });
}
</script>

<template>
  <DataTable
    v-model:filters="filters"
    v-model:selection="selection"
    :value="filteredEnquiries"
    data-key="enquiryId"
    removable-sort
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="pagination.rows"
    :sort-field="pagination.field"
    :sort-order="pagination.order"
    paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
    current-page-report-template="{first}-{last} of {totalRecords}"
    :rows-per-page-options="[10, 20, 50]"
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
          v-if="authzStore.can(appStore.getInitiative, Resource.ENQUIRY, Action.CREATE)"
          label="Create submission"
          type="submit"
          icon="pi pi-plus"
          @click="handleCreateNewActivity"
        />
      </div>
    </template>
    <Column
      field="activityId"
      header="Enquiry ID"
      :sortable="true"
      style="min-width: 136px"
      frozen
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <router-link
            :to="{
              name: enquiryRouteName,
              params: { enquiryId: data.enquiryId }
            }"
          >
            {{ data.activityId }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="activity.activityContact.0.contact.firstName"
      header="Contact first name"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="activity.activityContact.0.contact.lastName"
      header="Contact last name"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="activity.activityContact.0.contact.phoneNumber"
      header="Contact phone"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="activity.activityContact.0.contact.email"
      header="Contact email"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="enquiryStatus"
      header="Enquiry state"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="updatedAt"
      header="Last edited"
      :sortable="true"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        {{ formatDate(data?.updatedAt) }}
      </template>
    </Column>
    <Column
      field="submittedAt"
      header="Submitted date"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ data.intakeStatus !== IntakeStatus.DRAFT ? formatDate(data?.submittedAt) : undefined }}
      </template>
    </Column>
    <Column
      field="action"
      header="Action"
      class="text-center header-center"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0"
          aria-label="Delete enquiry"
          :disabled="!useAuthZStore().can(appStore.getInitiative, Resource.ENQUIRY, Action.DELETE)"
          @click="
            onDelete(data.enquiryId, data.activityId);
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
