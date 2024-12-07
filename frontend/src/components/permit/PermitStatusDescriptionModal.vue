<script setup lang="ts">
import StatusPill from '@/components/common/StatusPill.vue';
import { Dialog } from '@/lib/primevue';
import { PermitAuthorizationStatus, PermitAuthorizationStatusDescriptions } from '@/utils/enums/housing';

const visible = defineModel<boolean>('visible');
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6"
  >
    <template #header>
      <span class="p-dialog-title">Application stages</span>
    </template>
    <div>The application reviewing process includes four stages.</div>
    <div class="my-4">
      <div class="text-lg font-bold mb-2">Application submission</div>
      <div>
        The technical review stage is when the reviewing authority conducts a thorough evaluation of the application in
        preparation for making a decision.
      </div>
    </div>
    <div class="my-4">
      <div class="text-lg font-bold mb-2">Technical review</div>
      <div>
        The technical review stage is when the reviewing authority conducts a thorough evaluation of the application in
        preparation for making a decision.
      </div>
    </div>
    <div class="my-4">
      <div class="text-lg font-bold mb-2">Pending decision</div>
      <div>
        The pending decision stage is when the decision-makers review the evaluation and issue their final decision.
      </div>
    </div>
    <div class="my-4">
      <div class="text-lg font-bold mb-2">Post-decision</div>
      <div>The post-decision stage is when a final decision has been made. This concludes the application.</div>
    </div>

    <div class="text-2xl font-bold mb-2">Application statuses</div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.IN_REVIEW" />
      </div>
      <div class="mt-2">{{ PermitAuthorizationStatusDescriptions.IN_REVIEW }}</div>
    </div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.PENDING" />
      </div>
      <div class="mt-2">
        {{ PermitAuthorizationStatusDescriptions.PENDING }}
      </div>
    </div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.ABANDONED" />
      </div>
      <div class="mt-2">{{ PermitAuthorizationStatusDescriptions.ABANDONED }}</div>
    </div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.WITHDRAWN" />
      </div>
      <div class="mt-2">{{ PermitAuthorizationStatusDescriptions.WITHDRAWN }}</div>
    </div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.CANCELLED" />
      </div>
      <div class="mt-2">{{ PermitAuthorizationStatusDescriptions.CANCELLED }}</div>
    </div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.DENIED" />
      </div>
      <div class="mt-2">
        {{ PermitAuthorizationStatusDescriptions.DENIED }}
      </div>
    </div>
    <div class="my-4">
      <div class="flex">
        <StatusPill :auth-status="PermitAuthorizationStatus.ISSUED" />
      </div>
      <div class="mt-2">
        {{ PermitAuthorizationStatusDescriptions.ISSUED }}
      </div>
    </div>
  </Dialog>
</template>
