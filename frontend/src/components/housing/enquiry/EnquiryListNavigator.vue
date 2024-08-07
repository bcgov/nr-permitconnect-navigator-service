<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import {
  Button,
  Column,
  DataTable,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { enquiryService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { IntakeStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Enquiry } from '@/types';

// Props
type Props = {
  loading: boolean;
  enquiries: Array<Enquiry> | undefined;
};

const props = withDefaults(defineProps<Props>(), {});

// Emit
const emit = defineEmits(['enquiry:delete']);

// State
const selection: Ref<Enquiry | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete(enquiryId: string, activityId: string) {
  confirm.require({
    message: 'Please confirm that you want to delete this enquiry',
    header: 'Delete enquiry?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
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
</script>

<template>
  <DataTable
    v-model:filters="filters"
    v-model:selection="selection"
    :loading="loading"
    :value="props.enquiries"
    data-key="enquiryId"
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="10"
    sort-field="submittedAt"
    :sort-order="-1"
    paginator-template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink "
    current-page-report-template="{first}-{last} of {totalRecords}"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
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
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            placeholder="Search all"
          />
        </IconField>
      </div>
    </template>
    <Column
      field="activity.activityId"
      header="Activity"
      :sortable="true"
      frozen
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <router-link
            :to="{
              name: RouteName.HOUSING_ENQUIRY,
              query: { activityId: data.activityId, enquiryId: data.enquiryId }
            }"
          >
            {{ data.activityId }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="contactFirstName"
      header="Contact first name"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="contactLastName"
      header="Contact last name"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="contactPhoneNumber"
      header="Contact phone"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="contactEmail"
      header="Contact email"
      :sortable="true"
      style="min-width: 200px"
    />
    <Column
      field="intakeStatus"
      header="Status"
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
</style>
