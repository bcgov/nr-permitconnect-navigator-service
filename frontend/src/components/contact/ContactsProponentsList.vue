<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import { Column, DataTable, FilterMatchMode, IconField, InputIcon, InputText } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Contact, Pagination } from '@/types';

// Props
const { contacts, loading } = defineProps<{
  contacts: Array<Contact> | undefined;
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
  field: 'lastName',
  page: 0
});
const rowsPerPageOptions: Ref<Array<number>> = ref([10, 20, 50]);
const selection: Ref<Contact | undefined> = ref(undefined);

// Actions
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function updateQueryParams() {
  router.replace({
    name: RouteName.INT_CONTACT,
    query: {
      rows: pagination.value.rows ?? undefined,
      order: pagination.value.order ?? undefined,
      field: pagination.value.field ?? undefined,
      page: pagination.value.page ?? undefined
    }
  });
}

onBeforeMount(() => {
  // If contacts > largest page option a add page display option to include all contacts
  if (contacts?.length && contacts.length > rowsPerPageOptions.value[rowsPerPageOptions.value.length - 1]) {
    rowsPerPageOptions.value.push(contacts.length);
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
    v-model:filters="filters"
    v-model:selection="selection"
    :loading="loading"
    :value="contacts"
    data-key="contactId"
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
        <h3>{{ t('contactsProponentsList.noItems') }}</h3>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <template #header>
      <div class="flex justify-between">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            placeholder="Search"
          />
        </IconField>
      </div>
    </template>

    <Column
      header="Action"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <router-link
          :to="{
            name: RouteName.INT_CONTACT_PAGE,
            params: { contactId: data.contactId }
          }"
        >
          {{ t('contactsProponentsList.contactView') }}
        </router-link>
      </template>
    </Column>
    <Column
      field="firstName"
      header="First name"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="lastName"
      header="Last name"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="email"
      header="Email"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="phoneNumber"
      header="Phone"
      :sortable="true"
      style="min-width: 150px"
    />
  </DataTable>
</template>
