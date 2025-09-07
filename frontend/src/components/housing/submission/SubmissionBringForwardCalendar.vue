<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watchEffect } from 'vue';

import { Column, DataTable, ToggleSwitch } from '@/lib/primevue';
import { useAppStore, useAuthNStore } from '@/store';
import { Initiative, RouteName } from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { BringForward } from '@/types';

// Props
const { bringForward = [], myAssignedTo = new Set<string>() } = defineProps<{
  bringForward?: Array<BringForward>;
  myAssignedTo: Set<string>;
}>();

// Store
const { getProfile } = storeToRefs(useAuthNStore());

// State
const bringForwards: Ref<Array<BringForward>> = ref(bringForward);
const filterToUser: Ref<boolean> = ref(false);

// Actions
watchEffect(() => {
  bringForwards.value = bringForward;
});

function getNameObject(bf: BringForward) {
  if (bf.electrificationProjectId) return RouteName.INT_ELECTRIFICATION_PROJECT_NOTE;
  if (bf.housingProjectId) return RouteName.INT_HOUSING_PROJECT_NOTE;
  if (bf.enquiryId) {
    switch (useAppStore().getInitiative) {
      case Initiative.ELECTRIFICATION:
        return RouteName.INT_ELECTRIFICATION_ENQUIRY_NOTE;
      case Initiative.HOUSING:
        return RouteName.INT_HOUSING_ENQUIRY_NOTE;
    }
  }
}

function getParamObject(bf: BringForward) {
  if (bf.electrificationProjectId) {
    return {
      projectId: bf.electrificationProjectId,
      noteHistoryId: bf.noteId
    };
  }
  if (bf.housingProjectId) {
    return {
      projectId: bf.housingProjectId,
      noteHistoryId: bf.noteId
    };
  }
  if (bf.enquiryId) {
    return {
      enquiryId: bf.enquiryId,
      noteHistoryId: bf.noteId
    };
  }
}

function filterForMyBringForwards(bf: BringForward): boolean {
  return bf.createdByFullName === getProfile.value?.name || myAssignedTo.has(bf.housingProjectId ?? '');
}
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
        :value="
          bringForwards.filter((x) => {
            // return x.createdByFullName === getProfile?.name;
            return filterToUser ? filterForMyBringForwards(x) : x;
          })
        "
        data-key="noteId"
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
                  name: getNameObject(data),
                  params: getParamObject(data),
                  hash: `#${data.noteId}`
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

<style scoped lang="scss">
table {
  border-collapse: collapse;
  border-spacing: 0;
}

thead {
  background-color: #d3d3d3;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
