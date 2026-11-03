<script setup lang="ts">
import iframeResize from 'iframe-resizer/js/iframeResizer';
import { version as uuidVersion, validate as uuidValidate } from 'uuid';
import { inject, onBeforeMount, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';

import { Button, DatePicker, Select, useToast } from '@/lib/primevue';
import { reportingService, userService } from '@/services';
import { getDashboard } from '@/services/reportingService';
import { useAppStore, useAuthZStore } from '@/store';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { Action, GroupName, Initiative, Regex, Resource } from '@/utils/enums/application';
import { formatDate, formatDateFilename } from '@/utils/formatters';
import { projectServiceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { ProjectService } from '@/types/services';
import type { InputEvent, ProjectStatistics, Schema, User } from '@/types';

// Injections
const projectService = inject<Ref<ProjectService<unknown>>>(projectServiceKey);

// Constants
const NAV_GROUPS = [
  GroupName.ADMIN,
  GroupName.DEVELOPER,
  GroupName.NAVIGATOR,
  GroupName.NAVIGATOR_READ_ONLY,
  GroupName.SUPERVISOR
];

// Housing has every statistic, the other initiatives a subset; rows missing from the response are hidden
type StatisticKey = keyof Schema<'HousingProjectStatistics'>;
const ROWS: { label: string; value?: string; key: StatisticKey; filter?: 'range' | 'month' | 'assignee' }[] = [
  { label: 'Total Submissions and Enquiries', key: 'total_submissions' },
  { label: 'Multi-authorization projects', key: 'multi_permits_needed' },
  { label: 'Submissions by range', key: 'total_submissions_between', filter: 'range' },
  { label: 'Submissions by month', key: 'total_submissions_monthyear', filter: 'month' },
  { label: 'Submissions by assigned navigator', key: 'total_submissions_assignedto', filter: 'assignee' },
  { label: 'Submissions by activity state:', value: 'New', key: 'state_new' },
  { label: 'Submissions by activity state:', value: 'In Progress', key: 'state_inprogress' },
  { label: 'Submissions by activity state:', value: 'Delayed', key: 'state_delayed' },
  { label: 'Submissions by activity state:', value: 'Completed', key: 'state_completed' },
  { label: 'Submissions by financially supported:', value: 'BC Housing', key: 'supported_bc' },
  { label: 'Submissions by financially supported:', value: 'Indigenous', key: 'supported_indigenous' },
  { label: 'Submissions by financially supported:', value: 'Non-profit', key: 'supported_non_profit' },
  { label: 'Submissions by financially supported:', value: 'Co-operative', key: 'supported_housing_coop' },
  { label: 'Submissions at', value: 'priority: 1', key: 'queue_1' },
  { label: 'Submissions at', value: 'priority: 2', key: 'queue_2' },
  { label: 'Submissions at', value: 'priority: 3', key: 'queue_3' },
  { label: 'Type:', value: 'Guidance', key: 'guidance' },
  { label: 'Type:', value: 'General Enquiry', key: 'general_enquiry' },
  { label: 'Type:', value: 'Status Request', key: 'status_request' },
  { label: 'Type:', value: 'Escalation', key: 'escalation' },
  { label: 'Type:', value: 'Inapplicable', key: 'inapplicable' }
];

// State
const assigneeOptions: Ref<User[]> = ref([]);
const statistics = defineModel<ProjectStatistics | undefined>('statistics');
const statisticFilters: Ref<{ dateFrom?: Date; dateTo?: Date; monthYear?: Date; userId?: string }> = ref({});
const url = ref<string>();
const frame = useTemplateRef<HTMLIFrameElement & { iFrameResizer?: { removeListeners: () => void } }>('frame');

// Actions
const getAssigneeOptionLabel = (e: User) => `${e.fullName} [${e.email}]`;
const toast = useToast();

const getPercentage = (input: number) =>
  statistics.value && statistics.value.total_submissions > 0
    ? Math.round((input / statistics.value.total_submissions) * 100)
    : 0;

const getStatistic = (key: StatisticKey) =>
  (statistics.value as Partial<Schema<'HousingProjectStatistics'>> | undefined)?.[key] ?? 0;

const assigneeIsEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);

async function onAssigneeInput(e: InputEvent) {
  const input = e.target.value;

  if (input.match(Regex.EMAIL)) {
    assigneeOptions.value = await userService.searchUsers({ email: input, group: NAV_GROUPS });
  } else if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
    assigneeOptions.value = await userService.searchUsers({ email: input, fullName: input, group: NAV_GROUPS });
  } else {
    assigneeOptions.value = [];
  }
}

