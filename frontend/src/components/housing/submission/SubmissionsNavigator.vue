<script setup lang="ts">
import { addDays, isPast, isToday, isWithinInterval, startOfToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import { Spinner } from '@/components/layout';
import EnquiryListNavigator from '@/components/housing/enquiry/EnquiryListNavigator.vue';
import SubmissionBringForwardCalendar from '@/components/housing/submission/SubmissionBringForwardCalendar.vue';
import SubmissionListNavigator from '@/components/housing/submission/SubmissionListNavigator.vue';
import SubmissionStatistics from '@/components/housing/submission/SubmissionStatistics.vue';
import { Accordion, AccordionTab, TabPanel, TabView } from '@/lib/primevue';
import { enquiryService, noteService, submissionService } from '@/services';
import PermissionService, { Permissions } from '@/services/permissionService';
import { useAuthStore } from '@/store';
import { RouteName, StorageKey } from '@/utils/enums/application';
import { BringForwardType, IntakeStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { BringForward, Enquiry, Statistics, Submission } from '@/types';

// Store
const authStore = useAuthStore();
const { getProfile } = storeToRefs(authStore);

// State
const accordionIndex: Ref<number | null> = ref(null);
const bringForward: Ref<Array<BringForward>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const myBringForward: Ref<Array<BringForward>> = ref([]);
const loading: Ref<boolean> = ref(true);
const submissions: Ref<Array<Submission>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

// Actions
const permissionService = new PermissionService();

function getBringForwardDate(bf: BringForward) {
  const { pastOrToday } = getBringForwardInterval(bf);
  return pastOrToday ? 'today' : formatDate(bf.bringForwardDate);
}

function getBringForwardInterval(bf: BringForward) {
  const today = startOfToday();

  const pastOrToday = isPast(bf.bringForwardDate) || isToday(bf.bringForwardDate);
  const withinWeek = isWithinInterval(bf.bringForwardDate, {
    start: today,
    end: addDays(today, 7)
  });
  const withinMonth = isWithinInterval(bf.bringForwardDate, {
    start: today,
    end: addDays(today, 30)
  });

  return { pastOrToday, withinWeek, withinMonth };
}

function getBringForwardStyling(bf: BringForward) {
  const { pastOrToday, withinWeek, withinMonth } = getBringForwardInterval(bf);
  return pastOrToday ? 'pastOrToday' : withinWeek ? 'withinWeek' : withinMonth ? 'withinMonth' : undefined;
}

onMounted(async () => {
  // To pull data from CHEFS
  await submissionService.getSubmissions();

  [enquiries.value, submissions.value, statistics.value, bringForward.value] = (
    await Promise.all([
      enquiryService.getEnquiries(),
      submissionService.searchSubmissions({
        includeUser: true,
        intakeStatus: [IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED, IntakeStatus.SUBMITTED]
      }),
      submissionService.getStatistics(),
      noteService.listBringForward(BringForwardType.UNRESOLVED)
    ])
  ).map((r) => r.data);

  myBringForward.value = bringForward.value.filter(
    (x) =>
      x.createdByFullName === getProfile.value?.name &&
      (getBringForwardInterval(x).pastOrToday || getBringForwardInterval(x).withinMonth)
  );

  loading.value = false;

  const accordionKey = window.sessionStorage.getItem(StorageKey.BF_ACCORDION_IDX);
  if (accordionKey !== null) accordionIndex.value = Number(accordionKey);
});

watch(accordionIndex, () => {
  if (accordionIndex.value !== null) {
    window.sessionStorage.setItem(StorageKey.BF_ACCORDION_IDX, accordionIndex.value.toString());
  } else {
    window.sessionStorage.removeItem(StorageKey.BF_ACCORDION_IDX);
  }
});
</script>

<template>
  <TabView v-if="!loading">
    <TabPanel header="Projects">
      <Accordion
        v-if="permissionService.can(Permissions.HOUSING_BRINGFORWARD_READ)"
        v-model:active-index="accordionIndex"
        class="mb-3"
      >
        <AccordionTab header="My bring forward notifications">
          <div class="flex flex-column">
            <div
              v-for="(bf, index) of myBringForward"
              :key="index"
              class="flex mb-1"
            >
              <span
                class="text-xl p-1 w-full"
                :class="getBringForwardStyling(bf)"
              >
                Bring forward {{ getBringForwardDate(bf) }}:
                <router-link
                  :to="{
                    name: RouteName.HOUSING_SUBMISSION,
                    query: { activityId: bf.activityId, initialTab: 3, submissionId: bf.submissionId },
                    hash: `#${bf.noteId}`
                  }"
                >
                  {{ bf.title }}, {{ bf.projectName }}
                </router-link>
              </span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
      <SubmissionListNavigator
        :loading="loading"
        :submissions="submissions"
      />
    </TabPanel>
    <TabPanel header="Enquiries">
      <EnquiryListNavigator
        :loading="loading"
        :enquiries="enquiries"
      />
    </TabPanel>
    <TabPanel header="Statistics">
      <SubmissionStatistics
        v-if="statistics"
        :loading="loading"
        :initial-statistics="statistics"
      />
      <div v-else>
        <span v-if="loading">
          <Spinner />
          Loading statistics...
        </span>
        <span v-else>Failed to load statistics.</span>
      </div>
    </TabPanel>
    <TabPanel
      v-if="permissionService.can(Permissions.HOUSING_BRINGFORWARD_READ)"
      header="Bring Forward Calendar"
    >
      <SubmissionBringForwardCalendar :bring-forward="bringForward" />
    </TabPanel>
  </TabView>
</template>

<style scoped lang="scss">
.pastOrToday {
  background-color: rgb(234, 153, 153);
}

.withinWeek {
  background-color: rgb(255, 229, 153);
}

.withinMonth {
  background-color: rgb(159, 197, 248);
}
</style>
