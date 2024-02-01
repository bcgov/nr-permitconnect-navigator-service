<script setup lang="ts">
import { version as uuidVersion, validate as uuidValidate } from 'uuid';
import { onMounted, ref, watch } from 'vue';

import { Calendar, Dropdown } from '@/lib/primevue';
import { chefsService, userService } from '@/services';
import { Regex } from '@/utils/constants';

import type { Ref } from 'vue';
import type { IInputEvent } from '@/interfaces';
import type { User } from '@/types';

// Types
type StatisticFilters = {
  dateFrom?: string;
  dateTo?: string;
  monthYear?: string;
  userId?: string;
};

// State
const loading: Ref<boolean> = ref(false);
const statistics: Ref<any> = ref(undefined);
const assigneeOptions: Ref<Array<User>> = ref([]);
const statisticFilters: Ref<StatisticFilters> = ref({});

// Actions
const getAssigneeOptionLabel = (e: User) => `${e.fullName} [${e.email}]`;

const getPercentage = (input: number) =>
  statistics.value.total_submissions > 0 ? (input / statistics.value.total_submissions) * 100 : 0;

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
    let valid =
      isEmpty(statisticFilters.value.userId) ||
      (!isEmpty(statisticFilters.value.userId) &&
        uuidValidate(statisticFilters.value.userId as string) &&
        uuidVersion(statisticFilters.value.userId as string) === 4);

    if (valid) {
      loading.value = true;
      statistics.value = (
        await chefsService.getStatistics(statisticFilters.value).finally(() => (loading.value = false))
      ).data;
    }
  },
  { deep: true }
);

onMounted(async () => {
  loading.value = true;
  statistics.value = (await chefsService.getStatistics().finally(() => (loading.value = false))).data;
});
</script>

<template>
  <div v-if="statistics">
    <table class="striped text-left">
      <thead>
        <th class="col-8">Statistic</th>
        <th class="col-2">Number</th>
        <th class="col-2">Percentage of total</th>
      </thead>
      <tr>
        <td class="col-8">Total submissions</td>
        <td class="col-2">{{ statistics.total_submissions }}</td>
        <td class="col-2">{{ getPercentage(statistics.total_submissions) }}%</td>
      </tr>
      <tr>
        <td class="col-8">
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
        <td class="col-2">{{ statistics.total_submissions_between }}</td>
        <td class="col-2">{{ getPercentage(statistics.total_submissions_between) }}%</td>
      </tr>
      <tr>
        <td class="col-8">
          Submissions by month
          <Calendar
            v-model="statisticFilters.monthYear"
            view="month"
            show-icon
            icon-display="input"
          />
        </td>
        <td class="col-2">{{ statistics.total_submissions_monthyear }}</td>
        <td class="col-2">{{ getPercentage(statistics.total_submissions_monthyear) }}%</td>
      </tr>
      <tr>
        <td class="col-8">
          Submissions by assigned navigator
          <Dropdown
            v-model.trim="statisticFilters.userId"
            class="w-5"
            editable
            :options="assigneeOptions"
            :option-label="getAssigneeOptionLabel"
            option-value="userId"
            @input="(e: IInputEvent) => onAssigneeInput(e)"
          />
        </td>
        <td class="col-2">{{ statistics.total_submissions_assignedto }}</td>
        <td class="col-2">{{ getPercentage(statistics.total_submissions_assignedto) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by intake state: Submitted</td>
        <td class="col-2">{{ statistics.intake_submitted }}</td>
        <td class="col-2">{{ getPercentage(statistics.intake_submitted) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by intake state: Assigned</td>
        <td class="col-2">{{ statistics.intake_assigned }}</td>
        <td class="col-2">{{ getPercentage(statistics.intake_assigned) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by intake state: Completed</td>
        <td class="col-2">{{ statistics.intake_completed }}</td>
        <td class="col-2">{{ getPercentage(statistics.intake_completed) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by activity state: New</td>
        <td class="col-2">{{ statistics.state_new }}</td>
        <td class="col-2">{{ getPercentage(statistics.state_new) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by activity state: In Progress</td>
        <td class="col-2">{{ statistics.state_inprogress }}</td>
        <td class="col-2">{{ getPercentage(statistics.state_inprogress) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by activity state: Delayed</td>
        <td class="col-2">{{ statistics.state_delayed }}</td>
        <td class="col-2">{{ getPercentage(statistics.state_delayed) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions by activity state: Completed</td>
        <td class="col-2">{{ statistics.state_completed }}</td>
        <td class="col-2">{{ getPercentage(statistics.state_completed) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions waiting on someone</td>
        <td class="col-2">{{ statistics.waiting_on }}</td>
        <td class="col-2">{{ getPercentage(statistics.waiting_on) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions at priority 0</td>
        <td class="col-2">{{ statistics.queue_0 }}</td>
        <td class="col-2">{{ getPercentage(statistics.queue_0) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions at priority 1</td>
        <td class="col-2">{{ statistics.queue_1 }}</td>
        <td class="col-2">{{ getPercentage(statistics.queue_1) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions at priority 2</td>
        <td class="col-2">{{ statistics.queue_2 }}</td>
        <td class="col-2">{{ getPercentage(statistics.queue_2) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions at priority 3</td>
        <td class="col-2">{{ statistics.queue_3 }}</td>
        <td class="col-2">{{ getPercentage(statistics.queue_3) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions at priority 4</td>
        <td class="col-2">{{ statistics.queue_4 }}</td>
        <td class="col-2">{{ getPercentage(statistics.queue_4) }}%</td>
      </tr>
      <tr>
        <td class="col-8">Submissions at priority 5</td>
        <td class="col-2">{{ statistics.queue_5 }}</td>
        <td class="col-2">{{ getPercentage(statistics.queue_5) }}%</td>
      </tr>
    </table>
  </div>
</template>

<style scoped lang="scss">
table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  margin: auto;
}

thead {
  background-color: #d3d3d3;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
