<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import Breadcrumb from '@/components/common/Breadcrumb.vue';
import CreateEnquiryDialog from '@/components/housing/projects/CreateEnquiryDialog.vue';
import ProjectPermitModal from '@/components/housing/projects/ProjectPermitModal.vue';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  Button,
  Card,
  Divider,
  useToast
} from '@/lib/primevue';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';
import { toKebabCase } from '@/utils/utils';

import { enquiryService, permitService, submissionService, userService } from '@/services';
import { useSubmissionStore, useTypeStore } from '@/store';

import type { ComputedRef, Ref } from 'vue';
import type { Permit, PermitType, User } from '@/types';
import type { MenuItem } from 'primevue/menuitem';

// Types
type PermitFilterConfig = {
  permitNeeded?: string;
  permits: Array<Permit>;
  permitStatus?: string;
  permitTypes: Array<PermitType>;
};

type CombinedPermit = Permit & PermitType;

// Props
const { submissionId } = defineProps<{
  submissionId: string;
}>();

// Constants
const breadcrumbHome: MenuItem = { label: 'Housing', route: RouteName.HOUSING };

// Store
const submissionStore = useSubmissionStore();
const { getPermits, getSubmission } = storeToRefs(submissionStore);

const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);

// State
const assignee: Ref<User | undefined> = ref(undefined);
const breadcrumbItems: ComputedRef<Array<MenuItem>> = computed(() => [
  { label: 'Applications and Permits', route: RouteName.HOUSING_PROJECTS_LIST },
  { label: getSubmission?.value?.projectName ?? '', class: 'font-bold' }
]);
const enquiryConfirmationId: Ref<string | undefined> = ref(undefined);
const enquiryModalVisible: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(true);
const permitModalVisible: Ref<boolean> = ref(false);
const selectedPermit: Ref<CombinedPermit | undefined> = ref(undefined);

const permitsNeeded = computed(() => {
  return permitFilter({
    permitNeeded: PermitNeeded.YES,
    permitStatus: PermitStatus.NEW,
    permits: getPermits.value,
    permitTypes: getPermitTypes.value
  })
    .sort(permitNameSortFcn)
    .sort(permitBusinessSortFcn);
});
const permitsNotNeeded = computed(() => {
  return permitFilter({
    permitNeeded: PermitNeeded.NO,
    permits: getPermits.value,
    permitTypes: getPermitTypes.value
  })
    .sort(permitNameSortFcn)
    .sort(permitBusinessSortFcn);
});
const permitsSubmitted: ComputedRef<Array<CombinedPermit>> = computed(() => {
  let firstFilter = permitFilter({
    permitNeeded: PermitNeeded.YES,
    permitStatus: PermitStatus.APPLIED,
    permits: getPermits.value,
    permitTypes: getPermitTypes.value
  });
  let secondFilter = permitFilter({
    permitNeeded: PermitNeeded.YES,
    permitStatus: PermitStatus.COMPLETED,
    permits: getPermits.value,
    permitTypes: getPermitTypes.value
  });
  return firstFilter.concat(secondFilter).sort(permitNameSortFcn).sort(permitBusinessSortFcn);
});

// Actions
const router = useRouter();
const toast = useToast();

function permitBusinessSortFcn(a: CombinedPermit, b: CombinedPermit) {
  return a.businessDomain > b.businessDomain ? 1 : -1;
}

function permitNameSortFcn(a: CombinedPermit, b: CombinedPermit) {
  return a.name > b.name ? 1 : -1;
}

function permitFilter(config: PermitFilterConfig) {
  const { permitNeeded, permits, permitStatus, permitTypes } = config;
  let returnArray: Array<any> = permits;

  if (permitNeeded) {
    returnArray = returnArray.map((p) => {
      const pType = permitTypes.find((pt) => pt.permitTypeId === p?.permitTypeId && p.needed === permitNeeded);
      if (pType) return { ...p, ...pType };
    });
  }

  if (permitStatus) {
    returnArray = returnArray.map((p) => {
      const pType = permitTypes.find((pt) => pt.permitTypeId === p?.permitTypeId && p.status === permitStatus);
      if (pType) return { ...p, ...pType };
    });
  }

  return returnArray.filter((pt) => !!pt) as Array<CombinedPermit>;
}

function displayTrackerStatus(authStatus: string | undefined, permitState: string | undefined): string | undefined {
  if (permitState === PermitStatus.APPLIED && authStatus === PermitAuthorizationStatus.NONE) return 'Submitted';

  return authStatus;
}

function handleDialogClose() {
  enquiryConfirmationId.value = undefined;
}

