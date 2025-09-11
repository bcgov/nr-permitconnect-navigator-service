<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Spinner } from '@/components/layout';
import { Column, DataTable, useToast } from '@/lib/primevue';
import { contactService } from '@/services';
import { useAuthZStore } from '@/store/authzStore';
import { EnquirySubmittedMethod, IntakeStatus } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { Contact, Enquiry } from '@/types';

// Props
const { loading, enquiries, projectId } = defineProps<{
  loading: boolean;
  enquiries: Array<Enquiry> | undefined;
  projectId?: string | undefined;
}>();

// Injections
const enquiryRouteName = inject(enquiryRouteNameKey);
const navigationPermission = inject(navigationPermissionKey);

// Composables
const { t } = useI18n();
const toast = useToast();

// Store
const authZStore = useAuthZStore();
const { canNavigate } = storeToRefs(authZStore);

// State
const selection: Ref<Enquiry | undefined> = ref(undefined);
const userIdToName: Ref<Record<string, string>> = ref({});

// Actions
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

onBeforeMount(async () => {
  try {
    if (enquiries && enquiries.length > 0) {
      const createdByUsersArray = enquiries.map((enquiry) => enquiry.createdBy as string);
      const createdByUserlist = (await contactService.searchContacts({ userId: createdByUsersArray })).data;

      createdByUserlist.forEach((contact: Contact) => {
        if (contact.userId)
          userIdToName.value[contact.userId] = `${contact?.firstName ?? ''} ${contact?.lastName ?? ''}`;
      });
    }
  } catch {
    toast.error(t('relatedEnquiryListProponent.createdByFailed'));
  }
});
</script>

<template>
  <DataTable
    :selection="selection"
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
    :current-page-report-template="`({currentPage} ${t('relatedEnquiryListProponent.of')} {totalPages})`"
    :rows-per-page-options="[10, 20, 50]"
    selection-mode="single"
    :alt="t('relatedEnquiryListProponent.tableAlt')"
  >
    <template #empty>
      <div class="flex justify-center">
        <p class="font-bold">
          {{ t('relatedEnquiryListProponent.listEmpty') }}
        </p>
      </div>
    </template>
    <template #loading>
      <Spinner />
    </template>
    <Column
      field="activityId"
      :header="t('relatedEnquiryListProponent.enquiryId')"
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
      field="submittedBy"
      :header="t('relatedEnquiryListProponent.submittedBy')"
      :sortable="true"
      :sort-field="(event) => userIdToName[event.createdBy]"
    >
      <template #body="{ data }">
        <span class="ml-2">
          {{ userIdToName[data.createdBy] }}
        </span>
      </template>
    </Column>

    <Column
      field="submittedAt"
      :header="t('relatedEnquiryListProponent.submittedDate')"
      :sortable="true"
      header-class="header-right"
      class="!text-right"
    >
      <template #body="{ data }">
        {{ data.intakeStatus !== IntakeStatus.DRAFT ? formatDate(data?.submittedAt) : undefined }}
      </template>
    </Column>
  </DataTable>
</template>
