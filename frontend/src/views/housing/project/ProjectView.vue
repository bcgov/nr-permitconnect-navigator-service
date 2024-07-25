<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Accordion, AccordionTab, Button, Card, Divider } from '@/lib/primevue';
import { RouteName } from '@/utils/enums/application';
import { PermitAuthorizationStatus, PermitNeeded, PermitStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import { permitService, submissionService, userService } from '@/services';
import { useSubmissionStore, useTypeStore } from '@/store';

import type { ComputedRef, Ref } from 'vue';
import type { Permit, PermitType, User } from '@/types';

const router = useRouter();

type PermitFilterConfig = {
  permitNeeded?: string;
  permits: Array<Permit>;
  permitStatus?: string;
  permitTypes: Array<PermitType>;
};

type CombinedPermit = Permit & PermitType;

// Props
type Props = {
  activityId: string;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const submissionStore = useSubmissionStore();
const { getPermits, getSubmission } = storeToRefs(submissionStore);

const typeStore = useTypeStore();
const { getPermitTypes } = storeToRefs(typeStore);

const assignee: Ref<User | undefined> = ref(undefined);
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

function authStatusClass(authStat: string | undefined) {
  if (!authStat) return '';
  if (authStat === PermitAuthorizationStatus.IN_REVIEW) {
    return 'in-review';
  } else {
    return authStat?.toLowerCase();
  }
}

onMounted(async () => {
  const [submissionValue, permitsValue, permitTypesValue] = (
    await Promise.all([
      submissionService.getSubmission(props.submissionId),
      permitService.listPermits(props.activityId),
      permitService.getPermitTypes()
    ])
  ).map((r) => r.data);

  submissionStore.setSubmission(submissionValue);
  submissionStore.setPermits(permitsValue);
  typeStore.setPermitTypes(permitTypesValue);

  if (submissionValue?.assignedUserId) {
    assignee.value = (await userService.searchUsers({ userId: [submissionValue.assignedUserId] })).data[0];
  }

  loading.value = false;
});
</script>

<template>
  <div>
    <Button
      class="p-0"
      text
    >
      <router-link :to="{ name: RouteName.HOUSING }">
        <span class="app-primary-color">Housing</span>
      </router-link>
    </Button>
    /
    <Button
      class="p-0"
      text
    >
      <router-link :to="{ name: RouteName.HOUSING_PROJECTS }">
        <span class="app-primary-color">Applications and Permits</span>
      </router-link>
    </Button>
    /
    <span
      v-if="!loading"
      class="font-bold"
    >
      {{ getSubmission?.projectName }}
    </span>
    <span
      v-else
      class="font-bold"
    >
      ...loading
    </span>
  </div>
  <div
    v-if="!loading && getSubmission"
    class="app-primary-color"
  >
    <div class="mt-3 flex justify-content-between align-items-center">
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
        @click="
          router.push({ name: RouteName.HOUSING_ENQUIRY_INTAKE, query: { confirmationId: getSubmission.activityId } })
        "
      />
    </div>
    <div class="mb-6">
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
    <div><h3 class="mb-3">Required permits</h3></div>
    <div
      v-if="!permitsNeeded?.length"
      class="empty-block p-5"
    >
      We are investigating the permits required for this project.
    </div>

    <Card
      v-for="permit in permitsNeeded"
      :key="permit.permitId"
      class="app-primary-color mt-2 mb-2 hover-underline cursor-pointer"
    >
      <template #content>
        <h5 class="mt-0 mb-0 mr-0 ml-2 p-3">{{ permit.businessDomain }}: {{ permit.name }}</h5>
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
        <ul>
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
    <h3 class="mt-6 mb-3">Submitted applications</h3>
    <div
      v-if="!(permitsSubmitted.length || permitsNotNeeded.length)"
      class="empty-block p-5"
    >
      You will see your permit applications here once submitted.
    </div>
    <Card
      v-for="permit in permitsNeeded"
      :key="permit.permitId"
      class="pl-4 pr-4 pt-3 pb-3 mt-2 mb-2 permit-card"
    >
      <template #title>
        <h5 class="m-0 app-primary-color">{{ permit.businessDomain }}: {{ permit.name }}</h5>
        <Divider />
      </template>
      <template #content>
        <div class="grid">
          <div class="col-2">
            <div
              v-if="permit.authStatus !== PermitAuthorizationStatus.NONE"
              :class="['authIndicator', authStatusClass(permit?.authStatus)]"
            >
              {{ permit.authStatus }}
            </div>
          </div>
          <div class="col-2">
            <div>{{ permit?.statusLastVerified ? formatDate(permit.statusLastVerified) : '' }}</div>
            <div :class="['sub-label', { 'm-0': permit?.statusLastVerified }]">Last verified date</div>
          </div>
          <div class="col-2">
            <div>{{ permit?.trackingId ? permit.trackingId : '' }}</div>
            <div :class="['sub-label', { 'm-0': permit?.trackingId }]">Tracking ID</div>
          </div>
          <div class="col-2">
            <div>{{ permit?.issuedPermitId ? permit.issuedPermitId : '' }}</div>
            <div :class="['sub-label', { 'm-0': permit?.issuedPermitId }]">Permit ID</div>
          </div>
        </div>
      </template>
    </Card>
  </div>
  <!-- <div>{{ getSubmission }}</div> -->
</template>

<style scoped lang="scss">
a {
  text-decoration: none;
}

.hover-underline:hover {
  text-decoration: underline;
}

.empty-block {
  background-color: white;
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
  box-shadow: 0px 4px 4px 0px #0000000a;
  &:hover {
    background-color: rgb(233, 236, 239);
  }
}

.sub-label {
  color: $app-grey;
  font-size: 0.8rem;
  margin-top: 1rem;
}

// Overriding default Accordion CSS to match h5
:deep(.p-accordion-header > a) {
  color: inherit;
  font-size: 1.1rem;
  text-decoration: none;
}

:deep(.p-card-body) {
  padding-top: 0rem;
  padding-bottom: 0rem;
}

:deep(.p-card-content) {
  padding: 0rem;
}

:deep(.p-card:hover .p-card-title) {
  text-decoration: underline;
}
</style>
