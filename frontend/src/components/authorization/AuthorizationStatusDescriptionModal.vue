<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AuthorizationStatePill from '@/components/authorization/AuthorizationStatePill.vue';
import { Dialog } from '@/lib/primevue';
import { PermitState } from '@/utils/enums/permit';

// Compossables
const { t } = useI18n();

// State
const visible = defineModel<boolean>('visible');
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6/12"
  >
    <template #header>
      <span class="p-dialog-title">{{ t('authorization.authorizationStatusDescriptionModal.header') }}</span>
    </template>
    <h4 class="mb-6">{{ t('authorization.authorizationStatusDescriptionModal.applicationStages') }}</h4>
    <div>{{ t('authorization.authorizationStatusDescriptionModal.reviewProcess') }}</div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">{{ t('authorization.authorizationStatusDescriptionModal.submission') }}</div>
      <div>
        {{ t('authorization.authorizationStatusDescriptionModal.submissionDescription') }}
      </div>
    </div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">
        {{ t('authorization.authorizationStatusDescriptionModal.technicalReview') }}
      </div>
      <div>
        {{ t('authorization.authorizationStatusDescriptionModal.technicalReviewDescription') }}
      </div>
    </div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">{{ t('authorization.authorizationStatusDescriptionModal.pending') }}</div>
      <div>
        {{ t('authorization.authorizationStatusDescriptionModal.pendingDescription') }}
      </div>
    </div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">{{ t('authorization.authorizationStatusDescriptionModal.post') }}</div>
      <div>
        {{ t('authorization.authorizationStatusDescriptionModal.postDescription') }}
      </div>
    </div>

    <h4 class="mb-6">{{ t('authorization.authorizationStatusDescriptionModal.appplicationStatuses') }}</h4>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.INITIAL_REVIEW" />
      </div>
      <div class="mt-2">{{ t('authorization.stateDescriptions.initialReview') }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.ACCEPTED" />
      </div>
      <div class="mt-2">{{ t('authorization.stateDescriptions.accepted') }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.IN_PROGRESS" />
      </div>
      <div class="mt-2">{{ t('authorization.stateDescriptions.inProgress') }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.PENDING_CLIENT" />
      </div>
      <div class="mt-2">
        {{ t('authorization.stateDescriptions.pendingClient') }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.WITHDRAWN" />
      </div>
      <div class="mt-2">{{ t('authorization.stateDescriptions.withdrawn') }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.CANCELLED" />
      </div>
      <div class="mt-2">{{ t('authorization.stateDescriptions.cancelled') }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.REJECTED" />
      </div>
      <div class="mt-2">
        {{ t('authorization.stateDescriptions.rejected') }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.DENIED" />
      </div>
      <div class="mt-2">
        {{ t('authorization.stateDescriptions.denied') }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.APPROVED" />
      </div>
      <div class="mt-2">
        {{ t('authorization.stateDescriptions.approved') }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatePill :state="PermitState.ISSUED" />
      </div>
      <div class="mt-2">
        {{ t('authorization.stateDescriptions.issued') }}
      </div>
    </div>
  </Dialog>
</template>
