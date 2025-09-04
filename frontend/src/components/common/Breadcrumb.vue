<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Breadcrumb } from '@/lib/primevue';
import { useEnquiryStore, usePermitStore, useProjectStore } from '@/store';
import { RouteName } from '@/utils/enums/application';

import type { MenuItem } from 'primevue/menuitem';
import type { ComputedRef } from 'vue';
import type { RouteLocationMatched, RouteRecordNameGeneric, RouteRecordRaw } from 'vue-router';

// Composables
const enquiryStore = useEnquiryStore();
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const route = useRoute();

// Store
const { getEnquiry } = storeToRefs(enquiryStore);
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// State
const breadcrumbItems: ComputedRef<Array<MenuItem>> = computed(() => {
  if (route.meta.hideBreadcrumb) return [];
  const matchedCrumbs = route.matched.filter((m) => m.meta?.breadcrumb !== undefined || m.meta?.dynamicBreadcrumb);

  return matchedCrumbs.map((record, index) => {
    const isLast = index === matchedCrumbs.length - 1;
    let label = generateBreadcrumbLabel(record);
    let tooltip = '';

    if (!isLast && label?.length > 10 && record.meta.dynamicBreadcrumb && label !== 'Missing Label') {
      tooltip = label;
      label = label.substring(0, 10) + '...';
    }

    return {
      label,
      tooltip,
      to: !isLast ? generateToObject(record) : null
    };
  });
});

// Actions
function generateBreadcrumbLabel(routeRecord: RouteLocationMatched): string {
  const dynamicBreadcrumb = routeRecord.meta.dynamicBreadcrumb as string;
  if (dynamicBreadcrumb) {
    switch (dynamicBreadcrumb) {
      case 'project': {
        const project = getProject;
        if (project.value) {
          return project.value.projectName;
        } else {
          return '...Loading';
        }
      }
      case 'enquiry': {
        const enquiry = getEnquiry;
        if (enquiry.value) {
          const activityId = enquiry.value.activityId;
          return `Enquiry ${activityId}`;
        } else {
          return '...Loading';
        }
      }
      case 'permit': {
        const permit = getPermit;
        if (permit.value) {
          return permit.value.permitType.name;
        } else {
          return '...Loading';
        }
      }
      case 'authorization': {
        const permit = getPermit;
        if (permit.value) {
          return permit.value.permitType.name;
        } else {
          return 'Add authorization';
        }
      }
      case 'note': {
        // Try to determine where to get the note history from
        let noteHistory = useProjectStore().getNoteHistoryById(route.params.noteHistoryId as string);
        if (!noteHistory) noteHistory = useEnquiryStore().getNoteHistoryById(route.params.noteHistoryId as string);
        if (noteHistory) {
          return noteHistory.title;
        } else {
          return 'Add note';
        }
      }
      default:
        return 'Missing Label';
    }
  }
  return routeRecord.meta.breadcrumb as string;
}

function generateToObject(record: RouteLocationMatched) {
  let toName: RouteRecordNameGeneric;

  // If record has no name then the empty nested child/grandchild will define the route name
  if (!record.name && record.children[0]) {
    toName = getRouteNameFromFirstChild(record.children[0]);
  } else {
    toName = record.name;
  }

  const toObject = {
    name: toName,
    // Note: Params not needed
    // Breacrumb always navigates backwards so required params are present in router
    // If navigation leads to different part of router tree without needed params
    // The breadcrumbs will reflect that and not show link back to previous view/route
    query: route.query,
    hash: route.hash
  };
  return toObject;
}

// Recursively find a empty nested child path
function getRouteNameFromFirstChild(record: RouteRecordRaw) {
  if (record.name) {
    return record.name;
  } else if (record.children?.[0]) {
    return getRouteNameFromFirstChild(record.children[0]);
  } else {
    // Route name not found case
    return RouteName.HOME;
  }
}
</script>

<template>
  <Breadcrumb
    v-if="breadcrumbItems.length > 1"
    :model="breadcrumbItems"
  >
    <template #separator>/</template>
    <template #item="{ item }">
      <router-link
        v-if="item.to"
        class="breadcrumb-link"
        :to="item.to"
      >
        <span v-tooltip.bottom="item.tooltip">
          <span v-tooltip.focus.bottom="item.tooltip">
            {{ item.label }}
          </span>
        </span>
      </router-link>
      <span
        v-else
        class="breadcrumb-current"
      >
        {{ item.label }}
      </span>
    </template>
  </Breadcrumb>
</template>

<style scoped lang="scss">
.p-breadcrumb {
  border: none;
  padding: 0.125rem;
}

.p-breadcrumb {
  border: none;
  padding: 0.125rem;
}

.breadcrumb-link {
  color: #255a90;
  font-family: 'BC Sans', sans-serif;
  font-weight: normal;
  text-decoration: none;
}
.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: #2d2d2d;
  font-family: 'BC Sans', sans-serif;
  font-weight: bold;
}
</style>
