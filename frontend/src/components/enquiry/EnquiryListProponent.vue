<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Column, DataTable } from '@/lib/primevue';
import { useAuthZStore } from '@/store/authzStore';
import { EnquirySubmittedMethod } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { Enquiry } from '@/types';

// Props
const { loading, enquiries, projectId } = defineProps<{
  loading: boolean;
  enquiries: Array<Enquiry> | undefined;
  projectId?: string | undefined;
}>();

// Injections
const enquiryRouteName = inject(enquiryRouteNameKey);
const navigationPermission = inject(navigationPermissionKey);

// Store
const authZStore = useAuthZStore();
const { canNavigate } = storeToRefs(authZStore);

// State
const selection: Ref<Enquiry | undefined> = ref(undefined);

// Actions
const { t } = useI18n();

function getRouteToObject(data: Enquiry) {
  let toObject = {};
  if (enquiries?.[0]?.relatedActivityId) {
    toObject = {
      name: enquiryRouteName,
      params: { enquiryId: data.enquiryId, projectId }
    };
  } else {
    toObject = {
      name: enquiryRouteName,
      params: { enquiryId: data.enquiryId }
    };
  }

  return toObject;
}
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :loading="loading"
    :value="enquiries"
    data-key="enquiryId"
    removable-sort
    scrollable
    responsive-layout="scroll"
    :paginator="true"
    :rows="5"
    sort-field="submittedAt"
    :sort-order="-1"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    :current-page-report-template="`({currentPage} ${t('enquiryListProponent.of')} {totalPages})`"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
    :alt="t('enquiryListProponent.tableAlt')"
  >
    <template #empty>
      <div class="flex justify-center">
        <p class="font-bold">
          {{ t('enquiryListProponent.listEmpty') }}
        </p>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="activity.activityId"
      :header="t('enquiryListProponent.enquiryId')"
      :sortable="true"
      style="width: 45%"
    >
      <template #body="{ data }">
        <div
          v-if="
            navigationPermission &&
            canNavigate(navigationPermission) &&
            data.submittedMethod === EnquirySubmittedMethod.PCNS
          "
          :data-activityId="data.activityId"
        >
          <router-link :to="getRouteToObject(data)">
            {{ data.activityId }}
          </router-link>
        </div>
        <div
          v-else
          :data-activityId="data.activityId"
        >
          {{ data.activityId }}
        </div>
      </template>
    </Column>

    <Column
      field="submittedAt"
      :header="t('enquiryListProponent.submittedDate')"
      :sortable="true"
      header-class="header-right"
      class="!text-right"
    >
      <template #body="{ data }">
        {{ formatDate(data?.submittedAt) }}
      </template>
    </Column>
  </DataTable>
</template>
