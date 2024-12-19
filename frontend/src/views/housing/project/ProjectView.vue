<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Breadcrumb from '@/components/common/Breadcrumb.vue';
import CreateEnquiryDialog from '@/components/housing/projects/CreateEnquiryDialog.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { Accordion, AccordionTab, Button, Card, Column, DataTable, Divider, useToast } from '@/lib/primevue';
import { useAuthNStore, useConfigStore } from '@/store';
import { BasicResponse, RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus, SubmissionType } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';
import { confirmationTemplateEnquiry } from '@/utils/templates';

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
  submitted?: boolean;
};

type CombinedPermit = Permit & PermitType;

// Props
const { submissionId } = defineProps<{
  submissionId: string;
}>();

// Constants
const breadcrumbHome: MenuItem = { label: 'Housing', route: RouteName.HOUSING };
const DEFAULT_SORT_ORDER = -1;
const DEFAULT_SORT_FIELD = 'submittedAt';

// Store
const submissionStore = useSubmissionStore();
const { getConfig } = storeToRefs(useConfigStore());
const { getProfile } = storeToRefs(useAuthNStore());
const { getPermits, getRelatedEnquiries, getSubmission } = storeToRefs(submissionStore);

const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);

// State
const assignee: Ref<User | undefined> = ref(undefined);
const breadcrumbItems: ComputedRef<Array<MenuItem>> = computed(() => [
  { label: 'Applications and Permits', route: RouteName.HOUSING_PROJECTS_LIST },
  { label: getSubmission?.value?.projectName ?? '', class: 'font-bold' }
]);
const createdBy: Ref<User | undefined> = ref(undefined);
const enquiryConfirmationId: Ref<string | undefined> = ref(undefined);
const enquiryModalVisible: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(true);

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
    submitted: true,
    permits: getPermits.value,
    permitTypes: getPermitTypes.value
  });
  return firstFilter.sort(permitNameSortFcn).sort(permitBusinessSortFcn);
});

// Actions
const router = useRouter();
const { t } = useI18n();
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

function permitBusinessSortFcn(a: CombinedPermit, b: CombinedPermit) {
  return a.businessDomain > b.businessDomain ? 1 : -1;
}

function permitNameSortFcn(a: CombinedPermit, b: CombinedPermit) {
  return a.name > b.name ? 1 : -1;
}

function permitFilter(config: PermitFilterConfig) {
  const { permitNeeded, permits, permitStatus, permitTypes, submitted } = config;
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

  if (submitted) {
    returnArray = returnArray
      .filter((item) => item.authStatus !== PermitAuthorizationStatus.NONE && item.status !== PermitStatus.NEW)
      .map((p) => {
        const pType = permitTypes.find((pt) => pt.permitTypeId === p?.permitTypeId);
        if (pType) return { ...p, ...pType };
      });
  }

  return returnArray.filter((pt) => !!pt) as Array<CombinedPermit>;
}

function handleDialogClose() {
  enquiryConfirmationId.value = undefined;
}

async function handleEnquirySubmit(enquiryDescription: string = '') {
  if (!getSubmission.value) return;

  const enquiryData = {
    contacts: [
      {
        contactPreference: getSubmission.value.contacts[0].contactPreference,
        email: getSubmission.value.contacts[0].email,
        firstName: getSubmission.value.contacts[0].firstName,
        lastName: getSubmission.value.contacts[0].lastName,
        phoneNumber: getSubmission.value.contacts[0].phoneNumber,
        contactApplicantRelationship: getSubmission.value.contacts[0].contactApplicantRelationship
      }
    ],
    basic: {
      isRelated: BasicResponse.YES,
      applyForPermitConnect: BasicResponse.NO,
      enquiryDescription: enquiryDescription?.trim(),
      relatedActivityId: getSubmission.value.activityId
    }
  };

  try {
    const response = await enquiryService.createEnquiry(enquiryData);
    submissionStore.addRelatedEnquiry(response.data);
    enquiryConfirmationId.value = response?.data?.activityId ? response.data.activityId : '';

    // Send confirmation email
    if (enquiryConfirmationId.value) {
      emailConfirmation(response.data.activityId, response.data.enquiryId, enquiryDescription);
    }
  } catch (e: any) {
    toast.error('Failed to submit enquiry', e);
  }
}

