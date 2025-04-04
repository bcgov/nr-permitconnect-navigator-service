<script setup lang="ts">
import { addDays, isPast, isToday, isWithinInterval, startOfToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import { inject, onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EnquiryListNavigator from '@/components/housing/enquiry/EnquiryListNavigator.vue';
import SubmissionBringForwardCalendar from '@/components/housing/submission/SubmissionBringForwardCalendar.vue';
import SubmissionListNavigator from '@/components/housing/submission/SubmissionListNavigator.vue';
import SubmissionStatistics from '@/components/housing/submission/SubmissionStatistics.vue';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useToast
} from '@/lib/primevue';
import { useAuthNStore, useAuthZStore } from '@/store';
import { Action, BasicResponse, Initiative, Resource, RouteName, StorageKey } from '@/utils/enums/application';
import { SubmissionType } from '@/utils/enums/housing';

import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { BringForward, ElectrificationProject, Enquiry, HousingProject, Permit, Statistics } from '@/types';
import type { IProjectService } from '@/interfaces/IProjectService';

// Constants
const NOTES_TAB_INDEX = {
  ENQUIRY: 1,
  SUBMISSION: 3
};

const TAB_INDEX = {
  SUBMISSION: 0,
  ENQUIRY: 1
};

// Props
const bringForward = defineModel<Array<BringForward>>('bringForward', { required: true });
const enquiries = defineModel<Array<Enquiry>>('enquiries', { required: true });
const permits = defineModel<Array<Permit>>('permits', { required: true });
const projects = defineModel<Array<ElectrificationProject | HousingProject>>('projects', { required: true });
const statistics = defineModel<Statistics>('statistics');

// Injections
const projectService = inject('projectService') as IProjectService;

// Composables
const toast = useToast();
const router = useRouter();

// Store
const authnStore = useAuthNStore();
const authzStore = useAuthZStore();

const { getProfile } = storeToRefs(authnStore);

// State
const route = useRoute();
const accordionIndex: Ref<string | null> = ref(null);
const activeTabIndex: Ref<number> = ref(route.query.tab ? Number(route.query.tab) : 0);
const myBringForward: Ref<Array<BringForward>> = ref([]);
const myAssignedTo: Ref<Set<string>> = ref(new Set<string>());
const showToggle: Ref<boolean> = ref(true);

// Actions
function assignEnquiriesAndFullName() {
  const relatedActivityIds = new Set();

  enquiries.value.forEach((enquiry) => relatedActivityIds.add(enquiry.relatedActivityId));

  projects.value.forEach((sub) => {
    if (relatedActivityIds.has(sub.activityId)) {
      sub.hasRelatedEnquiry = true;
    } else {
      sub.hasRelatedEnquiry = false;
    }
  });

  projects.value.forEach((sub) => {
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
  projects.value.forEach((sub) => {
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

function getNameObject(bf: BringForward) {
  if (bf.electrificationProjectId) return RouteName.INT_ELECTRIFICATION_PROJECT;
  if (bf.housingProjectId) RouteName.INT_HOUSING_PROJECT;
  return RouteName.INT_HOUSING_ENQUIRY;
}

function getParamObject(bf: BringForward) {
  if (bf.electrificationProjectId) {
    return {
      electrificationProjectId: bf.electrificationProjectId
    };
  }
  if (bf.housingProjectId) {
    return {
      housingProjectId: bf.housingProjectId
    };
  }
  return {
    enquiryId: bf.enquiryId
  };
}

// return the query object for the router link based on the submission type
function getQueryObject(bf: BringForward) {
  if (bf.electrificationProjectId || bf.housingProjectId) {
    return {
      initialTab: NOTES_TAB_INDEX.SUBMISSION
    };
  }
  return {
    initialTab: NOTES_TAB_INDEX.ENQUIRY
  };
}

function onEnquiryDelete(enquiryId: string, activityId: string) {
  enquiries.value = enquiries.value.filter((x) => x.enquiryId !== enquiryId);
  bringForward.value = bringForward.value.filter((x) => x.activityId !== activityId);
  refreshStatistics();
}

function onSubmissionDelete(projectId: string, activityId: string) {
  projects.value = projects.value.filter((x) => x.projectId !== projectId);
  bringForward.value = bringForward.value.filter((x) => x.activityId !== activityId);
  refreshStatistics();
}

function refreshStatistics() {
  projectService
    ?.getStatistics()
    .then((response) => {
      statistics.value = response.data;
    })
    .catch((e) => {
      toast.error('Failed to refresh statistics', e.message);
    });
}

onBeforeMount(async () => {
  assignEnquiriesAndFullName();
  assignMultiPermitsNeeded();

  const profile = getProfile.value;

  projects.value.forEach((sub) => {
    if (sub.user?.sub === profile?.sub) {
      myAssignedTo.value.add(sub.projectId);
    }
  });

  myBringForward.value = bringForward.value.filter((x) => {
    return (
      (x.createdByFullName === getProfile.value?.name || myAssignedTo.value.has(x.housingProjectId ?? '')) &&
      (getBringForwardInterval(x).pastOrToday || getBringForwardInterval(x).withinMonth)
    );
  });

  const accordionKey = window.sessionStorage.getItem(StorageKey.BF_ACCORDION_IDX);
  if (accordionKey) accordionIndex.value = accordionKey;
});

watch(accordionIndex, () => {
  if (accordionIndex.value) {
    window.sessionStorage.setItem(StorageKey.BF_ACCORDION_IDX, accordionIndex.value);
  } else {
    window.sessionStorage.removeItem(StorageKey.BF_ACCORDION_IDX);
  }
});

// Watch for changes in the active tab index
watch(activeTabIndex, (newIndex) => {
  // wipe out the query when switching tabs otherwise append the tab index to the query
  if (route.query.tab != newIndex.toString()) {
    router.replace({
      name: RouteName.INT_HOUSING,
      query: {
        tab: newIndex.toString()
      }
    });
  } else {
    router.replace({
      name: RouteName.INT_HOUSING,
      query: {
        ...route.query,
        tab: newIndex.toString()
      }
    });
  }

  // Show toggle only for submissions and enquiries tab
  showToggle.value = newIndex === TAB_INDEX.SUBMISSION || newIndex === TAB_INDEX.ENQUIRY;
});
</script>

<template>
  <Tabs :value="activeTabIndex">
    <TabList>
      <Tab :value="0">Projects</Tab>
      <Tab :value="1">Enquiries</Tab>
      <Tab :value="2">Statistics</Tab>
      <Tab
        v-if="authzStore.can(Initiative.HOUSING, Resource.NOTE, Action.READ)"
        :value="3"
      >
        Bring Forward Calendar
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <Accordion
          v-if="authzStore.can(Initiative.HOUSING, Resource.NOTE, Action.READ)"
          v-model:value="accordionIndex"
          collapse-icon="pi pi-chevron-up"
          expand-icon="pi pi-chevron-right"
          class="mb-4"
        >
          <AccordionPanel value="0">
            <AccordionHeader>My bring forward notifications</AccordionHeader>
            <AccordionContent>
              <div class="flex flex-col">
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
                        name: getNameObject(bf),
                        params: getParamObject(bf),
                        query: getQueryObject(bf),
                        hash: `#${bf.noteId}`
                      }"
                    >
                      {{ bf.title }}, {{ bf.projectName ?? SubmissionType.GENERAL_ENQUIRY }}
                    </router-link>
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
        <SubmissionListNavigator
          :submissions="projects"
          @submission:delete="onSubmissionDelete"
        />
      </TabPanel>
      <TabPanel :value="1">
        <EnquiryListNavigator
          :enquiries="enquiries"
          @enquiry:delete="onEnquiryDelete"
        />
      </TabPanel>
      <TabPanel :value="2">
        <SubmissionStatistics
          v-if="statistics"
          v-model:statistics="statistics"
        />
        <div v-else>Failed to load statistics.</div>
      </TabPanel>
      <TabPanel :value="3">
        <SubmissionBringForwardCalendar
          :bring-forward="bringForward"
          :my-assigned-to="myAssignedTo"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
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