async function handleEnquirySubmit(enquiryDescription: string = '') {
  if (!getSubmission.value) return;

  const enquiryData = {
    applicant: {
      contactPreference: getSubmission.value.contactPreference,
      contactEmail: getSubmission.value.contactEmail,
      contactFirstName: getSubmission.value.contactFirstName,
      contactLastName: getSubmission.value.contactLastName,
      contactPhoneNumber: getSubmission.value.contactPhoneNumber,
      contactApplicantRelationship: getSubmission.value.contactApplicantRelationship
    },
    basic: {
      isRelated: BasicResponse.YES,
      applyForPermitConnect: BasicResponse.NO,
      enquiryDescription: enquiryDescription?.trim(),
      relatedActivityId: getSubmission.value.activityId
    }
  };

  try {
    const response = await enquiryService.submitDraft(enquiryData);
    enquiryConfirmationId.value = response?.data?.activityId ? response.data.activityId : '';
  } catch (e: any) {
    toast.error('Failed to submit enquiry', e);
  }
}

onMounted(async () => {
  let submissionValue;
  let permitTypesValue;
  try {
    [submissionValue, permitTypesValue] = (
      await Promise.all([submissionService.getSubmission(submissionId), permitService.getPermitTypes()])
    ).map((r) => r.data);
  } catch {
    toast.error('Unable to load project, please try again later');
    router.replace({ name: RouteName.HOUSING_PROJECTS_LIST });
  }

  try {
    const permitsValue = (await permitService.listPermits(submissionValue.activityId)).data;
    submissionStore.setPermits(permitsValue);
  } catch {
    toast.error('Unable to load permits for this project, please try again later');
  }
  submissionStore.setSubmission(submissionValue);
  typeStore.setPermitTypes(permitTypesValue);

  if (submissionValue?.assignedUserId) {
    assignee.value = (await userService.searchUsers({ userId: [submissionValue.assignedUserId] })).data[0];
  }
  loading.value = false;
});
</script>

<template>
  <Breadcrumb
    :home="breadcrumbHome"
    :model="breadcrumbItems"
  />
  <div
    v-if="!loading && getSubmission"
    class="app-primary-color"
  >
    <div class="mt-7 mb-2 flex justify-content-between align-items-center">
      <h1
        class="m-0 cursor-pointer hover:underline"
        @click="
          router.push({
            name: RouteName.HOUSING_SUBMISSION,
            query: { activityId: getSubmission?.activityId, submissionId: getSubmission?.submissionId }
          })
        "
      >
        {{ getSubmission.projectName }}
        <font-awesome-icon
          class="text-sm"
          icon="fa fa-external-link"
        />
      </h1>
      <Button
        class="p-button-sm header-btn"
        label="Ask a Navigator"
        @click="enquiryModalVisible = !enquiryModalVisible"
      />
    </div>
    <div class="mb-8">
      <span class="mr-3">
        Confirmation ID:
        <span class="font-bold">{{ getSubmission.activityId }}</span>
      </span>
      <span v-if="assignee">
        Navigator:
        <span class="font-bold">{{ assignee?.firstName }} {{ assignee?.lastName }}</span>
      </span>
      <span v-else>Navigator: -</span>
    </div>
    <div><h3 class="mb-5">Required permits</h3></div>
    <div
      v-if="!(permitsNeeded?.length || permitsNotNeeded?.length)"
      class="empty-block p-5"
    >
      We are investigating the permits required for this project.
    </div>

    <Card
      v-for="permit in permitsNeeded"
      :key="permit.permitId"
      class="app-primary-color permit-card hover-underline cursor-pointer"
    >
      <template #content>
        <h5 class="m-0 p-0">{{ permit.businessDomain }}: {{ permit.name }}</h5>
      </template>
    </Card>
    <Accordion
      v-if="permitsNotNeeded?.length"
      class="app-primary-color"
    >
      <AccordionPanel>
        <AccordionHeader>Not needed</AccordionHeader>
        <AccordionContent>
          <div>
            We have also investigated the following permits as requested. These permits are not required for this
            project.
          </div>
          <ul class="mt-4 mb-0">
            <li
              v-for="permit in permitsNotNeeded"
              :key="permit.permitId"
              class="m-0"
            >
              {{ permit.businessDomain }}: {{ permit.name }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <h3 class="mt-8 mb-5">Submitted applications</h3>
    <div
      v-if="!(permitsSubmitted.length || permitsNotNeeded.length)"
      class="empty-block p-5"
    >
      You will see your permit applications here once submitted.
    </div>
    <Card
      v-for="permit in permitsSubmitted"
      :key="permit.permitId"
      class="permit-card"
      @click="
        () => {
          permitModalVisible = true;
          selectedPermit = permit;
        }
      "
    >
      <template #title>
        <h5 class="m-0 app-primary-color cursor-pointer">{{ permit.businessDomain }}: {{ permit.name }}</h5>
        <Divider />
      </template>
      <template #content>
        <div class="grid">
          <div class="col-2">
            <div :class="['authIndicator', toKebabCase(displayTrackerStatus(permit.authStatus, permit.status))]">
              {{ displayTrackerStatus(permit.authStatus, permit.status) }}
            </div>
          </div>
          <div
            v-tooltip="{ value: permit?.statusLastVerified ? formatDate(permit.statusLastVerified) : '' }"
            class="col-2"
          >
            <div class="permit-data">
              {{ permit?.statusLastVerified ? formatDate(permit.statusLastVerified) : '' }}
            </div>
            <div :class="['sub-label', { 'm-0': permit?.statusLastVerified }]">Last verified date</div>
          </div>
          <div
            v-tooltip="{ value: permit?.trackingId ? permit.trackingId : '' }"
            class="col-2"
          >
            <div class="permit-data">
              {{ permit?.trackingId ? permit.trackingId : '' }}
            </div>
            <div :class="['sub-label', { 'm-0': permit?.trackingId }]">Tracking ID</div>
          </div>
          <div
            v-tooltip="{ value: permit?.issuedPermitId ? permit.issuedPermitId : '' }"
            class="col-2"
          >
            <div class="permit-data">
              {{ permit?.issuedPermitId ? permit.issuedPermitId : '' }}
            </div>
            <div :class="['sub-label', { 'm-0': permit?.issuedPermitId }]">Permit ID</div>
          </div>
        </div>
      </template>
    </Card>
    <ProjectPermitModal
      v-model:visible="permitModalVisible"
      dismissable-mask
      :confirmation-id="enquiryConfirmationId"
      :permit="selectedPermit"
      @on-hide="handleDialogClose"
      @on-sumbit-enquiry="handleEnquirySubmit"
    />
    <CreateEnquiryDialog
      v-model:visible="enquiryModalVisible"
      dismissable-mask
      :confirmation-id="enquiryConfirmationId"
      @on-hide="handleDialogClose"
      @on-sumbit-enquiry="handleEnquirySubmit"
    />
  </div>
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}

