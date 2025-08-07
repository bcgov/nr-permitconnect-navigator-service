<script setup lang="ts">
import { version as uuidVersion, validate as uuidValidate } from 'uuid';
import { inject, ref, watch } from 'vue';

import { Button, DatePicker, Select, useToast } from '@/lib/primevue';
import { reportingService, userService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { Action, Initiative, Regex, Resource } from '@/utils/enums/application';
import { formatDate, formatDateFilename } from '@/utils/formatters';
import { projectServiceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { Statistics, User } from '@/types';

// Types
type StatisticFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  monthYear?: Date;
  userId?: string;
};

// Injections
const projectService = inject(projectServiceKey);

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const statistics = defineModel<Statistics | undefined>('statistics');
const statisticFilters: Ref<StatisticFilters> = ref({});

// Actions
const getAssigneeOptionLabel = (e: User) => `${e.fullName} [${e.email}]`;
const toast = useToast();

const getPercentage = (input: number) =>
  statistics.value && statistics.value.total_submissions > 0
    ? Math.round((input / statistics.value.total_submissions) * 100)
    : 0;

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);

async function onAssigneeInput(e: IInputEvent) {
  const input = e.target.value;

  if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
    assigneeOptions.value = (await userService.searchUsers({ email: input, fullName: input })).data;
  } else if (input.match(Regex.EMAIL)) {
    assigneeOptions.value = (await userService.searchUsers({ email: input })).data;
  } else {
    assigneeOptions.value = [];
  }
}

