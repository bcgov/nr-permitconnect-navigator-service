<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Divider from '@/components/common/Divider.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import EnquiryListProponent from '@/components/projectCommon/enquiry/EnquiryListProponent.vue';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Button,
  Card,
  Dialog,
  useToast
} from '@/lib/primevue';
import { contactService, enquiryService, housingProjectService, noteService, permitService } from '@/services';
import { useAuthZStore, useProjectStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { UUID_V4_PATTERN } from '@/utils/constants/application';
import { RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/permit';
import { SubmissionType } from '@/utils/enums/projectCommon';
import { formatDate, formatDateLong } from '@/utils/formatters';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';

import type { ComputedRef, Ref } from 'vue';
import type { Contact, Permit } from '@/types';

// Types
type PermitFilterConfig = {
  permitNeeded?: string;
  permitStatus?: string;
  submitted?: boolean;
};

// Props
const { projectId } = defineProps<{
  projectId: string;
}>();

// Composables
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

// Store
const authZStore = useAuthZStore();
const projectStore = useProjectStore();
const { canNavigate } = storeToRefs(authZStore);
const { getNoteHistory, getPermits, getProject, getRelatedEnquiries } = storeToRefs(projectStore);

// State
const assignee: Ref<Contact | undefined> = ref(undefined);
const createdBy: Ref<Contact | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteHistoryVisible: Ref<boolean> = ref(false);

const permitsNeeded: ComputedRef<Array<Permit>> = computed(() => {
  return permitFilter({
    permitNeeded: PermitNeeded.YES,
    permitStatus: PermitStatus.NEW
  })
    .sort(permitNameSortFcn)
    .sort(permitBusinessSortFcn);
});
const permitsNotNeeded: ComputedRef<Array<Permit>> = computed(() => {
  return permitFilter({
    permitNeeded: PermitNeeded.NO
  })
    .sort(permitNameSortFcn)
    .sort(permitBusinessSortFcn);
});
const permitsSubmitted: ComputedRef<Array<Permit>> = computed(() => {
  return permitFilter({
    submitted: true
  })
    .sort(permitNameSortFcn)
    .sort(permitBusinessSortFcn);
});

// Providers
provide(enquiryRouteNameKey, RouteName.EXT_HOUSING_PROJECT_RELATED_ENQUIRY);
provide(navigationPermissionKey, NavigationPermission.EXT_HOUSING);

// Actions
function permitBusinessSortFcn(a: Permit, b: Permit) {
  return a.permitType.businessDomain > b.permitType.businessDomain ? 1 : -1;
}

function permitNameSortFcn(a: Permit, b: Permit) {
  return a.permitType.name > b.permitType.name ? 1 : -1;
}

function permitFilter(config: PermitFilterConfig) {
  const { permitNeeded, permitStatus, submitted } = config;
  const permits = getPermits.value;
  let returnArray: Array<any> = permits;

  if (permitNeeded) {
    returnArray = returnArray.filter((p) => p.needed === permitNeeded);
  }

  if (permitStatus) {
    returnArray = returnArray.filter((p) => p.status === permitStatus);
  }

  if (submitted) {
    returnArray = returnArray.filter((p) => {
      return p.authStatus !== PermitAuthorizationStatus.NONE && p.status !== PermitStatus.NEW;
    });
  }

  return returnArray as Array<Permit>;
}

function navigateToSubmissionIntakeView() {
  router.push({
    name: RouteName.EXT_HOUSING_PROJECT_INTAKE,
    params: { projectId }
  });
}

onBeforeMount(async () => {
  let enquiriesValue, projectValue: any;

  try {
    projectValue = (await housingProjectService.getProject(projectId)).data;
    if (projectValue) enquiriesValue = (await enquiryService.listRelatedEnquiries(projectValue.activityId)).data;
  } catch {
    toast.error(t('e.common.projectView.toastProjectLoadFailed'));
    router.replace({ name: RouteName.EXT_HOUSING });
  }

  try {
    const activityId = projectValue.activityId;
    const permitsValue = (await permitService.listPermits({ activityId, includeNotes: true })).data;
    projectStore.setPermits(permitsValue);
  } catch {
    toast.error(t('e.common.projectView.toastPermitLoadFailed'));
  }

  try {
    const activityId = projectValue.activityId;
    const noteHistory = (await noteService.listNoteHistory(activityId)).data;
    projectStore.setNoteHistory(noteHistory);
  } catch {
    toast.error(t('e.common.projectView.toastNoteHistoryLoadFailed'));
  }

  projectStore.setProject(projectValue);
  projectStore.setRelatedEnquiries(enquiriesValue);

  // Fetch contacts for createdBy and assignedUserId
  // Push only thruthy values into the array
  const userIds = [projectValue?.assignedUserId, projectValue?.createdBy]
    .filter(Boolean)
    .filter((x) => !UUID_V4_PATTERN.test(x));
  const contacts = (await contactService.searchContacts({ userId: userIds })).data;
  assignee.value = contacts.find((contact: Contact) => contact.userId === projectValue?.assignedUserId);
  createdBy.value = contacts.find((contact: Contact) => contact.userId === projectValue?.createdBy);

  loading.value = false;
});
</script>

<template>
  <div
    v-if="!loading && getProject"
    class="app-primary-color"
  >
    <div class="disclaimer-block p-8 mt-8">
      {{ t('e.common.projectView.disclaimer') }}
    </div>
    <div class="mt-20 flex justify-between">
      <div>
        <h1
          v-if="canNavigate(NavigationPermission.EXT_HOUSING)"
          class="mt-0 mb-2 cursor-pointer hover:underline"
          tabindex="0"
          @click="navigateToSubmissionIntakeView()"
          @keydown.enter.prevent="navigateToSubmissionIntakeView()"
          @keydown.space.prevent="navigateToSubmissionIntakeView()"
        >
          {{ getProject.projectName }}
          <font-awesome-icon
            class="text-sm"
            icon="fa fa-external-link"
          />
        </h1>
        <h1
          v-else
          class="mt-0 mb-2"
        >
          {{ getProject.projectName }}
        </h1>
        <div>
          <span class="mr-4">
            Project ID:
            <span class="font-bold">{{ getProject.activityId }}</span>
          </span>
          <span class="mr-4">
            {{ t('e.common.projectView.createdBy') }}:
            <span
              v-if="createdBy"
              class="font-bold"
            >
              {{ createdBy?.firstName }} {{ createdBy?.lastName }}
            </span>
            <span v-else>-</span>
          </span>
          <span>
            Navigator:
            <span
              v-if="assignee"
              class="font-bold"
            >
              {{ assignee?.firstName }} {{ assignee?.lastName }}
            </span>
            <span v-else>-</span>
          </span>
        </div>
      </div>
      <Button
        v-if="
          canNavigate(NavigationPermission.EXT_HOUSING) && getProject?.submissionType !== SubmissionType.INAPPLICABLE
        "
        class="p-button-sm header-btn mt-3"
        label="Ask my Navigator"
        outlined
        @click="
          router.push({
            name: RouteName.EXT_HOUSING_PROJECT_ENQUIRY
          })
        "
      />
    </div>

    <div
      v-if="getNoteHistory.length"
      class="bg-[var(--p-green-100)] p-4"
    >
      <div class="grid grid-cols-6 gap-4 items-center">
        <div class="font-bold">Please be aware!</div>
        <div class="font-bold">
          Updated on {{ formatDate(getNoteHistory[0].updatedAt ?? getNoteHistory[0].createdAt) }}
        </div>
        <div class="col-span-3 font-bold truncate">{{ getNoteHistory[0].note[0].note }}</div>
        <div class="flex justify-end">
          <Button
            class="p-button-sm header-btn"
            label="View all"
            outlined
            @click="noteHistoryVisible = true"
          />
        </div>
      </div>
    </div>

    <div
      v-if="getProject?.submissionType === SubmissionType.INAPPLICABLE"
      class="inapplicable-block p-4 mt-12"
    >
      {{ t('e.housing.projectView.inapplicableSubmissionType') }}
    </div>
    <div>
      <h3 class="mb-8 mt-16">{{ t('e.common.projectView.recommendedPermits') }}</h3>
    </div>
    <div
      v-if="!permitsNeeded?.length"
      class="empty-block p-8 mb-2"
    >
      {{ t('e.common.projectView.recommendedPermitsDesc') }}
    </div>
    <Card
      v-for="permit in permitsNeeded"
      :key="permit.permitId"
      class="app-primary-color permit-card mb-2"
    >
      <template #content>
        <h5 class="m-0 p-0">{{ permit.permitType.name }}</h5>
      </template>
    </Card>
    <Accordion
      v-if="permitsNotNeeded?.length"
      class="app-primary-color"
      :value="undefined"
      collapse-icon="pi pi-chevron-up"
      expand-icon="pi pi-chevron-right"
    >
      <AccordionPanel value="0">
        <AccordionHeader>{{ t('e.common.projectView.notNeeded') }}</AccordionHeader>
        <AccordionContent>
          <div>
            {{ t('e.common.projectView.notNeededDesc') }}
          </div>
          <ul class="list-disc mt-4">
            <li
              v-for="permit in permitsNotNeeded"
              :key="permit.permitId"
              class="ml-12"
            >
              {{ permit.permitType.name }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <h3 class="mt-20 mb-8">{{ t('e.common.projectView.submittedApplications') }}</h3>
    <div
      v-if="!permitsSubmitted.length"
      class="empty-block p-8"
    >
      {{ t('e.common.projectView.submittedApplicationsDesc') }}
    </div>
    <router-link
      v-for="permit in permitsSubmitted"
      :id="permit.permitId"
      :key="permit.permitId"
      :to="{
        name: canNavigate(NavigationPermission.INT_HOUSING)
          ? RouteName.INT_HOUSING_PROJECT_PROPONENT_PERMIT
          : RouteName.EXT_HOUSING_PROJECT_PERMIT,
        params: { permitId: permit.permitId }
      }"
      @keydown.space.prevent="
        router.push({
          name: canNavigate(NavigationPermission.INT_HOUSING)
            ? RouteName.INT_HOUSING_PROJECT_PROPONENT_PERMIT
            : RouteName.EXT_HOUSING_PROJECT_PERMIT,
          params: { permitId: permit.permitId }
        })
      "
    >
      <Card class="permit-card--hover mb-4">
        <template #title>
          <div class="flex justify-between">
            <h5 class="m-0 app-primary-color cursor-pointer">{{ permit.permitType.name }}</h5>
            <font-awesome-icon
              class="ellipsis-icon"
              icon="fa fa-ellipsis"
            />
          </div>
          <Divider />
        </template>
        <template #content>
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 flex mb-4">
              <StatusPill
                class="mr-2"
                :auth-status="permit.authStatus"
              />
              <div v-if="permit.statusLastVerified">
                <span class="label-verified mr-1">{{ t('e.common.projectView.statusVerified') }}</span>
                <span class="label-date">{{ formatDate(permit.statusLastVerified) }}</span>
              </div>
              <div v-else>
                <span class="label-verified mr-1">{{ t('e.common.projectView.statusNotVerified') }}</span>
              </div>
            </div>
            <div class="col-span-3">
              <div class="label-field">{{ t('e.common.projectView.trackingId') }}</div>
              <div class="permit-data">
                {{ permit?.trackingId }}
              </div>
            </div>
            <div class="col-span-3">
              <div class="label-field">{{ t('e.common.projectView.agency') }}</div>
              <div class="permit-data">
                {{ permit?.permitType.agency }}
              </div>
            </div>
            <div class="col-span-6">
              <div class="label-field">{{ t('e.common.projectView.latestUpdates') }}</div>
              <div class="permit-data">
                {{ permit?.permitNote?.length ? permit?.permitNote[0].note : t('e.common.projectView.noUpdates') }}
              </div>
            </div>
          </div>
        </template>
      </Card>
    </router-link>
    <div>
      <div>
        <h3 class="mt-20 mb-8">{{ t('e.common.projectView.relatedEnquiries') }}</h3>
      </div>
      <EnquiryListProponent
        :loading="loading"
        :enquiries="getRelatedEnquiries"
        :project-id="projectId"
      />
    </div>
  </div>

  <Dialog
    v-model:visible="noteHistoryVisible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <span class="p-dialog-title">Please be aware!</span>
    </template>

    <div
      v-for="history of getNoteHistory"
      :key="history.noteHistoryId"
      class="mb-5"
    >
      <div class="flex flex-col">
        <div class="font-bold mb-1">{{ formatDateLong(history.createdAt) }}</div>
        <div class="font-bold">{{ history.title }}</div>
        <div>{{ history.note[0].note }}</div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}

.hover-underline:hover {
  text-decoration: underline;
}

.disclaimer-block {
  outline: solid 0.063rem $app-grey;
  border-radius: 0.5rem;
}

.ellipsis-icon {
  cursor: pointer;
  width: 1.5rem;
  color: #255a90;

  &:hover {
    color: #053662;
  }
}

.empty-block {
  background-color: $app-grey;
  border-radius: 0.5rem;
}

.header-btn {
  max-height: 2rem;
}

.inapplicable-block {
  background-color: $app-red-background;
  border-radius: 0.5rem;
  border-width: 0.063rem;
  border-style: solid;
  border-color: $app-red-border;
  color: $app-red-text;
}

.permit-card {
  border-color: var(--p-greyscale-100);
  border-style: solid;
  border-width: 0.063rem;
  box-shadow: 0.25rem 0.25rem 0.25rem 0rem $app-proj-black;
  &--hover:hover {
    background-color: $app-grey;
  }
}

.permit-data {
  overflow: auto;
  word-break: break-word;
  text-overflow: ellipsis;
}

.label-field {
  color: #474543;
  font-family: 'BC Sans';
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.label-date {
  color: #2d2d2d;
  font-family: 'BC Sans';
  font-size: 0.75rem;
  font-style: italic;
  font-weight: 700;
}

.label-verified {
  color: #474543;
  font-family: 'BC Sans';
  font-size: 0.75rem;
  font-style: italic;
  font-weight: 400;
}

:deep(.p-accordion-content) {
  padding: 4rem 4rem 4rem 4rem;
  border-style: none;
}

:deep(.p-accordion-header > a) {
  color: inherit;
  font-size: 1.1rem;
  text-decoration: none;
  padding: 1.5rem 2rem 1.5rem 2rem;
  border-top-style: none;
  border-left-style: none;
  border-right-style: none;
}

:deep(.p-accordion-tab) {
  border-color: var(--p-greyscale-100);
  border-style: solid;
  border-width: 1px;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.03);
}

:deep(:not(.p-accordion-tab-active) .p-accordion-header > a) {
  background-color: inherit;
}

:deep(.p-card-body) {
  padding: 1.5rem;
}

:deep(.p-card-content) {
  padding: 0rem;
}

:deep(.p-card:hover .p-card-title) {
  text-decoration: underline;
}
</style>
