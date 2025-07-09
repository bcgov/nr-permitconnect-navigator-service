<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthorizationStatusPill from '@/components/permit/AuthorizationStatusPill.vue';
import AuthorizationStatusDescriptionModal from '@/components/permit/AuthorizationStatusDescriptionModal.vue';
import { Button, Card, Timeline, useToast } from '@/lib/primevue';
import { useProjectStore, usePermitStore } from '@/store';
import { NavigationPermission, useAuthZStore } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitAuthorizationStatusDescriptions, PermitStatus } from '@/utils/enums/permit';
import { formatDate, formatDateLong } from '@/utils/formatters';

import { contactService, electrificationProjectService, permitService } from '@/services';

import type { Ref } from 'vue';
import type { User } from '@/types';

// Props
const { permitId, projectId } = defineProps<{
  permitId: string;
  projectId: string;
}>();

// Composables
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

// Constants
const complete = (trackerStatus: string) => ({
  class: 'stage-blue',
  iconClass: 'complete',
  iconString: 'fas fa-circle-check',
  text: trackerStatus
});
const crossedCirlce = (trackerStatus: string) => ({
  class: 'stage-grey',
  iconClass: 'crossed-circle',
  iconString: 'fa-solid fa-ban',
  text: trackerStatus
});
const current = (trackerStatus: string) => ({
  class: 'stage-blue text-current',
  iconClass: 'current',
  iconString: 'fa fa-circle-dot',
  text: trackerStatus
});
const empty = (trackerStatus: string) => ({
  class: 'stage-grey',
  iconClass: 'empty',
  iconString: 'fa fa-circle',
  text: trackerStatus
});
const previous = (trackerStatus: string) => ({
  class: 'stage-blue-opaque',
  iconClass: 'previous',
  iconString: 'fas fa-circle-check',
  text: trackerStatus
});

// Store
const authZStore = useAuthZStore();
const permitStore = usePermitStore();
const projectStore = useProjectStore();
const { canNavigate } = storeToRefs(authZStore);
const { getPermit } = storeToRefs(permitStore);
const { getProject } = storeToRefs(projectStore);

// State
const assignedNavigator: Ref<User | undefined> = ref(undefined);
const descriptionModalVisible: Ref<boolean> = ref(false);
const updatedBy: Ref<string | undefined> = ref(undefined);

const statusBoxStates = {
  [PermitAuthorizationStatus.ABANDONED]: {
    boxClass: 'grey',
    message: PermitAuthorizationStatusDescriptions.ABANDONED
  },
  [PermitAuthorizationStatus.CANCELLED]: {
    boxClass: 'red',
    message: PermitAuthorizationStatusDescriptions.CANCELLED
  },
  [PermitAuthorizationStatus.DENIED]: {
    boxClass: 'red',
    message: PermitAuthorizationStatusDescriptions.DENIED
  },
  [PermitAuthorizationStatus.ISSUED]: {
    boxClass: 'green',
    message: PermitAuthorizationStatusDescriptions.ISSUED
  },
  [PermitAuthorizationStatus.IN_REVIEW]: {
    boxClass: 'green',
    message: PermitAuthorizationStatusDescriptions.IN_REVIEW
  },
  [PermitAuthorizationStatus.NONE]: {
    boxClass: 'grey',
    message: PermitAuthorizationStatusDescriptions.NONE
  },
  [PermitAuthorizationStatus.PENDING]: {
    boxClass: 'yellow',
    message: PermitAuthorizationStatusDescriptions.PENDING
  },
  [PermitAuthorizationStatus.WITHDRAWN]: {
    boxClass: 'grey',
    message: PermitAuthorizationStatusDescriptions.WITHDRAWN
  }
};

