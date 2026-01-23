<script setup lang="ts">
import { addDays, isPast, isToday, isWithinInterval, startOfToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import { inject, onBeforeMount, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Escalation } from '@/components/common/icons';
import SubmissionBringForwardCalendar from '@/components/submission/SubmissionBringForwardCalendar.vue';
import ProjectListNavigator from '@/components/projectCommon/ProjectListNavigator.vue';
import SubmissionStatistics from '@/components/submission/SubmissionStatistics.vue';
import EnquiryListNavigator from '@/components/enquiry/EnquiryListNavigator.vue';
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
import { useAppStore, useAuthNStore, useAuthZStore } from '@/store';
import {
  Action,
  BasicResponse,
  GroupName,
  Initiative,
  Resource,
  RouteName,
  StorageKey
} from '@/utils/enums/application';
import { NoteType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { projectServiceKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { BringForward, ElectrificationProject, Enquiry, HousingProject, Permit, Statistics } from '@/types';

// Constants
const TAB_INDEX = {
  SUBMISSION: 0,
  ENQUIRY: 1
};

// Props
const bringForward = defineModel<BringForward[]>('bringForward', { required: true });
const enquiries = defineModel<Enquiry[]>('enquiries', { required: true });
const permits = defineModel<Permit[]>('permits', { required: true });
const projects = defineModel<(ElectrificationProject | HousingProject)[]>('projects', { required: true });
const statistics = defineModel<Statistics>('statistics');

// Injections
const projectService = inject(projectServiceKey);

// Composables
const toast = useToast();
const route = useRoute();
const router = useRouter();

// Store
const authnStore = useAuthNStore();
const authzStore = useAuthZStore();

const { getProfile } = storeToRefs(authnStore);

// State
const accordionIndex: Ref<string | null> = ref(null);
const activeTabIndex: Ref<number> = ref(route.query.tab ? Number(route.query.tab) : 0);
const relevantBringForwards: Ref<BringForward[]> = ref([]);
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
    else sub.multiPermitsNeeded = `${BasicResponse.NO} (${multiPermitsNeededCount})`;
  });
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
  projectService?.value
    ?.getStatistics()
    .then((response) => {
      statistics.value = response.data;
    })
    .catch((e) => {
      toast.error('Failed to refresh statistics', e.message);
    });
}

function sortRelevantBringForwards(filteredBringForwards: BringForward[]) {
  return filteredBringForwards.sort((a, b) => {
    const isPastA = isPast(a.bringForwardDate);
    const isPastB = isPast(b.bringForwardDate);
    const timeA = new Date(a.bringForwardDate).getTime();
    const timeB = new Date(b.bringForwardDate).getTime();
    if (isPastA && isPastB) {
      // Both past, sort ascending
      return timeA - timeB;
    } else if (isPastA) {
      return -1; // a is past, b is not, a comes first
    } else if (isPastB) {
      return 1; // b is past, a is not, b comes first
    } else {
      // Both future, sort ascending
      return timeA - timeB;
    }
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

watchEffect(() => {
  const filteredBringForwards = bringForward.value.filter((x) => {
    const { pastOrToday, withinMonth } = getBringForwardInterval(x);
    const assignedAndWithinMonth =
      (x.createdByFullName === getProfile.value?.name ||
        myAssignedTo.value.has(x.electrificationProjectId ?? '') ||
        myAssignedTo.value.has(x.housingProjectId ?? '')) &&
      (pastOrToday || withinMonth);
    const escalated = authzStore.isInGroup([GroupName.SUPERVISOR]) && x.escalateToSupervisor;
    return assignedAndWithinMonth || escalated;
  });
  relevantBringForwards.value = sortRelevantBringForwards(filteredBringForwards);
});
</script>

<template>
  <Tabs :value="activeTabIndex">
    <TabList>
      <Tab :value="0">Projects</Tab>
      <Tab :value="1">Enquiries</Tab>
      <Tab :value="2">Statistics</Tab>
      <Tab
        v-if="authzStore.can(useAppStore().getInitiative, Resource.NOTE, Action.READ)"
        :value="3"
      >
        Bring Forward Calendar
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <Accordion
          v-if="authzStore.can(useAppStore().getInitiative, Resource.NOTE, Action.READ)"
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
                  v-for="(bf, index) of relevantBringForwards"
                  :key="index"
                  class="flex mb-1"
                >
                  <span
                    class="text-xl p-1 pl-2 w-full flex items-center gap-2"
                    :class="getBringForwardStyling(bf)"
                  >
                    <Escalation v-if="bf.escalateToSupervisor || bf.escalateToDirector" />
                    Bring forward {{ formatDate(bf.bringForwardDate) }}:
                    <router-link
                      :to="{
                        name: getNameObject(bf),
                        params: getParamObject(bf)
                      }"
                    >
                      {{ bf.title }}, {{ bf.projectName ?? NoteType.BRING_FORWARD }}
                    </router-link>
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
        <ProjectListNavigator
          :projects="projects"
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
  background-color: var(--p-red-50);
  color: var(--p-red-400);
}

.withinWeek {
  background-color: var(--p-gold-200);
}

.withinMonth {
  background-color: var(--p-bcblue-50);
}
</style>
