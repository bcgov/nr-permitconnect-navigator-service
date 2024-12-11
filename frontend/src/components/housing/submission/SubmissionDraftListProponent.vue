<script setup lang="ts">
import { ref } from 'vue';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, useConfirm, useToast } from '@/lib/primevue';
import { submissionService } from '@/services';
import { RouteName } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Submission } from '@/types';

// Props
const { loading, drafts } = defineProps<{
  loading: boolean;
  drafts: Array<any> | undefined;
}>();

// Emit
const emit = defineEmits(['submissionDraft:delete']);

// State
const selection: Ref<Submission | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete(draftId: string) {
  confirm.require({
    message: 'Please confirm that you want to delete this draft',
    header: 'Delete draft?',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => {
      submissionService
        .deleteDraft(draftId)
        .then(() => {
          emit('submissionDraft:delete', draftId);
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
    :value="drafts"
    data-key="index"
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="10"
    sort-field="submittedAt"
    :sort-order="-1"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    current-page-report-template="({currentPage} of {totalPages})"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
  >
    <template #empty>
      <div class="flex justify-content-center">
        <p class="font-bold text-xl">Your project submission drafts will be displayed here</p>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="index"
      header="Draft ID"
      :sortable="true"
      frozen
    >
      <template #body="{ data }">
        <div :data-draftId="data.draftId">
          <router-link
            :to="{
              name: RouteName.HOUSING_SUBMISSION_INTAKE,
              query: { draftId: data.draftId }
            }"
          >
            {{ data.index }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="updatedAt"
      header="Last edited"
      :sortable="true"
    >
      <template #body="{ data }">
        {{ formatDate(data?.updatedAt) }}
      </template>
    </Column>
    <Column
      field="action"
      header="Action"
      header-class="header-right"
      class="text-right"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger p-0 pr-3"
          aria-label="Delete draft"
          @click="onDelete(data.draftId)"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
