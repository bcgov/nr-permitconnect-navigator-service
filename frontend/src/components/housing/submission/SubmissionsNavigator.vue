<script setup lang="ts">
import { addDays, isPast, isToday, isWithinInterval, startOfToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Spinner } from '@/components/layout';
import EnquiryListNavigator from '@/components/housing/enquiry/EnquiryListNavigator.vue';
import SubmissionBringForwardCalendar from '@/components/housing/submission/SubmissionBringForwardCalendar.vue';
import SubmissionListNavigator from '@/components/housing/submission/SubmissionListNavigator.vue';
import SubmissionStatistics from '@/components/housing/submission/SubmissionStatistics.vue';
import { Accordion, AccordionTab, TabPanel, TabView, useToast } from '@/lib/primevue';
import { enquiryService, noteService, permitService, submissionService } from '@/services';
import { useAuthNStore, useAuthZStore } from '@/store';
import { Action, BasicResponse, Initiative, Resource, RouteName, StorageKey } from '@/utils/enums/application';
import { SubmissionType } from '@/utils/enums/housing';
import { BringForwardType, IntakeStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { BringForward, Enquiry, Permit, Statistics, Submission } from '@/types';

// Constants
const NOTES_TAB_INDEX = {
  ENQUIRY: 1,
  SUBMISSION: 3
};

// Store
const authnStore = useAuthNStore();
const authzStore = useAuthZStore();

const { getProfile } = storeToRefs(authnStore);

// State
const route = useRoute();
const accordionIndex: Ref<number | null> = ref(null);
const activeTabIndex: Ref<number> = ref(route.query.tab ? Number(route.query.tab) : 0);
const bringForward: Ref<Array<BringForward>> = ref([]);
const enquiries: Ref<Array<Enquiry>> = ref([]);
const myBringForward: Ref<Array<BringForward>> = ref([]);
const myAssignedTo: Ref<Set<string>> = ref(new Set<string>());
const permits: Ref<Array<Permit>> = ref([]);
const loading: Ref<boolean> = ref(true);
const submissions: Ref<Array<Submission>> = ref([]);
const statistics: Ref<Statistics | undefined> = ref(undefined);

// Actions
const toast = useToast();
const router = useRouter();

function assignEnquiriesAndFullName() {
  const relatedActivityIds = new Set();

  enquiries.value.forEach((enquiry) => relatedActivityIds.add(enquiry.relatedActivityId));

  submissions.value.forEach((sub) => {
    if (relatedActivityIds.has(sub.activityId)) {
      sub.hasRelatedEnquiry = true;
    } else {
      sub.hasRelatedEnquiry = false;
    }
  });

  submissions.value.forEach((sub) => {
    if (sub.user) {
      sub.user.fullName =
        sub.user.firstName && sub.user.lastName
          ? `${sub.user.lastName}, ${sub.user.firstName}`
          : sub.user.firstName || sub.user.lastName || '';
    }
  });
}

// Set multiPermitsNeeded property of each submission to Yes/No (count)
// if the submission have more than one permit with needed Yes
function assignMultiPermitsNeeded() {
  submissions.value.forEach((sub) => {
    const multiPermitsNeededCount = permits.value.filter(
      (x) => x.activityId === sub.activityId && x.needed?.toUpperCase() === BasicResponse.YES.toUpperCase()
    ).length;

    if (multiPermitsNeededCount > 1) sub.multiPermitsNeeded = `${BasicResponse.YES} (${multiPermitsNeededCount})`;
    else sub.multiPermitsNeeded = BasicResponse.NO;
  });
}

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

function onEnquiryDelete(enquiryId: string, activityId: string) {
  enquiries.value = enquiries.value.filter((x) => x.enquiryId !== enquiryId);
  bringForward.value = bringForward.value.filter((x) => x.activityId !== activityId);
  refreshStatistics();
}

function onSubmissionDelete(submissionId: string, activityId: string) {
  submissions.value = submissions.value.filter((x) => x.submissionId !== submissionId);
  bringForward.value = bringForward.value.filter((x) => x.activityId !== activityId);
  refreshStatistics();
}

function refreshStatistics() {
  submissionService
    .getStatistics()
    .then((response) => {
      statistics.value = response.data;
    })
    .catch((e) => {
      toast.error('Failed to refresh statistics', e.message);
    });
}

onMounted(async () => {
  // To pull data from CHEFS
  await submissionService.getSubmissions();

  [enquiries.value, permits.value, submissions.value, statistics.value, bringForward.value] = (
    await Promise.all([
      enquiryService.getEnquiries(),
      permitService.listPermits(),
      submissionService.searchSubmissions({
        includeUser: true,
        intakeStatus: [IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED, IntakeStatus.SUBMITTED]
      }),
      submissionService.getStatistics(),
      noteService.listBringForward(BringForwardType.UNRESOLVED)
    ])
  ).map((r) => r.data);

  assignEnquiriesAndFullName();
  assignMultiPermitsNeeded();

  const profile = getProfile.value;

  submissions.value.forEach((sub) => {
    if (sub.user?.sub === profile?.sub) {
      myAssignedTo.value.add(sub.submissionId);
    }
  });

  myBringForward.value = bringForward.value.filter((x) => {
    return (
      (x.createdByFullName === getProfile.value?.name || myAssignedTo.value.has(x.submissionId ?? '')) &&
      (getBringForwardInterval(x).pastOrToday || getBringForwardInterval(x).withinMonth)
    );
  });

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

// Watch for changes in the active tab index
watch(activeTabIndex, (newIndex) => {
  // wipe out the query when switching tabs otherwise append the tab index to the query
  if (route.query.tab != newIndex.toString()) {
    router.replace({
      name: RouteName.HOUSING_SUBMISSIONS,
      query: {
        tab: newIndex.toString()
      }
    });
  } else {
    router.replace({
      name: RouteName.HOUSING_SUBMISSIONS,
      query: {
        ...route.query,
        tab: newIndex.toString()
      }
    });
  }
});
</script>

<template>
  <TabView
    v-if="!loading"
    v-model:activeIndex="activeTabIndex"
  >
    <TabPanel header="Projects">
      <Accordion
        v-if="authzStore.can(Initiative.HOUSING, Resource.NOTE, Action.READ)"
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
                    name: bf.submissionId ? RouteName.HOUSING_SUBMISSION : RouteName.HOUSING_ENQUIRY,
                    query: getQueryObject(bf),
                    hash: `#${bf.noteId}`
                  }"
                >
                  {{ bf.title }}, {{ bf.projectName ?? SubmissionType.GENERAL_ENQUIRY }}
                </router-link>
              </span>
            </div>
          </div>
        </AccordionTab>
      </Accordion>

      <SubmissionListNavigator
        :loading="loading"
        :submissions="submissions"
        @submission:delete="onSubmissionDelete"
      />
    </TabPanel>
    <TabPanel header="Enquiries">
      <EnquiryListNavigator
        :loading="loading"
        :enquiries="enquiries"
        @enquiry:delete="onEnquiryDelete"
      />
    </TabPanel>
    <TabPanel header="Statistics">
      <SubmissionStatistics
        v-if="statistics"
        v-model:statistics="statistics"
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
      v-if="authzStore.can(Initiative.HOUSING, Resource.NOTE, Action.READ)"
      header="Bring Forward Calendar"
    >
      <SubmissionBringForwardCalendar
        :bring-forward="bringForward"
        :my-assigned-to="myAssignedTo"
      />
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
