<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';

import Breadcrumb from '@/components/common/Breadcrumb.vue';
import PermitEnquiryModal from '@/components/permit/PermitEnquiryModal.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { Button, Card, Timeline, useToast } from '@/lib/primevue';
import { useAuthNStore, useConfigStore } from '@/store';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitAuthorizationStatusDescriptions, PermitStatus } from '@/utils/enums/housing';
import { formatDate, formatDateLong } from '@/utils/formatters';
import { confirmationTemplateEnquiry } from '@/utils/templates';

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
const { getConfig } = storeToRefs(useConfigStore());
const { getProfile } = storeToRefs(useAuthNStore());

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
const updatedBy: Ref<string | undefined> = ref(undefined);
const assignedNavigator: Ref<User | undefined> = ref(undefined);

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
const toast = useToast();

async function emailConfirmation(activityId: string, enquiryId: string, enquiryDescription: string) {
  const configCC = getConfig.value.ches?.submission?.cc;
  const user = getProfile;

  const body = confirmationTemplateEnquiry({
    '{{ contactName }}': user.value?.name,
    '{{ activityId }}': activityId,
    '{{ enquiryDescription }}': enquiryDescription,
    '{{ enquiryId }}': enquiryId
  });
  let applicantEmail = user.value?.email;

  if (applicantEmail) {
    let emailData = {
      from: configCC,
      to: [applicantEmail],
      cc: configCC,
      subject: 'Confirmation of Submission', // eslint-disable-line quotes
      bodyType: 'html',
      body: body
    };
    await submissionService.emailConfirmation(emailData);
  }
}

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

    if (enquiryConfirmationId.value) {
      emailConfirmation(response.data.activityId, response.data.enquiryId, enquiryDescription);
    }
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
    if (submission.value?.assignedUserId) {
      assignedNavigator.value = (await userService.searchUsers({ userId: [submission.value.assignedUserId] })).data[0];
    }

    if (permit.value?.updatedBy) {
      const updatedByUser = (await userService.searchUsers({ userId: [permitResponse.data.updatedBy] })).data[0];
      updatedBy.value = updatedByUser.firstName + ' ' + updatedByUser.lastName;
    }
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
    <h1 class="permit-name">
      {{ permit?.name }}
    </h1>
    <div class="permit-info-block">
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
      <div class="info-item mt-6">
        <b>Agency:</b>
        <span>
          {{ permit?.agency }}
        </span>
      </div>
    </div>
    <div class="status-help">
      <font-awesome-icon
        class="status-description-icon"
        icon="fa-circle-question"
        @click="descriptionModalVisible = true"
      />
      <span
        class="status-description"
        tabindex="0"
        @click="descriptionModalVisible = true"
        @keydown.enter.prevent="descriptionModalVisible = true"
        @keydown.space.prevent="descriptionModalVisible = true"
      >
        What does the status mean?
      </span>
    </div>
    <Card>
      <template #header>
        <div
          class="status-tracker-header py-4 px-6"
          :class="[getStatusBoxState(permit?.authStatus).boxClass]"
        >
          <StatusPill
            :auth-status="permit?.authStatus"
            :enlarge="true"
          />
          {{ getStatusBoxState(permit?.authStatus).message }}
        </div>
      </template>
      <template #content>
        <div class="application-progress-block">
          <div class="status-timeline">
            <h4 class="mb-6">Application progress</h4>
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
          <div class="status-verified-message">
            <div v-if="updatedBy">
              <p class="verified-text my-0">
                This status was last verified on {{ formatDate(permit?.statusLastVerified) }} by {{ updatedBy }}
              </p>
            </div>
            <div v-else>
              <p class="verified-text my-0">This status has not yet been verified.</p>
            </div>
          </div>
        </div>
      </template>
    </Card>
    <div class="updates-section">
      <h4 class="mb-6">Additional updates</h4>
      <div class="ask-navigator mb-16">
        <Button
          outlined
          label="Ask my Navigator"
          @click="() => (enquiryModalVisible = true)"
        />
        <p>Contact your Navigator for this project for further updates on this application.</p>
      </div>
      <div v-if="permit?.permitNote && permit.permitNote.length > 0">
        <div
          v-for="note in permit.permitNote"
          :key="note.permitNoteId"
          class="mb-6"
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
    :navigator="assignedNavigator"
    :updated-by="updatedBy"
    @on-sumbit-enquiry="handleEnquirySubmit"
    @on-hide="handleModalClose"
  />
  <PermitStatusDescriptionModal
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

.p-card {
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
