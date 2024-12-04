<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import Breadcrumb from '@/components/common/Breadcrumb.vue';
import PermitEnquiryModal from '@/components/permit/PermitEnquiryModal.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitAuthorizationStatusDescriptions, PermitStatus } from '@/utils/enums/housing';
import { formatDate, formatDateLong } from '@/utils/formatters';
import { Button, Card, Timeline, useToast } from '@/lib/primevue';

import { enquiryService, permitService, submissionService, userService } from '@/services';

import type { Ref } from 'vue';
import type { Permit, PermitType, Submission, User } from '@/types';
import type { MenuItem } from 'primevue/menuitem';
import PermitStatusDescriptionModal from '@/components/permit/PermitStatusDescriptionModal.vue';

type CombinedPermit = Permit & PermitType;

// Props
const { permitId } = defineProps<{ permitId: string }>();

// Constants
const breadcrumbHome: MenuItem = { label: 'Housing', route: RouteName.HOUSING };
const circle = (trackerStatus: string) => ({
  class: 'stage-blue',
  iconClass: 'circle',
  iconString: 'fas fa-circle',
  text: trackerStatus
});
const halfCircle = (trackerStatus: string) => ({
  class: 'stage-blue',
  iconClass: 'half-circle',
  iconString: 'fa fa-circle-half-stroke',
  text: trackerStatus
});
const empty = (trackerStatus: string) => ({
  class: 'stage-grey',
  iconClass: 'empty',
  iconString: 'fa fa-circle',
  text: trackerStatus
});
const crossedCirlce = (trackerStatus: string) => ({
  class: 'stage-grey',
  iconClass: 'crossed-circle',
  iconString: 'fa-solid fa-ban',
  text: trackerStatus
});

