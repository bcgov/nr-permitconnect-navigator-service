<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, useConfirm, useToast } from '@/lib/primevue';
import { enquiryService } from '@/services';
import { RouteNames } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Enquiry } from '@/types';
import { INTAKE_STATUS_LIST } from '@/utils/enums';

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

function onDelete(enquiryId: string) {
  confirm.require({
    message: 'Please confirm that you want to delete this draft',
    header: 'Delete draft?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => {
      enquiryService
        .deleteEnquiry(enquiryId)
        .then(() => {
          emit('enquiry:delete', enquiryId);
          toast.success('Draft deleted');
        })
        .catch((e: any) => toast.error('Failed to delete draft', e.message));
    }
  });
}
</script>

<template>
  <DataTable
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
              name: RouteNames.HOUSING_ENQUIRY,
              query: { activityId: data.activityId, enquiryId: data.enquiryId }
            }"
          >
            {{ data.activityId }}
          </router-link>
        </div>
      </template>
    </Column>
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
        {{ data.intakeStatus !== INTAKE_STATUS_LIST.DRAFT ? formatDate(data?.submittedAt) : undefined }}
      </template>
    </Column>
    <Column
      field="action"
      header="Action"
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0 pr-3"
          aria-label="Delete draft"
          :disabled="data.intakeStatus !== INTAKE_STATUS_LIST.DRAFT"
          @click="onDelete(data.enquiryId)"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
