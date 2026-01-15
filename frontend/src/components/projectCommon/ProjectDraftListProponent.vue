<script setup lang="ts">
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Button, Column, DataTable, useConfirm, useToast } from '@/lib/primevue';
import { formatDate } from '@/utils/formatters';
import { draftableProjectServiceKey, projectRouteNameKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { ElectrificationProject, HousingProject } from '@/types';

// Props
const { loading, drafts } = defineProps<{
  loading: boolean;
  drafts: Array<any> | undefined;
}>();

// Injections
const projectRoute = inject(projectRouteNameKey);
const projectService = inject(draftableProjectServiceKey);

// Emit
const emit = defineEmits(['submissionDraft:delete']);

// State
const selection: Ref<ElectrificationProject | HousingProject | undefined> = ref(undefined);

// Actions
const confirm = useConfirm();
const { t } = useI18n();
const toast = useToast();

function onDelete(draftId: string) {
  confirm.require({
    message: t('submissionDraftListProponent.deleteMsg'),
    header: t('submissionDraftListProponent.deleteHeader'),
    acceptLabel: t('submissionDraftListProponent.confirm'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('submissionDraftListProponent.cancel'),
    rejectProps: { outlined: true },
    accept: () => {
      if (!projectService?.value) throw new Error('No service');
      projectService.value
        .deleteDraft(draftId)
        .then(() => {
          emit('submissionDraft:delete', draftId);
          toast.success(t('submissionDraftListProponent.deleteSuccess'));
        })
        .catch((e: any) => toast.error(t('submissionDraftListProponent.deleteFailed'), e.message));
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
    removable-sort
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="5"
    sort-field="submittedAt"
    :sort-order="-1"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    :current-page-report-template="`({currentPage} ${t('submissionDraftListProponent.of')} {totalPages})`"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
    :alt="t('submissionDraftListProponent.tableAlt')"
  >
    <template #empty>
      <div class="flex justify-center">
        <p class="font-bold">{{ t('submissionDraftListProponent.listEmpty') }}</p>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="index"
      :header="t('submissionDraftListProponent.draftId')"
      :sortable="true"
      style="width: 45%"
    >
      <template #body="{ data }">
        <div :data-draftId="data.draftId">
          <router-link
            :to="{
              name: projectRoute,
              params: { draftId: data.draftId }
            }"
          >
            {{ data.index }}
          </router-link>
        </div>
      </template>
    </Column>
    <Column
      field="updatedAt"
      :header="t('submissionDraftListProponent.lastEdited')"
      :sortable="true"
    >
      <template #body="{ data }">
        {{ formatDate(data?.updatedAt) }}
      </template>
    </Column>
    <Column
      field="action"
      :header="t('submissionDraftListProponent.action')"
      header-class="header-right"
      class="!text-right !py-0"
      style="width: 10%"
    >
      <template #body="{ data }">
        <Button
          class="p-button-lg p-button-text p-button-danger"
          :aria-label="t('submissionDraftListProponent.ariaDeleteDraft')"
          @click="onDelete(data.draftId)"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