// State
const breadcrumbItems: Ref<Array<MenuItem>> = ref([
  { label: 'Applications and Permits', route: RouteName.HOUSING_PROJECTS_LIST },
  { label: '...', route: undefined },
  { label: '...', class: 'font-bold' }
]);
const descriptionModalVisible: Ref<boolean> = ref(false);
const enquiryConfirmationId: Ref<string | undefined> = ref(undefined);
const enquiryModalVisible: Ref<boolean> = ref(false);
const permit: Ref<CombinedPermit | undefined> = ref(undefined);
const submission: Ref<Submission | undefined> = ref(undefined);
const user: Ref<User | undefined> = ref(undefined);

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
    halfCircle(PermitStatus.APPLIED),
    empty(PermitStatus.TECHNICAL_REVIEW),
    empty(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ],
  [PermitStatus.TECHNICAL_REVIEW]: [
    circle(PermitStatus.APPLIED),
    halfCircle(PermitStatus.TECHNICAL_REVIEW),
    empty(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ],
  [PermitStatus.PENDING]: [
    circle(PermitStatus.APPLIED),
    circle(PermitStatus.TECHNICAL_REVIEW),
    halfCircle(PermitStatus.PENDING),
    empty(PermitStatus.COMPLETED)
  ],
  [PermitStatus.COMPLETED]: [
    circle(PermitStatus.APPLIED),
    circle(PermitStatus.TECHNICAL_REVIEW),
    circle(PermitStatus.PENDING),
    circle(PermitStatus.COMPLETED)
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
const toast = useToast();

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

async function handleEnquirySubmit(enquiryDescription: string = '') {
  if (!submission.value) return;

  const enquiryData = {
    contacts: [
      {
        contactPreference: submission.value.contacts[0].contactPreference,
        email: submission.value.contacts[0].email,
        firstName: submission.value.contacts[0].firstName,
        lastName: submission.value.contacts[0].lastName,
        phoneNumber: submission.value.contacts[0].phoneNumber,
        contactApplicantRelationship: submission.value.contacts[0].contactApplicantRelationship
      }
    ],
    basic: {
      isRelated: BasicResponse.YES,
      applyForPermitConnect: BasicResponse.NO,
      enquiryDescription: enquiryDescription?.trim(),
      relatedActivityId: submission.value.activityId
    }
  };

  try {
    const response = await enquiryService.createEnquiry(enquiryData);
    enquiryConfirmationId.value = response?.data?.activityId ? response.data.activityId : '';
  } catch (e: any) {
    toast.error('Failed to submit enquiry', e);
  }
}

function handleModalClose() {
  enquiryConfirmationId.value = undefined;
}

onBeforeMount(async () => {
  try {
    const permitResponse = await permitService.getPermit(permitId);
    const { permitType, ...restOfPermit } = permitResponse.data;
    permit.value = { ...restOfPermit, ...permitType };

    submission.value = (await submissionService.searchSubmissions({ activityId: [permit.value?.activityId] })).data[0];

    breadcrumbItems.value = [
      { label: 'Applications and Permits', route: RouteName.HOUSING_PROJECTS_LIST },
      {
        label: submission.value?.projectName,
        route: RouteName.HOUSING_PROJECT,
        params: { submissionId: submission.value?.submissionId }
      },
      { label: permit?.value?.name, class: 'font-bold' }
    ];

    user.value = (await userService.searchUsers({ userId: [permitResponse.data.updatedBy] })).data[0];
  } catch {
    toast.error('Unable to load permit or project, please try again later');
  }
});
</script>

<template>
  <Breadcrumb
    :home="breadcrumbHome"
    :model="breadcrumbItems"
  />
  <div class="permit-status-view">
    <h1 class="permit-name mb-4">
      {{ permit?.name }}
    </h1>
    <p class="agency my-0">
      <b>Agency:</b>
      {{ permit?.agency }}
    </p>
    <Card>
      <template #content>
        <div class="permit-info">
          <div class="info-item">
            <b>Tracking ID:</b>
            <span>
              {{ permit?.trackingId }}
            </span>
          </div>
          <div class="info-item">
            <b>Submitted date:</b>
            <span>
              {{ formatDate(permit?.submittedDate) }}
            </span>
          </div>
          <div class="info-item">
            <b>Permit ID:</b>
            <span>
              {{ permit?.issuedPermitId }}
            </span>
          </div>
          <div class="info-item">
            <b>Adjudication date:</b>
            <span>
              {{ formatDate(permit?.adjudicationDate) }}
            </span>
          </div>
        </div>
      </template>
    </Card>
    <div class="status-header">
      <h4 class="status-header-text">Application status and progress</h4>
      <font-awesome-icon
        class="status-description-icon"
        icon="fa-circle-question"
        @click="descriptionModalVisible = true"
      />
    </div>
    <div class="status-verified-message">
      <div v-if="permit?.statusLastVerified">
        <p>This status was last verified on {{ formatDate(permit?.statusLastVerified) }} by {{ user?.fullName }}</p>
      </div>
      <div v-else>
        <p>This status has not yet been verified.</p>
      </div>
    </div>
    <div class="status-tracker">
      <div
        class="status-tracker-box py-3 px-4"
        :class="[getStatusBoxState(permit?.authStatus).boxClass]"
      >
        {{ getStatusBoxState(permit?.authStatus).message }}
      </div>
      <div class="status-tracker-pill-timeline mb-2">
        <div class="status-pill">
          <h6>Current status</h6>
          <StatusPill :auth-status="permit?.authStatus" />
        </div>
        <div class="status-timeline">
          <h6>Application progress</h6>
          <Timeline
            :value="getTimelineStage(permit?.authStatus, permit?.status)"
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
              >
                {{ slotProps.item.text }}
              </div>
            </template>
          </Timeline>
        </div>
      </div>
    </div>
    <div class="updates-section mt-8">
      <h4 class="mb-4">Updates</h4>
      <p>For further updates on this application, please contact your Navigator.</p>
      <Button
        class="mb-6"
        outlined
        label="Ask my Navigator"
        @click="() => (enquiryModalVisible = true)"
      />
      <div v-if="permit?.permitNote && permit.permitNote.length > 0">
        <div
          v-for="note in permit.permitNote"
          :key="note.permitNoteId"
          class="mb-4"
        >
          <p class="mb-2 mt-0 font-bold">{{ formatDateLong(note.createdAt) }}</p>
          <p class="mt-0">{{ note.note }}</p>
        </div>
      </div>
      <div v-else>
        <p class="text-gray-500">There are no updates.</p>
      </div>
    </div>
  </div>
  <PermitEnquiryModal
    v-model:visible="enquiryModalVisible"
    :permit="permit"
    :confirmation-id="enquiryConfirmationId"
    :updated-by="user?.fullName"
    @on-sumbit-enquiry="handleEnquirySubmit"
    @on-hide="handleModalClose"
  />
  <PermitStatusDescriptionModal
    v-model:visible="descriptionModalVisible"
    dismissable-mask
  />
</template>

<style scoped lang="scss">
.circle {
  color: #1e5189;
  & + :deep(.p-timeline-event-connector) {
    background-color: #1e5189;
  }
}

.crossed-circle {
  color: #9f9d9c;
  & + :deep(.p-timeline-event-connector) {
    background-color: #9f9d9c;
  }
}

.half-circle {
  color: #1e5189;
  & + :deep(.p-timeline-event-connector) {
    background-color: #e0dedc;
  }
}

.empty {
  color: transparent;
  border: 1px dashed #9f9d9c;
  border-radius: 50%;
  & + :deep(.p-timeline-event-connector) {
    background-color: #e0dedc;
  }
}

.stage-blue {
  color: #1e5189;
}

.stage-grey {
  color: #9f9d9c;
}

.permit-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  align-items: baseline;
}

.info-item {
  display: inline-flex;
  flex-wrap: nowrap;
}

.info-item b {
  white-space: nowrap;
  margin-right: 5px;
}

.info-item span {
  word-break: break-word;
  overflow-wrap: break-word;
}

.permit-info p {
  margin: 0;
}

.p-card {
  background: #fff;
  border: 1px solid #efefef;
  border-radius: 8px;
  box-shadow: none;
  margin-top: 40px;
  margin-bottom: 88px;
}

:deep(.p-timeline-event-opposite) {
  display: none;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-header-text {
  margin: 0;
}

.status-description-icon {
  color: $app-primary;
  font-size: 1rem;
  cursor: pointer;
}

.status-tracker-box {
  border-radius: 4px;
  border: 1px solid;
  font-size: 16px;
  font-weight: bold;
}

.status-tracker-box.green {
  background: #f6fff8;
  border-color: #42814a;
}

.status-tracker-box.yellow {
  background: #fef1d8;
  border-color: #f8bb47;
}

.status-tracker-box.red {
  background: #f4e1e2;
  border-color: #ce3e39;
}

.status-tracker-box.grey {
  background: #f3f2f1;
  border-color: #353433;
}

.status-tracker-pill-timeline {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  gap: 100px;
}

.status-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.status-timeline {
  flex-grow: 1;
  overflow-x: hidden;
}

.status-pill h6,
.status-timeline h6 {
  margin-top: 40px;
}

.status-verified-message {
  margin-bottom: 56px;
}

.timeline-content {
  white-space: nowrap;
  word-break: keep-all;
}

h6 {
  color: $app-primary;
  font-size: 16px;
  margin-bottom: 22px;
}
</style>