const timelineStages = {
  [PermitStatus.APPLIED]: [
    current(PermitStatus.APPLIED),
    empty(PermitStatus.TECHNICAL_REVIEW),
    empty(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ],
  [PermitStatus.TECHNICAL_REVIEW]: [
    previous(PermitStatus.APPLIED),
    current(PermitStatus.TECHNICAL_REVIEW),
    empty(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ],
  [PermitStatus.PENDING]: [
    previous(PermitStatus.APPLIED),
    previous(PermitStatus.TECHNICAL_REVIEW),
    current(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ],
  [PermitStatus.COMPLETED]: [
    complete(PermitStatus.APPLIED),
    complete(PermitStatus.TECHNICAL_REVIEW),
    complete(PermitStatus.PENDING),
    complete(PermitStatus.COMPLETED)
  ],
  terminatedStatus: [
    crossedCirlce(PermitStatus.APPLIED),
    crossedCirlce(PermitStatus.TECHNICAL_REVIEW),
    crossedCirlce(PermitStatus.PENDING),
    crossedCirlce(PermitStatus.COMPLETED)
  ],
  emptyStatus: [
    empty(PermitStatus.APPLIED),
    empty(PermitStatus.TECHNICAL_REVIEW),
    empty(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ]
};

// Actions
function getStatusBoxState(authStatus: string | undefined) {
  return authStatus && authStatus in statusBoxStates
    ? statusBoxStates[authStatus as keyof typeof statusBoxStates]
    : { boxClass: 'grey', message: 'Status not available.' };
}

function getTimelineStage(authStatus: string | undefined, status: string | undefined) {
  if (
    authStatus === PermitAuthorizationStatus.ABANDONED ||
    authStatus === PermitAuthorizationStatus.CANCELLED ||
    authStatus === PermitAuthorizationStatus.WITHDRAWN
  ) {
    return timelineStages.terminatedStatus;
  }
  return status && status in timelineStages
    ? timelineStages[status as keyof typeof timelineStages]
    : timelineStages.terminatedStatus;
}

const timelineDescription = computed(() => (iconClass: string) => {
  switch (iconClass) {
    case previous('').iconClass:
      return 'Completed';
    case empty('').iconClass:
      return 'Not yet started';
    case current('').iconClass:
      return 'Current';
    default:
      return '';
  }
});

const hideTimelineFromScreenReader = computed(() => {
  return (
    getPermit?.value &&
    (getPermit.value.authStatus === PermitAuthorizationStatus.ABANDONED ||
      getPermit.value.authStatus === PermitAuthorizationStatus.CANCELLED ||
      getPermit.value.authStatus === PermitAuthorizationStatus.WITHDRAWN)
  );
});

onBeforeMount(async () => {
  try {
    const permitData = (await permitService.getPermit(permitId)).data;
    permitStore.setPermit(permitData);

    if (!getProject.value) {
      const submission = (await electrificationProjectService.getProject(projectId)).data;
      projectStore.setProject(submission);
    }

    if (getProject.value?.assignedUserId) {
      assignedNavigator.value = (
        await contactService.searchContacts({ userId: [getProject.value.assignedUserId] })
      ).data[0];
    }

    if (getPermit.value?.updatedBy) {
      const updatedByUser = (await contactService.searchContacts({ userId: [getPermit.value.updatedBy] })).data[0];
      updatedBy.value = updatedByUser.firstName + ' ' + updatedByUser.lastName;
    }
  } catch {
    toast.error('Unable to load permit or project, please try again later');
  }
});
</script>

<template>
  <div class="permit-status-view">
    <h1 class="permit-name">
      {{ getPermit?.permitType.name }}
    </h1>
    <div class="permit-info-block">
      <div class="permit-info">
        <div class="info-item">
          <b>Tracking ID:</b>
          <span>
            {{ getPermit?.permitTracking?.find((x) => x.shownToProponent)?.trackingId }}
          </span>
        </div>
        <div class="info-item">
          <b>Submitted date:</b>
          <span>
            {{ formatDate(getPermit?.submittedDate) }}
          </span>
        </div>
        <div class="info-item">
          <b>Permit ID:</b>
          <span>
            {{ getPermit?.issuedPermitId }}
          </span>
        </div>
        <div class="info-item">
          <b>Adjudication date:</b>
          <span>
            {{ formatDate(getPermit?.adjudicationDate) }}
          </span>
        </div>
      </div>
      <div class="info-item mt-6">
        <b>Agency:</b>
        <span>
          {{ getPermit?.permitType.agency }}
        </span>
      </div>
    </div>
    <div class="status-help">
      <font-awesome-icon
        class="status-description-icon"
        icon="fa-circle-question"
        aria-describedby="status-description"
        @click="descriptionModalVisible = true"
      />
      <span
        id="status-descriptions"
        class="status-description"
        tabindex="0"
        role="button"
        @click="descriptionModalVisible = true"
        @keydown.enter.prevent="descriptionModalVisible = true"
        @keydown.space.prevent="descriptionModalVisible = true"
      >
        {{ t('e.common.permitStatusView.statusDescriptionMeaning') }}
      </span>
    </div>
    <Card class="permit-tracker-card">
      <template #header>
        <div
          class="status-tracker-header py-4 px-6"
          :class="[getStatusBoxState(getPermit?.authStatus).boxClass]"
        >
          <AuthorizationStatusPill
            :auth-status="getPermit?.authStatus"
            :enlarge="true"
          />
          {{ getStatusBoxState(getPermit?.authStatus).message }}
        </div>
      </template>
      <template #content>
        <div class="application-progress-block">
          <div class="status-timeline">
            <h4
              class="mt-8 mb-6"
              :aria-hidden="hideTimelineFromScreenReader"
            >
              {{ t('e.common.permitStatusView.applicationProgress') }}
            </h4>
            <Timeline
              :value="getTimelineStage(getPermit?.authStatus, getPermit?.status)"
              layout="horizontal"
            >
              <template #marker="slotProps">
                <font-awesome-icon
                  :class="slotProps.item.iconClass"
                  :icon="slotProps.item.iconString"
                />
              </template>
              <template #content="slotProps">
                <div
                  class="timeline-content"
                  :class="slotProps.item.class"
                  role="note"
                  :aria-hidden="slotProps?.item?.iconClass == 'crossed-circle'"
                >
                  {{ slotProps.item.text }}
                </div>
                <!-- This component is to display status for screenreaders -->
                <div
                  role="definition"
                  class="screen-reader-only"
                >
                  {{ timelineDescription(slotProps?.item?.iconClass) }}
                </div>
              </template>
            </Timeline>
          </div>
          <div class="status-verified-message">
            <div v-if="updatedBy">
              <p class="verified-text my-0">
                {{ t('e.common.permitStatusView.statusLastVerified') }}
                {{ formatDate(getPermit?.statusLastVerified) }} by
                {{ updatedBy }}
              </p>
            </div>
            <div v-else>
              <p class="verified-text my-0">{{ t('e.common.permitStatusView.statusNotVerified') }}</p>
            </div>
          </div>
        </div>
      </template>
    </Card>
    <div class="updates-section">
      <h4 class="mb-6">{{ t('e.common.permitStatusView.additionalUpdates') }}</h4>
      <div
        v-if="canNavigate(NavigationPermission.EXT_ELECTRIFICATION)"
        class="ask-navigator mb-16"
      >
        <Button
          outlined
          :label="t('e.common.permitStatusView.askNav')"
          @click="
            router.push({
              name: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT_ENQUIRY,
              params: { permitId, projectId }
            })
          "
        />
        <p>{{ t('e.common.permitStatusView.contactNav') }}</p>
      </div>
      <div v-if="getPermit?.permitNote && getPermit.permitNote.length > 0">
        <div
          v-for="note in getPermit.permitNote"
          :key="note.permitNoteId"
          class="mb-6"
        >
          <p class="mb-2 mt-0 font-bold">{{ formatDateLong(note.createdAt) }}</p>
          <p class="mt-0">{{ note.note }}</p>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-500">{{ t('e.common.permitStatusView.noUpdates') }}</p>
      </div>
    </div>
  </div>
  <AuthorizationStatusDescriptionModal
    v-model:visible="descriptionModalVisible"
    dismissable-mask
  />
</template>

<style scoped lang="scss">
.complete {
  color: #1e5189;
  font-size: 2.5rem;
  & + :deep(.p-timeline-event-connector) {
    background-color: #1e5189;
  }
}

.crossed-circle {
  color: #e0dedc;
  font-size: 2.5rem;
  & + :deep(.p-timeline-event-connector) {
    background-color: #e0dedc;
  }
}

.current {
  color: #1e5189;
  font-size: 2.5rem;
  & + :deep(.p-timeline-event-connector) {
    background-color: #e0dedc;
  }
}

.empty {
  color: transparent;
  border: 0.094rem dashed #9f9d9c;
  border-radius: 50%;
  font-size: 2.5rem;
  & + :deep(.p-timeline-event-connector) {
    background-color: #e0dedc;
  }
}

.previous {
  color: #1e5189;
  font-size: 2.5rem;
  opacity: 0.5;
  & + :deep(.p-timeline-event-connector) {
    background-color: #1e5189;
    opacity: 0.5;
  }
}

.stage-blue {
  color: #1e5189;
}

.stage-blue-opaque {
  color: #1e5189;
  opacity: 0.5;
}

.stage-grey {
  color: #9f9d9c;
}

.application-progress-block {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.ask-navigator {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.permit-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  align-items: baseline;
}

.info-item {
  display: inline-flex;
  flex-wrap: nowrap;
}

.info-item b {
  white-space: nowrap;
  margin-right: 0.313rem;
}

.info-item span {
  word-break: break-word;
  overflow-wrap: break-word;
}

.permit-info p {
  margin: 0;
}

.permit-tracker-card {
  background: #fff;
  border: 0.063rem solid #efefef;
  border-radius: 0.25rem;
  box-shadow: 0rem 0.25rem 0.25rem 0rem rgba(0, 0, 0, 0.04);
  position: relative;
}

.permit-info-block {
  background: #fff;
  border: 0.063rem solid #efefef;
  border-radius: 0.25rem;
  box-shadow: none;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

:deep(.p-timeline-event-opposite) {
  display: none;
}

.status-description {
  color: $app-primary;
  cursor: pointer;
}

.status-description:hover {
  text-decoration: underline;
}

.status-description-icon {
  color: $app-primary;
  cursor: pointer;
}

.status-help {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 5rem;
  margin-bottom: 1rem;
  align-items: center;
}

.status-timeline {
  margin-bottom: 3.5rem;
}

.status-tracker-header {
  align-items: center;
  border-radius: 0.25rem;
  background: #fafafa;
  box-shadow: 0rem 0.25rem 0.25rem 0rem rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 0.5rem;
}

.text-current {
  font-weight: 700;
}

.timeline-content {
  white-space: nowrap;
  word-break: keep-all;
}

.updates-section {
  border-radius: 0.25rem;
  background: #fafafa;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3.5rem;
  padding-bottom: 4rem;
}

.verified-text {
  color: #606060;
}
</style>
