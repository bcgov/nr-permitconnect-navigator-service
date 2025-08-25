<script setup lang="ts">
import { inject } from 'vue';

import { Button, Column } from '@/lib/primevue';
import { useAppStore, useAuthZStore } from '@/store';
import { Action, BasicResponse } from '@/utils/enums/application';
import { formatDate } from '@/utils/formatters';
import { projectRouteNameKey, resourceKey } from '@/utils/keys';

import type { ElectrificationProject, HousingProject } from '@/types';

// Props
const { onDeleteCallback } = defineProps<{
  onDeleteCallback: Function;
}>();

const selection = defineModel<ElectrificationProject | HousingProject | undefined>('selection');

// Injections
const projectResource = inject(resourceKey);
const projectRoute = inject(projectRouteNameKey);

// Actions
function isFinanciallySupported(data: HousingProject) {
  if (
    data.financiallySupportedBc === BasicResponse.YES ||
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
            name: projectRoute,
            params: { projectId: data.projectId }
          }"
        >
          {{ data.projectName }}
        </router-link>
      </div>
    </template>
  </Column>
  <Column
    field="activityId"
    header="Project ID"
    :sortable="true"
    style="min-width: 133px"
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
              name: projectRoute,
              params: { projectId: data.projectId }
            }"
          >
            {{ data.activityId }}
          </router-link>
        </div>
      </div>
    </template>
  </Column>
  <Column
    field="activity.activityContact.0.contact.firstName"
    header="First name"
    :sortable="true"
    style="min-width: 150px"
  />
  <Column
    field="activity.activityContact.0.contact.lastName"
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
    header="Location"
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
    field="multiPermitsNeeded"
    header="Multi-authorization project"
    :sortable="true"
    style="min-width: 125px"
  />
  <Column
    field="user.fullName"
    header="Assigned-to"
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
  >
    <template #body="{ data }">
      {{ data.naturalDisaster ? BasicResponse.YES : BasicResponse.NO }}
    </template>
  </Column>
  <Column
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
        :disabled="!useAuthZStore().can(useAppStore().getInitiative, projectResource, Action.DELETE)"
        @click="
          onDeleteCallback(data.projectId, data.activityId);
          selection = data;
        "
      >
        <font-awesome-icon icon="fa-solid fa-trash" />
      </Button>
    </template>
  </Column>
</template>