async function onDownloadProjectPermitData() {
  const initiative = useAppStore().getInitiative;

  let response;
  if (initiative === Initiative.ELECTRIFICATION)
    response = await reportingService.getElectrificationProjectPermitData();
  else if (initiative === Initiative.GENERAL) response = await reportingService.getGeneralProjectPermitData();
  else if (initiative === Initiative.HOUSING) response = await reportingService.getHousingProjectPermitData();

  const data = response;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    toast.info('No Data', 'Data not available for downloaded.');
    return;
  }

  const headers = Object.keys(data[0]) as (keyof (typeof data)[number])[];
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];

      if (val === null || val === undefined) return '';

      val = val.toString();

      // convert date fields to readable format
      if (header === 'submitted_date' || header === 'decision_date' || header === 'status_last_verified') {
        val = formatDate(val);
      }

      // handle csv format breaking characters
      if (val.search(/["\n,]/) >= 0) {
        val = `"${val.replaceAll('"', '""')}"`;
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

// Metabase only sizes the embed to its content once an iframe-resizer parent connects
// checkOrigin off since siteUrl may be http while Metabase answers from https
// The embed only reports growth, so the iframe stays at the tallest tab viewed
const onFrameLoad = () => frame.value && iframeResize({ checkOrigin: false }, frame.value);

onBeforeMount(async () => {
  url.value = (await getDashboard()).url ?? undefined;
});

onBeforeUnmount(() => frame.value?.iFrameResizer?.removeListeners());

watch(
  statisticFilters,
  async () => {
    // Only search if the user filter is empty or valid uuid
    // It's possible for the value to contain a garbage string due to how PrimeVue editable dropdown works
    const userId = statisticFilters.value.userId;
    const isEmpty = assigneeIsEmpty(userId);
    const isValidUuid = isEmpty || (!isEmpty && uuidValidate(userId as string) && uuidVersion(userId as string) === 4);

    // Ignore invalid or garbage user filter
    if (!isEmpty && !isValidUuid) return;

    if (projectService) {
      const { dateFrom, dateTo, monthYear } = statisticFilters.value;
      const searchPayload = {
        dateFrom: dateFrom?.toISOString(),
        dateTo: dateTo?.toISOString(),
        monthYear: monthYear?.toISOString(),
        userId: isEmpty ? undefined : userId
      };
      statistics.value = await projectService.value.getProjectStatistics(searchPayload);
    }
  },
  { deep: true }
);
</script>

<template>
  <div v-if="statistics">
    <div class="flex justify-end mb-4">
      <Button
        class="bg-[var(--p-greyscale-100)]! text-black! border! border-[#d9d9d9]! hover:bg-[var(--p-greyscale-200)]!"
        :disabled="!useAuthZStore().can(Initiative.PCNS, Resource.REPORTING, Action.READ)"
        @click="onDownloadProjectPermitData"
      >
        <font-awesome-icon
          class="pr-2"
          icon="fa-solid fa-download"
        />
        Download Production Data
      </Button>
    </div>
    <table class="w-full text-left border-collapse">
      <thead class="bg-[var(--p-greyscale-400)]">
        <tr>
          <th class="p-2">Statistics</th>
          <th class="py-2 text-right">Number</th>
          <th class="p-2 text-right">Percentage of total</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="row in ROWS"
          :key="row.key"
        >
          <tr
            v-if="row.key in statistics"
            class="even:bg-[#f2f2f2]"
          >
            <td class="py-2 pl-2">
              {{ row.label }}
              <span
                v-if="row.value"
                class="font-bold"
              >
                {{ row.value }}
              </span>
              <template v-if="row.filter === 'range'">
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
              </template>
              <DatePicker
                v-else-if="row.filter === 'month'"
                v-model="statisticFilters.monthYear"
                view="month"
                show-icon
                icon-display="input"
              />
              <Select
                v-else-if="row.filter === 'assignee'"
                v-model="statisticFilters.userId"
                class="w-7/12"
                editable
                :options="assigneeOptions"
                :option-label="getAssigneeOptionLabel"
                option-value="userId"
                @input="(e: InputEvent) => onAssigneeInput(e)"
              />
            </td>
            <td class="py-2 text-right">{{ getStatistic(row.key) }}</td>
            <td class="py-2 pr-2 text-right">{{ getPercentage(getStatistic(row.key)) }}%</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
  <template v-if="url">
    <h1>Dashboard</h1>
    <iframe
      ref="frame"
      :src="url"
      title="Permit and project dashboard"
      class="w-full h-[100vh] border-0 overflow-hidden"
      @load="onFrameLoad"
    />
  </template>
</template>
