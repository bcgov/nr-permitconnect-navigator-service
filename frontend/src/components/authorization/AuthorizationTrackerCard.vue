<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatDate } from '@/utils/formatters';
import { PermitAuthorizationStatus, PermitAuthorizationStatusDescriptions, PermitStatus } from '@/utils/enums/permit';
import { Card, Timeline } from '@/lib/primevue';
import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import AuthorizationStatusDescriptionModal from '@/components/authorization/AuthorizationStatusDescriptionModal.vue';
import { formatDateTime } from '@/utils/formatters';
import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Composables
const { t } = useI18n();

// Constants
const complete = (trackerStatus: string) => ({
  class: 'stage-blue',
  iconClass: 'complete',
  iconString: 'fas fa-circle-check',
  text: trackerStatus
});
const crossedCircle = (trackerStatus: string) => ({
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

// State
const descriptionModalVisible: Ref<boolean> = ref(false);
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
  emptyStatus: [
    empty(PermitStatus.APPLIED),
    empty(PermitStatus.TECHNICAL_REVIEW),
    empty(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ]
};

const terminatedTimelineStages = {
  [PermitStatus.APPLIED]: [
    current(PermitStatus.APPLIED),
    crossedCircle(PermitStatus.TECHNICAL_REVIEW),
    crossedCircle(PermitStatus.PENDING),
    crossedCircle(PermitStatus.COMPLETED)
  ],
  [PermitStatus.TECHNICAL_REVIEW]: [
    previous(PermitStatus.APPLIED),
    current(PermitStatus.TECHNICAL_REVIEW),
    crossedCircle(PermitStatus.PENDING),
    crossedCircle(PermitStatus.COMPLETED)
  ],
  [PermitStatus.PENDING]: [
    previous(PermitStatus.APPLIED),
    previous(PermitStatus.TECHNICAL_REVIEW),
    current(PermitStatus.PENDING),
    crossedCircle(PermitStatus.COMPLETED)
  ],
  [PermitStatus.COMPLETED]: [
    previous(PermitStatus.APPLIED),
    previous(PermitStatus.TECHNICAL_REVIEW),
    previous(PermitStatus.PENDING),
    current(PermitStatus.COMPLETED)
  ]
};

// Actions
function getStatusBoxState(authStatus: string | undefined) {
  return authStatus && authStatus in statusBoxStates
    ? statusBoxStates[authStatus as keyof typeof statusBoxStates]
    : { boxClass: 'grey', message: 'Status not available.' };
}

function getTimelineStage(authStatus: string, status: string) {
  if (
    authStatus === PermitAuthorizationStatus.ABANDONED ||
    authStatus === PermitAuthorizationStatus.CANCELLED ||
    authStatus === PermitAuthorizationStatus.WITHDRAWN
  ) {
    return terminatedTimelineStages[status as keyof typeof terminatedTimelineStages];
  } else {
    return status && status in timelineStages
      ? timelineStages[status as keyof typeof timelineStages]
      : timelineStages.emptyStatus;
  }
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
</script>

<template>
  <Card class="permit-tracker-card pt-10">
    <template #content>
      <div class="application-progress-block">
        <div class="status-timeline">
          <Timeline
            class="pl-4"
            :value="getTimelineStage(permit.authStatus, permit.status)"
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
      </div>
      <div
        class="status-tracker-header pb-8 pt-4"
        :class="[getStatusBoxState(permit?.authStatus).boxClass]"
      >
        <div class="flex justify-between items-center">
          <div class="py-4 px-6 flex">
            <AuthorizationStatusPill
              :auth-status="permit?.authStatus"
              :enlarge="true"
            />
            <div v-if="permit?.statusLastVerified">
              <p class="verified-text my-0 italic">
                {{ t('authorization.authorizationTrackerCard.statusLastVerified') }}
                {{ formatDate(permit.statusLastVerified) }}
                {{ t('authorization.authorizationTrackerCard.byYourNavigator') }}
              </p>
            </div>
            <div v-else>
              <p class="verified-text my-0 italic">
                {{ t('authorization.authorizationTrackerCard.statusNotVerified') }}
              </p>
            </div>
          </div>
          <div class="status-help">
            <font-awesome-icon
              class="app-primary-color mr-2"
              icon="fa-circle-question"
              aria-describedby="status-description"
              @click="descriptionModalVisible = true"
            />
            <span
              id="status-descriptions"
              class="app-primary-color mr-4"
              tabindex="0"
              role="button"
              @click="descriptionModalVisible = true"
              @keydown.enter.prevent="descriptionModalVisible = true"
              @keydown.space.prevent="descriptionModalVisible = true"
            >
              {{ t('e.common.permitStatusView.statusDescriptionMeaning') }}
            </span>
          </div>
        </div>
        <div
          v-if="permit.permitNote && permit.permitNote.length > 0"
          class="ml-6"
        >
          <span class="font-bold">{{ formatDateTime(permit.permitNote[0]?.createdAt) }}</span>
          <span class="ml-2">{{ permit.permitNote[0]?.note }}</span>
        </div>
      </div>
    </template>
  </Card>
  <AuthorizationStatusDescriptionModal
    v-model:visible="descriptionModalVisible"
    dismissable-mask
  />
</template>
<style scoped lang="scss">
:deep(.p-timeline-event-opposite) {
  display: none;
}

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

.permit-tracker-card {
  background: #fff;
  border: 0.063rem solid #efefef;
  border-radius: 0.25rem;
  box-shadow: 0rem 0.25rem 0.25rem 0rem rgba(0, 0, 0, 0.04);
  position: relative;
}

.status-tracker-header {
  align-items: center;
  border-radius: 0.25rem;
  background: #fafafa;
  box-shadow: 0rem 0.25rem 0.25rem 0rem rgba(0, 0, 0, 0.04);

  gap: 0.5rem;
}

.timeline-content {
  white-space: nowrap;
  word-break: keep-all;
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

.text-current {
  font-weight: 700;
}

.status-timeline {
  margin-bottom: 3.5rem;
}

.verified-text {
  color: #606060;
  margin: 0.5rem 0rem 0rem 1rem;
}

.red {
  background-color: var(--p-red-50);
}

.yellow {
  background-color: var(--p-gold-100);
}

.green {
  background-color: var(--p-green-75);
}

.grey {
  background-color: var(--p-green-50);
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-card-body) {
  padding-bottom: 0;
}
</style>
