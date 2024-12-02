<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watchEffect } from 'vue';

import StatusPill from '@/components/common/StatusPill.vue';
import PermitModal from '@/components/permit/PermitModal.vue';
import NotesModal from '@/components/permit/NotesModal.vue';
import { Button, Card, Divider } from '@/lib/primevue';
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
const cardData = computed(() => permit);
const cardUpdatedBy: Ref<string> = ref('');
const permitModalVisible: Ref<boolean> = ref(false);
const NotesModalVisible: Ref<boolean> = ref(false);
const permitType: Ref<PermitType | undefined> = ref(
  getPermitTypes.value.find((x) => x.permitTypeId === permit.permitTypeId)
);

// Actions
watchEffect(() => {
  if (cardData.value.updatedBy) {
    userService
      .searchUsers({ userId: [cardData.value.updatedBy] })
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
  <Card :class="{ completed: isCompleted(cardData.authStatus), selected: NotesModalVisible }">
    <template #title>
      <div class="flex align-items-center">
        <div class="flex-grow-1">
          <h3 class="mb-0">{{ permitType?.name }}</h3>
          <p class="text-xs font-italic pt-2 darkgrey">
            <span>Last updated:</span>
            <span>{{ cardData.updatedAt ? ` ${formatDateTime(cardData.updatedAt)}` : undefined }}</span>
          </p>
        </div>
        <div class="flex justify-center flex-wrap gap-2 align-items-center">
          <StatusPill
            v-if="permit.authStatus !== PermitAuthorizationStatus.NONE"
            :auth-status="permit.authStatus"
          />
          <Button
            class="p-button-outlined"
            aria-label="Add updates"
            :disabled="!editable || !useAuthZStore().can(Initiative.HOUSING, Resource.PERMIT, Action.UPDATE)"
            @click="NotesModalVisible = true"
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
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid nested-grid">
        <!-- Left column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Permit state:</span>
              {{ cardData.status }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Agency:</span>
              {{ permitType?.agency }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Business domain:</span>
              {{ permitType?.businessDomain }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Source system:</span>
              {{ permitType?.sourceSystem }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Needed:</span>
              {{ cardData.needed }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Submitted date:</span>
              {{ cardData.submittedDate ? formatDate(cardData.submittedDate) : undefined }}
            </p>

            <p class="col-12">
              <span class="key font-bold">Status verified date:</span>
              {{ cardData.statusLastVerified ? formatDate(cardData.statusLastVerified) : undefined }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Status:</span>
              {{ cardData.status }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Tracking ID:</span>
              {{ cardData.trackingId }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Adjudication date:</span>
              {{ cardData.adjudicationDate ? formatDate(cardData.adjudicationDate) : undefined }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Issued Permit ID:</span>
              {{ cardData.issuedPermitId }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Updated by:</span>
              {{ cardUpdatedBy }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <PermitModal
    v-model:visible="permitModalVisible"
    :activity-id="cardData.activityId"
    :permit="cardData"
  />
  <NotesModal
    v-model:visible="NotesModalVisible"
    :permit="cardData"
  />
</template>

<style scoped lang="scss">
p {
  margin-top: 0;
  margin-bottom: 0;
}

.key {
  color: #38598a;
}

.p-card {
  border-radius: 1em;
  :deep(.p-card-content) {
    padding-bottom: 0;
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
</style>