onMounted(async () => {
  let enquiriesValue, permitTypesValue, submissionValue;

  try {
    [submissionValue, permitTypesValue] = (
      await Promise.all([submissionService.getSubmission(submissionId), permitService.getPermitTypes()])
    ).map((r) => r.data);
    if (submissionValue) enquiriesValue = (await enquiryService.listRelatedEnquiries(submissionValue.activityId)).data;
  } catch {
    toast.error('Unable to load project, please try again later');
    router.replace({ name: RouteName.HOUSING_PROJECTS_LIST });
  }

  try {
    const activityId = submissionValue.activityId;
    const permitsValue = (await permitService.listPermits({ activityId, includeNotes: true })).data;
    submissionStore.setPermits(permitsValue);
  } catch {
    toast.error('Unable to load permits for this project, please try again later');
  }
  submissionStore.setSubmission(submissionValue);
  submissionStore.setRelatedEnquiries(enquiriesValue);
  typeStore.setPermitTypes(permitTypesValue);

  if (submissionValue?.assignedUserId) {
    assignee.value = (await userService.searchUsers({ userId: [submissionValue.assignedUserId] })).data[0];
  }

  if (submissionValue?.createdBy) {
    createdBy.value = (await userService.searchUsers({ userId: [submissionValue.createdBy] })).data[0];
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
    <div class="disclaimer-block p-5 mt-5">
      Based on the information you provided, the following permits are recommended. Please note, that this information
      is for guidance purposes only and is intended to help you prepare a complete application. Recommendations may be
      updated as we review your project or receive further details.
    </div>
    <div class="mt-8 mb-2 flex justify-content-between align-items-center">
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
        v-if="getSubmission?.submissionType !== SubmissionType.INAPPLICABLE"
        class="p-button-sm header-btn"
        label="Ask my Navigator"
        outlined
        @click="enquiryModalVisible = !enquiryModalVisible"
      />
    </div>
    <div class="mb-2">
      <span class="mr-3">
        Project ID:
        <span class="font-bold">{{ getSubmission.activityId }}</span>
      </span>
      <span class="mr-3">
        {{ t('projectView.createdBy') }}:
        <span class="font-bold">{{ createdBy?.firstName }} {{ createdBy?.lastName }}</span>
      </span>
      <span v-if="assignee">
        Navigator:
        <span class="font-bold">{{ assignee?.firstName }} {{ assignee?.lastName }}</span>
      </span>
      <span v-else>Navigator: -</span>
    </div>
    <div
      v-if="getSubmission?.submissionType === SubmissionType.INAPPLICABLE"
      class="inapplicable-block p-3 mt-6"
    >
      {{ t('projectView.inapplicableSubmissionType') }}
    </div>
    <div><h3 class="mb-5 mt-7">Recommended permits</h3></div>
    <div
      v-if="!permitsNeeded?.length"
      class="empty-block p-5 mb-2"
    >
      We will update the recommended permits here as the project progresses. You may see this message while we are
      investigating or if no application is needed at this time.
    </div>
    <Card
      v-for="permit in permitsNeeded"
      :key="permit.permitId"
      class="app-primary-color permit-card mb-2"
    >
      <template #content>
        <h5 class="m-0 p-0">{{ permit.name }}</h5>
      </template>
    </Card>
    <Accordion
      v-if="permitsNotNeeded?.length"
      class="app-primary-color"
    >
      <AccordionTab header="Not needed">
        <div>
          We have also investigated the following permits as requested. These permits are not required for this project.
        </div>
        <ul class="mt-4 mb-0">
          <li
            v-for="permit in permitsNotNeeded"
            :key="permit.permitId"
            class="m-0"
          >
            {{ permit.name }}
          </li>
        </ul>
      </AccordionTab>
    </Accordion>
    <h3 class="mt-8 mb-5">Submitted applications</h3>
    <div
      v-if="!permitsSubmitted.length"
      class="empty-block p-5"
    >
      We will update your submitted applications here as the project progresses.
    </div>
    <router-link
      v-for="permit in permitsSubmitted"
      :key="permit.permitId"
      :to="{
        name: RouteName.HOUSING_PROJECT_PERMIT,
        params: { permitId: permit.permitId }
      }"
    >
      <Card class="permit-card--hover mb-3">
        <template #title>
          <div class="flex justify-content-between">
            <h5 class="m-0 app-primary-color cursor-pointer">{{ permit.name }}</h5>
            <font-awesome-icon
              class="ellipsis-icon"
              icon="fa fa-ellipsis"
            />
          </div>
          <Divider />
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 flex mb-3">
              <StatusPill
                class="mr-2"
                :auth-status="permit.authStatus"
              />
              <div>
                <span class="label-verified mr-1">Status last verified on</span>
                <span class="label-date">{{ formatDate(permit.statusLastVerified) }}</span>
              </div>
            </div>
            <div class="col-3">
              <div class="label-field">Tracking ID</div>
              <div class="permit-data">
                {{ permit?.trackingId }}
              </div>
            </div>
            <div class="col-3">
              <div class="label-field">Agency</div>
              <div class="permit-data">
                {{ permit?.agency }}
              </div>
            </div>
            <div class="col-6">
              <div class="label-field">Latest updates</div>
              <div class="permit-data">
                {{ permit?.permitNote?.length ? permit?.permitNote[0].note : 'No updates at the moment.' }}
              </div>
            </div>
          </div>
        </template>
      </Card>
    </router-link>
    <CreateEnquiryDialog
      v-model:visible="enquiryModalVisible"
      dismissable-mask
      :navigator="assignee"
      :confirmation-id="enquiryConfirmationId"
      @on-hide="handleDialogClose"
      @on-sumbit-enquiry="handleEnquirySubmit"
    />
    <div>
      <div>
        <h3 class="mb-5 mt-7">{{ t('projectView.relatedEnquiries') }}</h3>
      </div>

      <div
        v-if="!getRelatedEnquiries?.length"
        class="empty-block p-5 mb-2"
      >
        {{ t('projectView.listEmpty') }}
      </div>

      <DataTable
        v-else
        :loading="loading"
        :value="getRelatedEnquiries"
        :row-hover="true"
        :rows="10"
        :sort-field="DEFAULT_SORT_FIELD"
        :sort-order="DEFAULT_SORT_ORDER"
        scrollable
        responsive-layout="scroll"
        :paginator="true"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        :current-page-report-template="`({currentPage} ${t('projectView.rangeSeparator')} {totalPages})`"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #empty>
          <div class="flex justify-content-center">
            <p class="font-bold text-xl">{{ t('projectView.listEmpty') }}</p>
          </div>
        </template>
        <template #loading>
          <Spinner />
        </template>

        <Column
          field="activityId"
          :header="t('projectView.enquiryID')"
          style="width: 45%"
        >
          <template #body="{ data }">
            <div :data-activityId="data.activityId">
              <router-link
                :to="{
                  name: RouteName.HOUSING_ENQUIRY_INTAKE,
                  query: { activityId: data.activityId, enquiryId: data.enquiryId }
                }"
              >
                {{ data.activityId }}
              </router-link>
            </div>
          </template>
        </Column>
        <Column
          field="enquiryStatus"
          :header="t('projectView.status')"
          :sortable="true"
          style="width: 42%"
        />
        <Column
          field="submittedAt"
          :header="t('projectView.submittedDate')"
          :sortable="true"
          style="width: 15%"
        >
          <template #body="{ data }">
            {{ formatDate(data?.submittedAt) }}
          </template>
        </Column>
      </DataTable>
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
  border-color: $app-proj-white-one;
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
  border-color: $app-proj-white-one;
  border-style: solid;
  border-width: 1px;
  box-shadow: 4px 4px 4px 0px $app-proj-black;
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
