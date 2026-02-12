<script setup lang="ts">
import { isAxiosError } from 'axios';
import { inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import UpdateContactModal from '@/components/contact/UpdateContactModal.vue';
import { Spinner } from '@/components/layout';
import {
  Button,
  Column,
  DataTable,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  useToast,
  useConfirm
} from '@/lib/primevue';
import { contactService } from '@/services';
import { contactRouteNameKey } from '@/utils/keys';
import { toNumber } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Contact, Pagination } from '@/types';

// Props
const { contacts, loading } = defineProps<{
  contacts: Contact[] | undefined;
  loading: boolean;
}>();

// Emits
const emit = defineEmits<{
  contactDeleted: [contact: Contact];
}>();

// Injections
const contactInitiativeRoute = inject(contactRouteNameKey);

// Composables
const { t } = useI18n();
const confirmDialog = useConfirm();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const historyMap: Ref<Record<string, boolean>> = ref({});
const pagination: Ref<Pagination> = ref({
  rows: 10,
  order: -1,
  field: 'lastName',
  page: 0
});
const rowsPerPageOptions: Ref<number[]> = ref([10, 20, 50]);
const selection: Ref<Contact | undefined> = ref(undefined);
const updateContactModalVisible: Ref<boolean> = ref(false);

// Actions
function onDelete(contact: Contact) {
  confirmDialog.require({
    message: t('contactsProponentsList.deleteContactMessage') + contact.firstName + ' ' + contact.lastName,
    header: t('contactsProponentsList.deleteContactHeader'),
    acceptLabel: t('contactsProponentsList.confirm'),
    acceptClass: 'p-button-danger',
    acceptIcon: 'pi pi-trash',
    rejectLabel: t('contactsProponentsList.cancel'),
    rejectIcon: 'pi pi-times',
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        const response = await contactService.deleteContact(contact.contactId);
        if (response.status !== 204) {
          throw new Error();
        }
        toast.success(
          t('contactsProponentsList.deleteContactSuccess'),
          `${contact.firstName} ${contact.lastName} ${t('contactsProponentsList.deleteContactSuccessMessage')}`
        );
        emit('contactDeleted', contact);
      } catch (e) {
        if (isAxiosError(e) || e instanceof Error)
          toast.error(t('contactsProponentsList.deleteContactFailed'), e.message);
      }
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
      page: pagination.value.page ?? undefined
    }
  });
}

onBeforeMount(() => {
  // If contacts > largest page option a add page display option to include all contacts
  const rows = rowsPerPageOptions.value[rowsPerPageOptions.value.length - 1];
  if (contacts?.length && rows && contacts.length > rows) {
    rowsPerPageOptions.value.push(contacts.length);
  }

  // Map out contact history for each contact
  contacts?.forEach(async (contact) => {
    if (contact.activityContact?.length) {
      historyMap.value[contact.contactId] = true;
    } else {
      historyMap.value[contact.contactId] = false;
    }
  });

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
    :filters="filters"
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
      field="firstName"
      :header="t('contactsProponentsList.firstName')"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="lastName"
      :header="t('contactsProponentsList.lastName')"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="email"
      :header="t('contactsProponentsList.email')"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="phoneNumber"
      :header="t('contactsProponentsList.phone')"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      :header="t('contactsProponentsList.action')"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          aria-label="View contact"
          class="p-button-lg p-button-text p-0"
          @click="
            () => {
              router.push({
                name: contactInitiativeRoute,
                params: { contactId: data.contactId }
              });
            }
          "
        >
          <font-awesome-icon icon="fa fa-eye" />
        </Button>
        <Button
          aria-label="Edit contact"
          class="p-button-lg p-button-text p-0"
          :disabled="data.userId"
          @click="
            () => {
              selection = data;
              updateContactModalVisible = true;
            }
          "
        >
          <font-awesome-icon icon="fa fa-pen-to-square" />
        </Button>
        <Button
          aria-label="Delete contact"
          class="p-button-lg p-button-text p-button-danger p-0"
          :disabled="data.userId || historyMap[data.contactId]"
          @click="onDelete(data)"
        >
          <font-awesome-icon icon="fa fa-trash" />
        </Button>
      </template>
    </Column>
    <UpdateContactModal
      v-model:visible="updateContactModalVisible"
      :contact="selection"
    />
  </DataTable>
</template>
