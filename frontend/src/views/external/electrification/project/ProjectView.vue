<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Divider from '@/components/common/Divider.vue';
import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import EnquiryListProponent from '@/components/projectCommon/enquiry/EnquiryListProponent.vue';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel, Button, Card, useToast } from '@/lib/primevue';
import { contactService, enquiryService, electrificationProjectService, permitService } from '@/services';
import { useAuthZStore, useProjectStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { UUID_V4_PATTERN } from '@/utils/constants/application';
import { RouteName } from '@/utils/enums/application';
import { SubmissionType } from '@/utils/enums/projectCommon';
import { formatDate } from '@/utils/formatters';
import { enquiryRouteNameKey, navigationPermissionKey } from '@/utils/keys';

import type { Ref } from 'vue';
import type { Contact } from '@/types';

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
const { getAuthsNeeded, getAuthsNotNeeded, getAuthsSubmitted, getProject, getRelatedEnquiries } =
  storeToRefs(projectStore);

// State
const assignee: Ref<Contact | undefined> = ref(undefined);
const createdBy: Ref<Contact | undefined> = ref(undefined);
const loading: Ref<boolean> = ref(true);

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
          v-if="canNavigate(NavigationPermission.EXT_ELECTRIFICATION)"
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
          canNavigate(NavigationPermission.EXT_ELECTRIFICATION) &&
          getProject?.submissionType !== SubmissionType.INAPPLICABLE
        "
        class="p-button-sm header-btn mt-3"
        label="Ask my Navigator"
        outlined
        @click="
          router.push({
            name: RouteName.EXT_ELECTRIFICATION_PROJECT_ENQUIRY
          })
        "
      />
    </div>

    <div
      v-if="getProject?.submissionType === SubmissionType.INAPPLICABLE"
      class="inapplicable-block p-4 mt-12"
    >
      {{ t('e.electrification.projectView.inapplicableSubmissionType') }}
    </div>
    <div>
      <h3 class="mb-8 mt-16">{{ t('e.common.projectView.recommendedPermits') }}</h3>
    </div>
    <div
      v-if="!getAuthsNeeded?.length"
      class="empty-block p-8 mb-2"
    >
      {{ t('e.common.projectView.recommendedPermitsDesc') }}
    </div>
    <Card
      v-for="permit in getAuthsNeeded"
      :key="permit.permitId"
      class="app-primary-color permit-card mb-2"
    >
      <template #content>
        <h5 class="m-0 p-0">{{ permit.permitType.name }}</h5>
      </template>
    </Card>
    <Accordion
      v-if="getAuthsNotNeeded?.length"
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
              v-for="permit in getAuthsNotNeeded"
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
      v-if="!getAuthsSubmitted.length"
      class="empty-block p-8"
    >
      {{ t('e.common.projectView.submittedApplicationsDesc') }}
    </div>
    <router-link
      v-for="permit in getAuthsSubmitted"
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
              <AuthorizationStatusPill
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
                {{ permit?.permitTracking?.find((x) => x.shownToProponent)?.trackingId }}
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