async function onDownloadProjectPermitData() {
  const initiative = useAppStore().getInitiative;

  let response;
  if (initiative === Initiative.ELECTRIFICATION)
    response = await reportingService.getElectrificationProjectPermitData();
  else if (initiative === Initiative.HOUSING) response = await reportingService.getHousingProjectPermitData();

  const data = response?.data;

  if (!data || data.length === 0) {
    toast.info('No Data', 'Data not available for downloaded.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];

      if (val === null || val === undefined) return '';

      val = val.toString();

      // convert date fields to readable format
      if (header === 'submitted_date' || header === 'adjudication_date' || header === 'status_last_verified') {
        val = formatDate(val);
      }

      // handle csv format breaking characters
      if (val.search(/("|,|\n)/g) >= 0) {
        val = `"${val.replace(/"/g, '""')}"`;
      }

      return val;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');

  const timestamp = formatDateFilename(new Date().toISOString());
  const filename = `PCNS-EXPORT-${timestamp}.csv`;

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

watch(
  statisticFilters,
  async () => {
    // Only submit if the user filter is empty or valid uuid
    // It's possible for the value to contain a garbage string due to how PrimeVue editable dropdown works
    let validUser =
      isEmpty(statisticFilters.value.userId) ||
      (!isEmpty(statisticFilters.value.userId) &&
        uuidValidate(statisticFilters.value.userId as string) &&
        uuidVersion(statisticFilters.value.userId as string) === 4);

    if (validUser) {
      if (projectService) statistics.value = (await projectService.getStatistics(statisticFilters.value)).data;
    }
  },
  { deep: true }
);
</script>

<template>
  <div v-if="statistics">
    <div class="flex justify-end mb-4">
      <Button
        class="download-production-btn"
        :disabled="!useAuthZStore().can(useAppStore().getInitiative, Resource.REPORTING, Action.READ)"
        @click="onDownloadProjectPermitData"
      >
        <font-awesome-icon
          class="pr-2"
          icon="fa-solid fa-download"
        />
        Download Production Data
      </Button>
    </div>
    <table class="w-full text-left">
      <thead>
        <tr>
          <th class="col-span-9"><div class="p-2">Statistics</div></th>
          <th class="col-span-1 text-right"><div class="py-2">Number</div></th>
          <th class="col-span-2 text-right"><div class="p-2">Percentage of total</div></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="col-span-9">Total Submissions and Enquiries</td>
          <td class="col-span-1 text-right">{{ statistics.total_submissions }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.total_submissions) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">Multi-authorization projects</td>
          <td class="col-span-1 text-right">{{ statistics.multi_permits_needed }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.multi_permits_needed) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by range
            <DatePicker
              v-model="statisticFilters.dateFrom"
              show-icon
              icon-display="input"
            />
            to
            <DatePicker
              v-model="statisticFilters.dateTo"
              show-icon
              icon-display="input"
            />
          </td>
          <td class="col-span-1 text-right">{{ statistics.total_submissions_between }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.total_submissions_between) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by month
            <DatePicker
              v-model="statisticFilters.monthYear"
              view="month"
              show-icon
              icon-display="input"
            />
          </td>
          <td class="col-span-1 text-right">{{ statistics.total_submissions_monthyear }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.total_submissions_monthyear) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by assigned navigator
            <Select
              v-model="statisticFilters.userId"
              class="w-7/12"
              editable
              :options="assigneeOptions"
              :option-label="getAssigneeOptionLabel"
              option-value="userId"
              @input="(e: IInputEvent) => onAssigneeInput(e)"
            />
          </td>
          <td class="col-span-1 text-right">{{ statistics.total_submissions_assignedto }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.total_submissions_assignedto) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by activity state:
            <span class="font-bold">New</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.state_new }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.state_new) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by activity state:
            <span class="font-bold">In Progress</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.state_inprogress }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.state_inprogress) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by activity state:
            <span class="font-bold">Delayed</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.state_delayed }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.state_delayed) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions by activity state:
            <span class="font-bold">Completed</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.state_completed }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.state_completed) }}%</td>
        </tr>
        <tr v-if="useAppStore().getInitiative === Initiative.HOUSING">
          <td class="col-span-9">
            Submissions by financially supported:
            <span class="font-bold">BC Housing</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.supported_bc }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.supported_bc) }}%</td>
        </tr>
        <tr v-if="useAppStore().getInitiative === Initiative.HOUSING">
          <td class="col-span-9">
            Submissions by financially supported:
            <span class="font-bold">Indigenous</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.supported_indigenous }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.supported_indigenous) }}%</td>
        </tr>
        <tr v-if="useAppStore().getInitiative === Initiative.HOUSING">
          <td class="col-span-9">
            Submissions by financially supported:
            <span class="font-bold">Non-profit</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.supported_non_profit }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.supported_non_profit) }}%</td>
        </tr>
        <tr v-if="useAppStore().getInitiative === Initiative.HOUSING">
          <td class="col-span-9">
            Submissions by financially supported:
            <span class="font-bold">Co-operative</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.supported_housing_coop }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.supported_housing_coop) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions at
            <span class="font-bold">priority: 1</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.queue_1 }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.queue_1) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions at
            <span class="font-bold">priority: 2</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.queue_2 }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.queue_2) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Submissions at
            <span class="font-bold">priority: 3</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.queue_3 }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.queue_3) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Type:
            <span class="font-bold">Guidance</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.guidance }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.guidance) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Type:
            <span class="font-bold">General Enquiry</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.general_enquiry }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.general_enquiry) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Type:
            <span class="font-bold">Status Request</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.status_request }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.status_request) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Type:
            <span class="font-bold">Escalation</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.escalation }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.escalation) }}%</td>
        </tr>
        <tr>
          <td class="col-span-9">
            Type:
            <span class="font-bold">Inapplicable</span>
          </td>
          <td class="col-span-1 text-right">{{ statistics.inapplicable }}</td>
          <td class="col-span-2 text-right">{{ getPercentage(statistics.inapplicable) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.download-production-btn {
  background-color: #f3f2f1;
  color: #000;
  border: 1px solid #d9d9d9;
  &:hover {
    background-color: #eceae8;
    color: #000;
    border: 1px solid #d9d9d9;
  }
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  margin: auto;
}

thead {
  background-color: #d3d3d3;
}

td {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

td:nth-child(3n + 1) {
  padding-left: 0.5rem;
}

td:nth-child(3n + 3) {
  padding-right: 0.5rem;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
