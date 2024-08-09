<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

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
import { submissionService } from '@/services';
import { useAuthZStore } from '@/store';
import { Action, BasicResponse, Initiative, Resource, RouteName } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Submission } from '@/types';

//Emits
const emit = defineEmits(['submission:delete']);

// Props
type Props = {
  loading: boolean;
  submissions: Array<Submission> | undefined;
};

const props = withDefaults(defineProps<Props>(), {});

// Store
const authzStore = useAuthZStore();

// State
const selection: Ref<Submission | undefined> = ref(undefined);

// Actions
const confirmDialog = useConfirm();
const router = useRouter();
const toast = useToast();

function handleCreateNewActivity() {
  confirmDialog.require({
    header: 'Confirm create submission',
    message: 'Please confirm that you want to create a new submission.',
    accept: async () => {
      try {
        const response = (await submissionService.createSubmission()).data;
        if (response?.activityId) {
          router.push({
            name: RouteName.HOUSING_SUBMISSION,
            query: { activityId: response.activityId, submissionId: response.submissionId }
          });
        }
      } catch (e: any) {
        toast.error('Failed to create new submission', e.message);
      }
    },
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel'
  });
}

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function onDelete(submissionId: string, activityId: string) {
  confirmDialog.require({
    message: 'Please confirm that you want to delete this project',
    header: 'Delete project?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => {
      submissionService
        .updateIsDeletedFlag(submissionId, true)
        .then(() => {
          emit('submission:delete', submissionId, activityId);
          selection.value = undefined;
          toast.success('Project deleted');
        })
        .catch((e: any) => toast.error('Failed to delete project', e.message));
    }
  });
}

function isFinanciallySupported(data: Submission) {
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
</script>

<template>
  <DataTable
    v-model:filters="filters"
    v-model:selection="selection"
    :loading="loading"
    :value="props.submissions"
    data-key="submissionId"
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
      <div class="flex justify-content-between">
        <Button
          v-if="authzStore.can(Initiative.HOUSING, Resource.SUBMISSION, Action.CREATE)"
          label="Create submission"
          type="submit"
          icon="pi pi-plus"
          @click="handleCreateNewActivity"
        />
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
              name: RouteName.HOUSING_SUBMISSION,
              query: { activityId: data.activityId, submissionId: data.submissionId }
            }"
          >
            {{ data.projectName }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="activityId"
      header="Activity"
      :sortable="true"
      style="min-width: 125px"
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
                name: RouteName.HOUSING_SUBMISSION,
                query: { activityId: data.activityId, submissionId: data.submissionId }
              }"
            >
              {{ data.activityId }}
            </router-link>
          </div>
        </div>
      </template>
    </Column>
    <Column
      field="contactFirstName"
      header="First name"
      :sortable="true"
      style="min-width: 150px"
    />
    <Column
      field="contactLastName"
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
      field="queuePriority"
      header="Priority"
      :sortable="true"
      style="min-width: 125px"
    />
    <Column
      field="assignedTo"
      header="Assigned to"
      :sortable="true"
      style="min-width: 200px"
    >
      <template #body="{ data }">
        {{ data.user?.lastName }}{{ data.user?.lastName && data.user?.firstName ? ', ' : '' }}
        {{ data.user?.firstName }}
      </template>
    </Column>
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
          @click="
            onDelete(data.submissionId, data.activityId);
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
