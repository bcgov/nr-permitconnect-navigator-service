<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watchEffect } from 'vue';

import { Column, DataTable, ToggleSwitch } from '@/lib/primevue';
import { useAppStore, useAuthNStore } from '@/store';
import { BRING_FORWARD_ROUTE_MAP } from '@/utils/constants/application';
import { Initiative } from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { BringForward } from '@/types';

// Props
const { bringForward = [], myAssignedTo = new Set<string>() } = defineProps<{
  bringForward?: BringForward[];
  myAssignedTo?: Set<string>;
}>();

// Store
const { getProfile } = storeToRefs(useAuthNStore());

// State
const bringForwards: Ref<BringForward[]> = ref(bringForward);
const filterToUser: Ref<boolean> = ref(false);

// Actions
function filterForMyBringForwards(bf: BringForward): boolean {
  return bf.createdByFullName === getProfile.value?.name || myAssignedTo.has(bf.projectId ?? '');
}

function getBfRouteName(bf: BringForward) {
  const initiative = useAppStore().getInitiative;

  if (initiative === Initiative.PCNS) {
    return undefined;
  }

  const routes = BRING_FORWARD_ROUTE_MAP[initiative];

  if (bf.projectId) return routes.project;
  if (bf.enquiryId) return routes.enquiry;

  return undefined;
}

function getBfRouteParams(bf: BringForward) {
  if (bf.projectId) {
    return {
      projectId: bf.projectId,
      noteHistoryId: bf.noteHistoryId
    };
  }
  if (bf.enquiryId) {
    return {
      enquiryId: bf.enquiryId,
      noteHistoryId: bf.noteHistoryId
    };
  }
}

watchEffect(() => {
  bringForwards.value = bringForward;
});
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-7">
      <div class="flex items-center justify-end pb-1">
        <ToggleSwitch
          v-model="filterToUser"
          class="mr-1"
        />
        <span class="font-bold">Show only mine</span>
      </div>
      <DataTable
        class="text-left w-full"
        :value="filterToUser ? bringForwards.filter(filterForMyBringForwards) : bringForwards"
        data-key="noteHistoryId"
        removable-sort
        scrollable
        responsive-layout="scroll"
        sort-field="bringForwardDate"
        :sort-order="1"
      >
        <Column
          field="title"
          header="Bring Forward Note"
          :sortable="true"
        >
          <template #body="{ data }">
            <div :data-activityId="data.activityId">
              <router-link
                :to="{
                  name: getBfRouteName(data),
                  params: getBfRouteParams(data),
                  hash: `#${data.noteHistoryId}`
                }"
              >
                {{ data.title }}
              </router-link>
            </div>
          </template>
        </Column>
        <Column
          field="projectName"
          header="Project Name"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ data.projectName ?? NoteType.BRING_FORWARD }}
          </template>
        </Column>
        <Column
          field="createdByFullName"
          header="Author"
          :sortable="true"
        />
        <Column
          field="bringForwardDate"
          header="Date"
          :sortable="true"
        >
          <template #body="{ data }">
            {{ formatDate(data.bringForwardDate) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
