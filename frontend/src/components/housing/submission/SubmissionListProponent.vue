<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, useConfirm, useToast } from '@/lib/primevue';
import { submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { IntakeStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Submission } from '@/types';

// Props
type Props = {
  loading: boolean;
  submissions: Array<Submission> | undefined;
};

const props = withDefaults(defineProps<Props>(), {});

// Emit
const emit = defineEmits(['submission:delete']);

// State
const selection: Ref<Submission | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete(submissionId: string) {
  confirm.require({
    message: 'Please confirm that you want to delete this draft',
    header: 'Delete draft?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => {
      submissionService
        .deleteSubmission(submissionId)
        .then(() => {
          emit('submission:delete', submissionId);
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
    <Column
      field="activity.activityId"
      header="Confirmation ID"
      :sortable="true"
      frozen
    >
      <template #body="{ data }">
        <div :data-activityId="data.activityId">
          <router-link
            :to="{
              name: RouteName.HOUSING_SUBMISSION_INTAKE,
              query: { activityId: data.activityId, submissionId: data.submissionId }
            }"
          >
            {{ data.activityId }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="projectName"
      header="Project Name"
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
      header-class="header-right"
      class="text-right"
      style="min-width: 150px"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0 pr-3"
          aria-label="Delete draft"
          :disabled="data.intakeStatus !== IntakeStatus.DRAFT"
          @click="onDelete(data.submissionId)"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
