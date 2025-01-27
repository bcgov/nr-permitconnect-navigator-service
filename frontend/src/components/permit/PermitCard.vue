<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watchEffect } from 'vue';

import StatusPill from '@/components/common/StatusPill.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import NotesModal from '@/components/permit/NotesModal.vue';
import { Button, Card } from '@/lib/primevue';
import { userService } from '@/services';
import { useAuthZStore, useTypeStore } from '@/store';
import { Action, Initiative, Resource } from '@/utils/enums/application';
import { PermitAuthorizationStatus } from '@/utils/enums/housing';
import { formatDate, formatDateTime } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Permit, PermitType } from '@/types';

// Props
const { editable, permit } = defineProps<{
  editable?: boolean;
  permit: Permit;
}>();

// Store
const { getPermitTypes } = storeToRefs(useTypeStore());

// State
const cardUpdatedBy: Ref<string> = ref('');
const permitModalVisible: Ref<boolean> = ref(false);
const notesModalVisible: Ref<boolean> = ref(false);
const permitType: Ref<PermitType | undefined> = ref(
  getPermitTypes.value.find((x) => x.permitTypeId === permit.permitTypeId)
);
const permitTypeName = computed(() => permitType.value?.name ?? '');

// Actions
watchEffect(() => {
  if (permit.updatedBy) {
    userService
      .searchUsers({ userId: [permit.updatedBy] })
      .then((res) => {
        cardUpdatedBy.value = res?.data.length ? res?.data[0].fullName : '';
      })
      .catch(() => {});
  }
});

watchEffect(() => {
  permitType.value = getPermitTypes.value.find((x) => x.permitTypeId === permit.permitTypeId);
});

function isCompleted(authStatus: string | undefined): boolean {
  if (!authStatus) return false;
  switch (authStatus) {
    case PermitAuthorizationStatus.CANCELLED:
    case PermitAuthorizationStatus.WITHDRAWN:
    case PermitAuthorizationStatus.ABANDONED:
    case PermitAuthorizationStatus.DENIED:
    case PermitAuthorizationStatus.ISSUED:
      return true;
    default:
      return false;
  }
}
</script>

<template>
  <Card :class="{ completed: isCompleted(permit.authStatus), selected: notesModalVisible }">
    <template #title>
      <div class="flex">
        <div class="grow">
          <h3 class="mb-0">{{ permitTypeName }}</h3>
        </div>
        <div class="flex justify-center flex-wrap gap-2 align-items-center">
          <Button
            class="p-button-outlined"
            aria-label="Add updates"
            :disabled="!editable || !useAuthZStore().can(Initiative.HOUSING, Resource.PERMIT, Action.UPDATE)"
            @click="notesModalVisible = true"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-plus"
            />
            Add updates
          </Button>
          <Button
            class="p-button-outlined"
            aria-label="Edit"
            :disabled="!editable || !useAuthZStore().can(Initiative.HOUSING, Resource.PERMIT, Action.UPDATE)"
            @click="permitModalVisible = true"
          >
            <font-awesome-icon
              class="pr-2"
              icon="fa-solid fa-edit"
            />
            Edit
          </Button>
        </div>
      </div>
    </template>
    <template #content>
      <div :class="permit.authStatus !== PermitAuthorizationStatus.NONE ? 'pb-4' : ''">
        <StatusPill
          v-if="permit.authStatus !== PermitAuthorizationStatus.NONE"
          :auth-status="permit.authStatus"
        />
      </div>
      <div class="grid grid-cols-3 gap-4 my-3">
        <!-- Left column -->
        <div class="grid grid-cols-1 space-y-4">
          <p>
            <span class="key font-bold">Tracking ID:</span>
            {{ permit.trackingId }}
          </p>
          <p>
            <span class="key font-bold">Status verified date:</span>
            {{ permit.statusLastVerified ? formatDate(permit.statusLastVerified) : undefined }}
          </p>
          <p>
            <span class="key font-bold">Submitted date:</span>
            {{ permit.submittedDate ? formatDate(permit.submittedDate) : undefined }}
          </p>
          <p>
            <span class="key font-bold">Permit state:</span>
            {{ permit.status }}
          </p>
        </div>
        <!-- Middle column -->
        <div class="grid grid-cols-1 space-y-4">
          <p>
            <span class="key font-bold">Last updated:</span>
            {{ permit.updatedAt ? ` ${formatDateTime(permit.updatedAt)}` : undefined }}
          </p>
          <p>
            <span class="key font-bold">Updated by:</span>
            {{ cardUpdatedBy }}
          </p>
          <p>
            <span class="key font-bold">Adjudication date:</span>
            {{ permit.adjudicationDate ? formatDate(permit.adjudicationDate) : undefined }}
          </p>
          <p>
            <span class="key font-bold">Issued Permit ID:</span>
            {{ permit.issuedPermitId }}
          </p>
        </div>
        <!-- Right column -->
        <div class="grid grid-cols-1 space-y-4">
          <p>
            <span class="key font-bold">Agency:</span>
            {{ permitType?.agency }}
          </p>
          <p>
            <span class="key font-bold">Business domain:</span>
            {{ permitType?.businessDomain }}
          </p>
          <p>
            <span class="key font-bold">Source system:</span>
            {{ permitType?.sourceSystem }}
          </p>
          <p>
            <span class="key font-bold">Needed:</span>
            {{ permit.needed }}
          </p>
        </div>
      </div>
      <div
        v-if="permit.permitNote?.length"
        class="pb-2 pt-3"
      >
        <span class="key font-bold">Latest update for the client:</span>
        <div class="pt-3">
          <span class="font-bold">{{ ' ' + formatDateTime(permit.permitNote[0].createdAt) }},</span>
          {{ permit.permitNote[0].note }}
        </div>
        <div>
          <Button
            class="previous-updates px-0"
            text
            @click="notesModalVisible = true"
          >
            Previous updates
          </Button>
        </div>
      </div>
    </template>
  </Card>

  <PermitModal
    v-model:visible="permitModalVisible"
    :activity-id="permit.activityId"
    :permit="permit"
  />
  <NotesModal
    v-model:visible="notesModalVisible"
    :permit="permit"
    :permit-name="permitTypeName"
  />
</template>

<style scoped lang="scss">
.key {
  color: #38598a;
}

.p-card {
  border-radius: 1em;
  :deep(.p-card-content) {
    padding-bottom: 0;
    padding-top: 0.75rem;
  }

  :deep(.p-card-title) {
    margin-bottom: 0rem;
  }

  :deep(.p-card-body) {
    border-style: solid;
    border-width: 0.06em;
    border-radius: 1em;
    border-color: #05366260;
    box-shadow: 0em 0.1em 0.1em 0.1em #0000001a;
  }

  &.completed {
    :deep(.p-card-body) {
      background-color: #05366210;
    }
  }

  &.selected {
    :deep(.p-card-body) {
      outline: 2px solid #2e5dd7;
      outline-offset: 5px;
    }
  }
}

.darkgrey {
  color: #605e5c;
}

.previous-updates {
  border: 0rem;
  padding-top: 1rem;
  text-decoration: underline;
  text-underline-offset: 0.175rem;
}
</style>