.hover-underline:hover {
  text-decoration: underline;
}

.empty-block {
  background-color: $app-grey;
}
.header-btn {
  max-height: 2rem;
}

.authIndicator {
  height: 30px;
  width: 100px;
  text-align: center;
  line-height: 30px;
  font-size: 0.9rem;
}

.in-review,
.submitted {
  background-color: none;
  color: $app-green;
  border-radius: 1rem;
  border-color: $app-green;
  border-style: solid;
  border-width: 1px;
}

.completed,
.issued {
  background-color: $app-green;
  color: white;
  border-radius: 1rem;
  border-color: $app-green;
  border-style: solid;
  border-width: 1px;
}

.denied {
  background-color: $app-error;
  color: white;
  border-radius: 1rem;
  border-color: $app-error;
  border-style: solid;
  border-width: 1px;
}

.pending {
  background-color: none;
  color: $app-error;
  border-radius: 1rem;
  border-color: $app-error;
  border-style: solid;
  border-width: 1px;
}

.permit-card {
  border-color: $app-proj-white-one;
  border-style: solid;
  border-width: 1px;
  box-shadow: 4px 4px 4px 0px $app-proj-black;
  padding: 1.76rem 2rem 1.76rem 2rem;
  margin-bottom: 1rem;
  &:hover {
    background-color: $app-grey;
  }
}

.permit-data {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-label {
  color: $app-proj-grey-one;
  font-size: 0.8rem;
  margin-top: 1rem;
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
  border-color: $app-proj-white-one;
  border-style: solid;
  border-width: 1px;
  box-shadow: 4px 4px 4px 0px $app-proj-black;
}

:deep(.p-accordion-tab-active .p-accordion-header > a) {
  background-color: $app-grey !important;
}

:deep(:not(.p-accordion-tab-active) .p-accordion-header > a) {
  background-color: inherit;
  &:hover {
    background-color: $app-grey;
  }
}

:deep(.p-card-body) {
  padding-top: 0rem;
  padding-bottom: 0rem;
  padding-left: 1.5rem;
  padding-right: 1.5 rem;
}

:deep(.p-card-content) {
  padding: 0rem;
}

:deep(.p-card:hover .p-card-title) {
  text-decoration: underline;
}
</style>
