<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watchEffect } from 'vue';

import { Column, DataTable, InputSwitch } from '@/lib/primevue';
import { useAuthStore } from '@/store';
import { RouteName } from '@/utils/enums/application';
import { SubmissionType } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { BringForward } from '@/types';

// Constants
const NOTES_TAB_INDEX = {
  ENQUIRY: 1,
  SUBMISSION: 3
};

// Props
type Props = {
  bringForward?: Array<BringForward>;
};

const props = withDefaults(defineProps<Props>(), {
  bringForward: () => []
});

// Store
const { getProfile } = storeToRefs(useAuthStore());

// State
const bringForwards: Ref<Array<BringForward>> = ref(props.bringForward);
const filterToUser: Ref<boolean> = ref(false);

// Actions
watchEffect(() => {
  bringForwards.value = props.bringForward;
});

// return the query object for the router link based on the submission type
function getQueryObject(bf: BringForward) {
  if (bf.submissionId) {
    return {
      activityId: bf.activityId,
      initialTab: NOTES_TAB_INDEX.SUBMISSION,
      submissionId: bf.submissionId
    };
  }
  return {
    activityId: bf.activityId,
    initialTab: NOTES_TAB_INDEX.ENQUIRY,
    enquiryId: bf.enquiryId
  };
}
</script>

<template>
  <div class="grid">
    <div class="col-7">
      <div class="flex align-items-center justify-content-end pb-1">
        <InputSwitch
          v-model="filterToUser"
          class="mr-1"
        />
        <span class="font-bold">Show only mine</span>
      </div>
      <DataTable
        class="text-left w-full"
        :value="
          bringForwards.filter((x) => {
            return filterToUser ? x.createdByFullName === getProfile?.name : x;
          })
        "
        data-key="noteId"
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
                  name: data.submissionId ? RouteName.HOUSING_SUBMISSION : RouteName.HOUSING_ENQUIRY,
                  query: getQueryObject(data),
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
            {{ data.projectName ?? SubmissionType.GENERAL_ENQUIRY }}
          </template>
        </Column>
        <Column
          field="createdByFullName"
          header="Navigator"
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
