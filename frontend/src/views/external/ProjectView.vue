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
import RelatedEnquiryListProponent from '@/components/enquiry/RelatedEnquiryListProponent.vue';
import ProjectTeamTab from '@/components/projectCommon/ProjectTeamTab.vue';
import { Button, Tab, TabList, TabPanel, TabPanels, Tabs, useToast } from '@/lib/primevue';
import {
  activityContactService,
  contactService,
  electrificationProjectService,
  enquiryService,
  housingProjectService,
  noteHistoryService,
  permitService
} from '@/services';
import { useAppStore, useAuthZStore, useContactStore, useProjectStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { UUID_V4_PATTERN } from '@/utils/constants/application';
import { Initiative, RouteName } from '@/utils/enums/application';
import { ActivityContactRole, SubmissionType } from '@/utils/enums/projectCommon';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';
import { generalErrorHandler, isDefined } from '@/utils/utils';

import type { Ref } from 'vue';
import type { Contact, ElectrificationProject, Enquiry, HousingProject } from '@/types';
import type { IProjectService } from '@/interfaces/IProjectService';

// Props
const { initialTab = '0', projectId } = defineProps<{
  initialTab?: string;
  projectId: string;
}>();

// Interfaces
interface InitiativeState {
  enquiryProjectRouteName: RouteName;
  initiativeRouteName: RouteName;
  internalNavigationPermission: NavigationPermission;
  internalProjectProponentAuthorizationRouteName: RouteName;
  projectAuthorizationRouteName: RouteName;
  projectIntakeRouteName: RouteName;
  projectService: IProjectService;
  provideEnquiryRouteName?: RouteName;
  provideNavigationPermission: NavigationPermission;
}

// Constants
const ELECTRIFICATION_VIEW_STATE: InitiativeState = {
  enquiryProjectRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_ENQUIRY,
  initiativeRouteName: RouteName.EXT_ELECTRIFICATION,
  internalNavigationPermission: NavigationPermission.INT_ELECTRIFICATION,
  internalProjectProponentAuthorizationRouteName: RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT_PERMIT,
  projectAuthorizationRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT,
  projectIntakeRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_INTAKE,
  projectService: electrificationProjectService,
  provideNavigationPermission: NavigationPermission.EXT_ELECTRIFICATION,
  provideEnquiryRouteName: RouteName.EXT_ELECTRIFICATION_PROJECT_RELATED_ENQUIRY
};

const HOUSING_VIEW_STATE: InitiativeState = {
  enquiryProjectRouteName: RouteName.EXT_HOUSING_PROJECT_ENQUIRY,
  initiativeRouteName: RouteName.EXT_HOUSING,
  internalNavigationPermission: NavigationPermission.INT_HOUSING,
  internalProjectProponentAuthorizationRouteName: RouteName.INT_HOUSING_PROJECT_PROPONENT_PERMIT,
  projectAuthorizationRouteName: RouteName.EXT_HOUSING_PROJECT_PERMIT,
  projectIntakeRouteName: RouteName.EXT_HOUSING_PROJECT_INTAKE,
  projectService: housingProjectService,
  provideNavigationPermission: NavigationPermission.EXT_HOUSING,
  provideEnquiryRouteName: RouteName.EXT_HOUSING_PROJECT_RELATED_ENQUIRY
};

// Composables
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

// Store
const { getInitiative } = storeToRefs(useAppStore());
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
const initiativeState: Ref<InitiativeState> = ref(HOUSING_VIEW_STATE);
const isAdmin: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(true);
const noteHistoryVisible: Ref<boolean> = ref(false);

// Providers
const provideEnquiryRouteName = computed(() => initiativeState.value.provideEnquiryRouteName);
const provideNavigationPermission = computed(() => initiativeState.value.provideNavigationPermission);
provide(enquiryRouteNameKey, provideEnquiryRouteName);
provide(navigationPermissionKey, provideNavigationPermission);

// Actions
function navigateToSubmissionIntakeView() {
  router.push({
    name: initiativeState.value.projectIntakeRouteName,
    params: { projectId }
  });
}

const assigneeName: Ref<string> = computed(() => {
  return assignee.value?.firstName
    ? `${assignee.value.firstName} ${assignee.value?.lastName}`
    : t('views.e.projectView.toBeAssigned');
});

const createdByName: Ref<string> = computed(() => {
  return createdBy.value?.firstName ? `${createdBy.value.firstName} ${createdBy.value?.lastName}` : '';
});

onBeforeMount(async () => {
  try {
    switch (getInitiative.value) {
      case Initiative.ELECTRIFICATION:
        initiativeState.value = ELECTRIFICATION_VIEW_STATE;
        break;
      case Initiative.HOUSING:
        initiativeState.value = HOUSING_VIEW_STATE;
        break;
      default:
        throw new Error(t('views.initiativeStateError'));
    }

    let enquiriesValue: Enquiry[] | undefined = undefined;
    let projectValue: HousingProject | ElectrificationProject;

    try {
      projectValue = (await initiativeState.value.projectService.getProject(projectId)).data;
      if (projectValue) enquiriesValue = (await enquiryService.listRelatedEnquiries(projectValue.activityId)).data;
    } catch {
      toast.error(t('views.e.projectView.toastProjectLoadFailed'));
      router.replace({ name: initiativeState.value.initiativeRouteName });
      return;
    }

    try {
      const activityId = projectValue.activityId;
      const permitsValue = (await permitService.listPermits({ activityId, includeNotes: true })).data;
      projectStore.setPermits(permitsValue);
    } catch {
      throw new Error(t('views.e.projectView.toastPermitLoadFailed'));
    }

    try {
      const activityId = projectValue.activityId;
      const noteHistory = (await noteHistoryService.listNoteHistories(activityId)).data;
      projectStore.setNoteHistory(noteHistory);
    } catch {
      throw new Error(t('views.e.projectView.toastNoteHistoryLoadFailed'));
    }

    projectStore.setProject(projectValue);
    projectStore.setRelatedEnquiries(enquiriesValue ?? []);

    // Fetch contacts for createdBy and assignedUserId
    // Push only defined values into the array
    const userIds = [projectValue.assignedUserId, projectValue.createdBy]
      .filter(isDefined)
      .filter((x) => !UUID_V4_PATTERN.test(x!));
    const contacts = (await contactService.searchContacts({ userId: userIds })).data;
    assignee.value = contacts.find(
      (contact: Contact) => contact.userId && contact.userId === projectValue?.assignedUserId
    );
    createdBy.value = contacts.find((contact: Contact) => contact.userId === projectValue?.createdBy);

    const activityContacts = (await activityContactService.listActivityContacts(projectValue.activityId)).data;
    projectStore.setActivityContacts(activityContacts);

    // Determine if the current user has admin priviledges
    const userActivityRole = activityContacts.find(
      (x) => x.contactId === useContactStore().getContact?.contactId
    )?.role;
    if (userActivityRole)
      isAdmin.value = [ActivityContactRole.PRIMARY, ActivityContactRole.ADMIN].includes(userActivityRole);

    loading.value = false;
  } catch (e) {
    generalErrorHandler(e);
  }
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
          v-if="canNavigate(provideNavigationPermission) && getProject?.submissionType !== SubmissionType.INAPPLICABLE"
          class="p-button-sm header-btn mt-3"
          :label="t('views.e.projectView.askMyNavigator')"
          @click="
            router.push({
              name: initiativeState.enquiryProjectRouteName
            })
          "
        >
          <AskMyNavigator />
          {{ t('views.e.projectView.askMyNavigator') }}
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
            {{ t('views.e.projectView.tabAuthorizations') }}
          </Tab>
          <Tab :value="1">
            <font-awesome-icon
              class="mr-2 ellipsis-icon"
              icon="fa-solid fa-file-circle-question"
            />
            {{ t('views.e.projectView.tabRelatedEnquiries') }}
          </Tab>
          <Tab
            v-if="isAdmin"
            :value="2"
          >
            <font-awesome-icon
              class="mr-2 ellipsis-icon"
              icon="fa-solid fa-user-group"
            />
            {{ t('views.e.projectView.tabProjectTeam') }}
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
            <NoteBanner
              v-if="getNoteHistoryShownToProponent[0]?.note[0]"
              :note="getNoteHistoryShownToProponent[0].note[0]"
              @note-banner:show-history="noteHistoryVisible = true"
            />
            <div class="disclaimer-block p-8 mt-8">
              {{ t('views.e.projectView.disclaimer') }}
            </div>
            <div>
              <h3 class="mb-8 mt-16">{{ t('views.e.projectView.requiredAuths') }} ({{ getAuthsNeeded?.length }})</h3>
            </div>
            <div
              v-if="!getAuthsNeeded?.length"
              class="empty-block p-8 mb-2"
            >
              {{ t('views.e.projectView.requiredAuthsEmpty') }}
            </div>
            <RequiredAuths
              v-if="getAuthsNeeded?.length"
              :auths-needed="getAuthsNeeded"
              :auths-not-needed="getAuthsNotNeeded"
            />
            <h3 class="mt-20 mb-8">{{ t('views.e.projectView.ongoingAuths') }}</h3>

            <router-link
              v-for="permit in getAuthsOnGoing"
              :id="permit.permitId"
              :key="permit.permitId"
              :to="{
                name: canNavigate(initiativeState.internalNavigationPermission)
                  ? initiativeState.internalProjectProponentAuthorizationRouteName
                  : initiativeState.projectAuthorizationRouteName,
                params: { permitId: permit.permitId }
              }"
              @keydown.space.prevent="
                router.push({
                  name: canNavigate(initiativeState.internalNavigationPermission)
                    ? initiativeState.internalProjectProponentAuthorizationRouteName
                    : initiativeState.projectAuthorizationRouteName,
                  params: { permitId: permit.permitId }
                })
              "
            >
              <AuthorizationCardProponent :permit="permit" />
            </router-link>
            <div class="empty-block p-8 mb-20">
              {{ t('views.e.projectView.missingAuth') }}
            </div>
            <h3 class="mt-20 mb-8">{{ t('views.e.projectView.completedAuths') }}</h3>
            <div
              v-if="!getAuthsCompleted?.length"
              class="empty-block p-8 mb-2"
            >
              {{ t('views.e.projectView.emptyCompletedAuths') }}
            </div>
            <router-link
              v-for="permit in getAuthsCompleted"
              :id="permit.permitId"
              :key="permit.permitId"
              :to="{
                name: canNavigate(initiativeState.internalNavigationPermission)
                  ? initiativeState.internalProjectProponentAuthorizationRouteName
                  : initiativeState.projectAuthorizationRouteName,
                params: { permitId: permit.permitId }
              }"
              @keydown.space.prevent="
                router.push({
                  name: canNavigate(initiativeState.internalNavigationPermission)
                    ? initiativeState.internalProjectProponentAuthorizationRouteName
                    : initiativeState.projectAuthorizationRouteName,
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
                {{ t('views.e.projectView.relatedEnquiriesDesc') }}
              </div>
              <RelatedEnquiryListProponent
                :loading="loading"
                :enquiries="getRelatedEnquiries"
                :project-id="projectId"
              />
            </div>
          </TabPanel>
          <TabPanel
            v-if="isAdmin"
            :value="2"
          >
            <ProjectTeamTab
              v-if="projectStore.getProject"
              :activity-id="projectStore.getProject.activityId"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <ShownToProponentModal
      v-model:visible="noteHistoryVisible"
      :note-history="getNoteHistoryShownToProponent"
    />
  </div>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
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
