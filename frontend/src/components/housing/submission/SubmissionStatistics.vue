<script setup lang="ts">
import { version as uuidVersion, validate as uuidValidate } from 'uuid';
import { ref, watch } from 'vue';

import { Calendar, Dropdown } from '@/lib/primevue';
import { submissionService, userService } from '@/services';
import { Regex } from '@/utils/enums/application';

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

// State
const assigneeOptions: Ref<Array<User>> = ref([]);
const statistics = defineModel<Statistics | undefined>('statistics');
const statisticFilters: Ref<StatisticFilters> = ref({});

// Actions
const getAssigneeOptionLabel = (e: User) => `${e.fullName} [${e.email}]`;

const getPercentage = (input: number) =>
  statistics.value && statistics.value.total_submissions > 0
    ? Math.round((input / statistics.value.total_submissions) * 100)
    : 0;

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);

async function onAssigneeInput(e: IInputEvent) {
  const input = e.target.value;

  if (input.length >= 3) {
    assigneeOptions.value = (await userService.searchUsers({ email: input, fullName: input, username: input })).data;
  } else if (input.match(Regex.EMAIL)) {
    assigneeOptions.value = (await userService.searchUsers({ email: input })).data;
  } else {
    assigneeOptions.value = [];
  }
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
      statistics.value = (await submissionService.getStatistics(statisticFilters.value)).data;
    }
  },
  { deep: true }
);
</script>

<template>
  <div v-if="statistics">
    <table class="text-left">
      <thead>
        <th class="col-9">Statistics</th>
        <th class="col-1 text-right">Number</th>
        <th class="col-2 text-right">Percentage of total</th>
      </thead>
      <tr>
        <td class="col-9">Total submissions</td>
        <td class="col-1 text-right">{{ statistics.total_submissions }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.total_submissions) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by range
          <Calendar
            v-model="statisticFilters.dateFrom"
            show-icon
            icon-display="input"
          />
          to
          <Calendar
            v-model="statisticFilters.dateTo"
            show-icon
            icon-display="input"
          />
        </td>
        <td class="col-1 text-right">{{ statistics.total_submissions_between }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.total_submissions_between) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by month
          <Calendar
            v-model="statisticFilters.monthYear"
            view="month"
            show-icon
            icon-display="input"
          />
        </td>
        <td class="col-1 text-right">{{ statistics.total_submissions_monthyear }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.total_submissions_monthyear) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by assigned navigator
          <Dropdown
            v-model="statisticFilters.userId"
            class="w-7"
            editable
            :options="assigneeOptions"
            :option-label="getAssigneeOptionLabel"
            option-value="userId"
            @input="(e: IInputEvent) => onAssigneeInput(e)"
          />
        </td>
        <td class="col-1 text-right">{{ statistics.total_submissions_assignedto }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.total_submissions_assignedto) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by intake state:
          <span class="font-bold">Submitted</span>
        </td>
        <td class="col-1 text-right">{{ statistics.intake_submitted }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.intake_submitted) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by intake state:
          <span class="font-bold">Assigned</span>
        </td>
        <td class="col-1 text-right">{{ statistics.intake_assigned }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.intake_assigned) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by intake state:
          <span class="font-bold">Completed</span>
        </td>
        <td class="col-1 text-right">{{ statistics.intake_completed }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.intake_completed) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by activity state:
          <span class="font-bold">New</span>
        </td>
        <td class="col-1 text-right">{{ statistics.state_new }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.state_new) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by activity state:
          <span class="font-bold">In Progress</span>
        </td>
        <td class="col-1 text-right">{{ statistics.state_inprogress }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.state_inprogress) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by activity state:
          <span class="font-bold">Delayed</span>
        </td>
        <td class="col-1 text-right">{{ statistics.state_delayed }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.state_delayed) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by activity state:
          <span class="font-bold">Completed</span>
        </td>
        <td class="col-1 text-right">{{ statistics.state_completed }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.state_completed) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by financially supported:
          <span class="font-bold">BC Housing</span>
        </td>
        <td class="col-1 text-right">{{ statistics.supported_bc }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.supported_bc) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by financially supported:
          <span class="font-bold">Indigenous</span>
        </td>
        <td class="col-1 text-right">{{ statistics.supported_indigenous }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.supported_indigenous) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by financially supported:
          <span class="font-bold">Non-profit</span>
        </td>
        <td class="col-1 text-right">{{ statistics.supported_non_profit }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.supported_non_profit) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions by financially supported:
          <span class="font-bold">Co-operative</span>
        </td>
        <td class="col-1 text-right">{{ statistics.supported_housing_coop }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.supported_housing_coop) }}%</td>
      </tr>
      <tr>
        <td class="col-9">Submissions waiting on someone</td>
        <td class="col-1 text-right">{{ statistics.waiting_on }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.waiting_on) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions at
          <span class="font-bold">priority: 1</span>
        </td>
        <td class="col-1 text-right">{{ statistics.queue_1 }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.queue_1) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions at
          <span class="font-bold">priority: 2</span>
        </td>
        <td class="col-1 text-right">{{ statistics.queue_2 }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.queue_2) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Submissions at
          <span class="font-bold">priority: 3</span>
        </td>
        <td class="col-1 text-right">{{ statistics.queue_3 }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.queue_3) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Type:
          <span class="font-bold">Guidance</span>
        </td>
        <td class="col-1 text-right">{{ statistics.guidance }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.guidance) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Type:
          <span class="font-bold">General Enquiry</span>
        </td>
        <td class="col-1 text-right">{{ statistics.general_enquiry }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.general_enquiry) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Type:
          <span class="font-bold">Status Request</span>
        </td>
        <td class="col-1 text-right">{{ statistics.status_request }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.status_request) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Type:
          <span class="font-bold">Escalation</span>
        </td>
        <td class="col-1 text-right">{{ statistics.escalation }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.escalation) }}%</td>
      </tr>
      <tr>
        <td class="col-9">
          Type:
          <span class="font-bold">Inapplicable</span>
        </td>
        <td class="col-1 text-right">{{ statistics.inapplicable }}</td>
        <td class="col-2 text-right">{{ getPercentage(statistics.inapplicable) }}%</td>
      </tr>
    </table>
  </div>
</template>

<style scoped lang="scss">
table {
  border-collapse: collapse;
  border-spacing: 0;
  margin: auto;
}

thead {
  background-color: #d3d3d3;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
