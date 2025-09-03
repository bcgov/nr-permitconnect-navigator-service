<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AuthorizationCardLite from '@/components/authorization/AuthorizationCardLite.vue';
import AuthorizationCardProponent from '@/components/authorization/AuthorizationCardProponent.vue';
import RequiredAuths from '@/components/authorization/RequiredAuths.vue';
import { AskMyNavigator } from '@/components/common/icons';
import NoteBanner from '@/components/note/NoteBanner.vue';
import ShownToProponentModal from '@/components/note/ShownToProponentModal.vue';
import BasicProjectInfoCard from '@/components/projectCommon/BasicProjectInfoCard.vue';
import RelatedEnquiryListProponent from '@/components/projectCommon/enquiry/RelatedEnquiryListProponent.vue';
import { Button, Tab, TabList, TabPanel, TabPanels, Tabs, useToast } from '@/lib/primevue';
import {
  contactService,
  enquiryService,
  electrificationProjectService,
  noteHistoryService,
  permitService
} from '@/services';
import { useAuthZStore, useProjectStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { UUID_V4_PATTERN } from '@/utils/constants/application';
import { RouteName } from '@/utils/enums/application';
import { SubmissionType } from '@/utils/enums/projectCommon';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

// Props
const { initialTab = '0', projectId } = defineProps<{
  initialTab?: string;
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
const {
  getAuthsCompleted,
  getAuthsNeeded,
  getAuthsNotNeeded,
  getAuthsOnGoing,
  getNoteHistoryShownToProponent,
  getProject,
  getRelatedEnquiries
} = storeToRefs(projectStore);

// State
const activeTab: Ref<number> = ref(Number(initialTab));
const assignee: Ref<Contact | undefined> = ref(undefined);
const createdBy: Ref<Contact | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);
const noteHistoryVisible: Ref<boolean> = ref(false);

// Providers
provide(enquiryRouteNameKey, RouteName.EXT_ELECTRIFICATION_PROJECT_RELATED_ENQUIRY);
provide(navigationPermissionKey, NavigationPermission.EXT_ELECTRIFICATION);

// Actions
function navigateToSubmissionIntakeView() {
  router.push({
    name: RouteName.EXT_ELECTRIFICATION_PROJECT_INTAKE,
    params: { projectId }
  });
}

const assigneeName: Ref<string> = computed(() => {
  return assignee.value?.firstName
    ? `${assignee.value.firstName} ${assignee.value?.lastName}`
    : t('e.common.projectView.toBeAssigned');
});

const createdByName: Ref<string> = computed(() => {
  return createdBy.value?.firstName ? `${createdBy.value.firstName} ${createdBy.value?.lastName}` : '';
});

onBeforeMount(async () => {
  let enquiriesValue, projectValue: any;

  try {
    projectValue = (await electrificationProjectService.getProject(projectId)).data;

    if (projectValue) enquiriesValue = (await enquiryService.listRelatedEnquiries(projectValue.activityId)).data;
  } catch {
    toast.error(t('e.common.projectView.toastProjectLoadFailed'));
    router.replace({ name: RouteName.EXT_ELECTRIFICATION });
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
    const noteHistory = (await noteHistoryService.listNoteHistories(activityId)).data;
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
  assignee.value = contacts.find(
    (contact: Contact) => contact.userId && contact.userId === projectValue?.assignedUserId
  );
  createdBy.value = contacts.find((contact: Contact) => contact.userId === projectValue?.createdBy);

  loading.value = false;
});
</script>

<template>
  <div>
    <div
      v-if="!loading && getProject"
      class="app-primary-color"
    >
      <div class="mt-10 flex justify-between">
        <div>
          <h1 class="mt-0 mb-2">
            {{ getProject.projectName }}
          </h1>
        </div>
        <Button
          v-if="
            canNavigate(NavigationPermission.EXT_ELECTRIFICATION) &&
            getProject?.submissionType !== SubmissionType.INAPPLICABLE
          "
          class="p-button-sm header-btn mt-3"
          :label="t('e.common.projectView.askMyNavigator')"
          @click="
            router.push({
              name: RouteName.EXT_ELECTRIFICATION_PROJECT_ENQUIRY
            })
          "
        >
          <AskMyNavigator />
          {{ t('e.common.projectView.askMyNavigator') }}
        </Button>
      </div>

      <Tabs
        :value="activeTab"
        class="mt-3"
      >
        <TabList>
          <Tab :value="0">
            <font-awesome-icon
              class="mr-2 ellipsis-icon"
              icon="fa-solid fa-file"
            />
            {{ t('e.common.projectView.tabAuthorizations') }}
          </Tab>
          <Tab :value="1">
            <font-awesome-icon
              class="mr-2 ellipsis-icon"
              icon="fa-solid fa-file-circle-question"
            />
            {{ t('i.common.projectView.tabRelatedEnquiries') }}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel :value="0">
            <BasicProjectInfoCard
              :assignee="assigneeName"
              :created-by="createdByName"
              :activity-id="getProject.activityId"
              @basic-project-info-card:navigate-to-submission-intake-view="navigateToSubmissionIntakeView"
            />

    <Tabs
      :value="activeTab"
      class="mt-3"
    >
      <TabList>
        <Tab :value="0">
          <font-awesome-icon
            class="mr-2 ellipsis-icon"
            icon="fa-solid fa-file"
          />
          {{ t('e.common.projectView.tabAuthorizations') }}
        </Tab>
        <Tab :value="1">
          <font-awesome-icon
            class="mr-2 ellipsis-icon"
            icon="fa-solid fa-file-circle-question"
          />
          {{ t('i.common.projectView.tabRelatedEnquiries') }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel :value="0">
          <BasicProjectInfoCard
            :assignee="assigneeName"
            :created-by="createdByName"
            :activity-id="getProject.activityId"
            @basic-project-info:navigate-to-submission-intake-view="navigateToSubmissionIntakeView"
          />
          <NoteBanner
            v-if="getNoteHistoryShownToProponent.length"
            :note="getNoteHistoryShownToProponent[0].note[0]"
            @note-banner:show-history="noteHistoryVisible = true"
          />
          <div class="disclaimer-block p-8 mt-8">
            {{ t('e.common.projectView.disclaimer') }}
          </div>

            <div>
              <h3 class="mb-8 mt-16">{{ t('e.common.projectView.requiredAuths') }} ({{ getAuthsNeeded?.length }})</h3>
            </div>
            <div
              v-if="!getAuthsNeeded?.length"
              class="empty-block p-8 mb-2"
            >
              {{ t('e.common.projectView.requiredAuthsEmpty') }}
            </div>
            <RequiredAuths
              v-if="getAuthsNeeded?.length"
              :auths-needed="getAuthsNeeded"
              :auths-not-needed="getAuthsNotNeeded"
            />
            <h3 class="mt-20 mb-8">{{ t('e.common.projectView.ongoingAuths') }}</h3>

            <router-link
              v-for="permit in getAuthsOnGoing"
              :id="permit.permitId"
              :key="permit.permitId"
              :to="{
                name: canNavigate(NavigationPermission.INT_ELECTRIFICATION)
                  ? RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT_PERMIT
                  : RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT,
                params: { permitId: permit.permitId }
              }"
              @keydown.space.prevent="
                router.push({
                  name: canNavigate(NavigationPermission.INT_ELECTRIFICATION)
                    ? RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT_PERMIT
                    : RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT,
                  params: { permitId: permit.permitId }
                })
              "
            >
              <AuthorizationCardProponent :permit="permit" />
            </router-link>
            <div class="empty-block p-8 mb-20">
              {{ t('e.common.projectView.missingAuth') }}
            </div>
            <h3 class="mt-20 mb-8">{{ t('e.common.projectView.completedAuths') }}</h3>
            <div
              v-if="!getAuthsCompleted?.length"
              class="empty-block p-8 mb-2"
            >
              {{ t('e.common.projectView.emptyCompletedAuths') }}
            </div>
            <router-link
              v-for="permit in getAuthsCompleted"
              :id="permit.permitId"
              :key="permit.permitId"
              :to="{
                name: canNavigate(NavigationPermission.INT_ELECTRIFICATION)
                  ? RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT_PERMIT
                  : RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT,
                params: { permitId: permit.permitId }
              }"
              @keydown.space.prevent="
                router.push({
                  name: canNavigate(NavigationPermission.INT_ELECTRIFICATION)
                    ? RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT_PERMIT
                    : RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT,
                  params: { permitId: permit.permitId }
                })
              "
            >
              <AuthorizationCardLite :permit="permit" />
            </router-link>
          </TabPanel>

          <TabPanel :value="1">
            <div>
              <div class="disclaimer-block p-8 mt-4 mb-8">
                {{ t('e.common.projectView.relatedEnquiriesDesc') }}
              </div>
              <RelatedEnquiryListProponent
                :loading="loading"
                :enquiries="getRelatedEnquiries"
                :project-id="projectId"
              />
            </div>
            <RelatedEnquiryListProponent
              :loading="loading"
              :enquiries="getRelatedEnquiries"
              :project-id="projectId"
            />
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
  <ShownToProponentModal
    v-model:visible="noteHistoryVisible"
    :note-history="getNoteHistoryShownToProponent"
  />
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
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
  background-color: var(--p-bcblue-50);
  border-radius: 0.5rem;
}

.header-btn {
  max-height: 2rem;
}
</style>
