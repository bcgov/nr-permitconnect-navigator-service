<script setup lang="ts">
import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import { Dialog } from '@/lib/primevue';
import { PermitState, PermitStateDescriptions } from '@/utils/enums/permit';

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
      <span class="p-dialog-title">What does the status mean?</span>
    </template>
    <h4 class="mb-6">Application stages</h4>
    <div>The application reviewing process includes four stages.</div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">Application submission</div>
      <div>
        The application submission stage begins when an application is submitted to the Province and concludes once the
        reviewing authority has verified its completeness and deems the application complete.
      </div>
    </div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">Technical review</div>
      <div>
        The technical review stage is when the reviewing authority conducts a thorough evaluation of the application and
        prepares recommendations for making a decision. If applicable, this phase includes First Nation Consultation
        processes.
      </div>
    </div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">Pending decision</div>
      <div>
        The pending decision stage is when the decision-makers review the evaluation and recommendations and make their
        final decision.
      </div>
    </div>
    <div class="my-6">
      <div class="text-lg font-bold mb-2">Post-decision</div>
      <div>
        The post-decision stage is when a decision was made and notifications on the decision have been sent out, it
        concludes the application.
      </div>
    </div>

    <h4 class="mb-6">Application statuses</h4>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.INITIAL_REVIEW" />
      </div>
      <div class="mt-2">{{ PermitStateDescriptions.INITIAL_REVIEW }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.IN_PROGRESS" />
      </div>
      <div class="mt-2">{{ PermitStateDescriptions.IN_PROGRESS }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.PENDING_CLIENT" />
      </div>
      <div class="mt-2">
        {{ PermitStateDescriptions.PENDING_CLIENT }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.WITHDRAWN" />
      </div>
      <div class="mt-2">{{ PermitStateDescriptions.WITHDRAWN }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.CANCELLED" />
      </div>
      <div class="mt-2">{{ PermitStateDescriptions.CANCELLED }}</div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.REJECTED" />
      </div>
      <div class="mt-2">
        {{ PermitStateDescriptions.REJECTED }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.DENIED" />
      </div>
      <div class="mt-2">
        {{ PermitStateDescriptions.DENIED }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.APPROVED" />
      </div>
      <div class="mt-2">
        {{ PermitStateDescriptions.APPROVED }}
      </div>
    </div>
    <div class="my-6">
      <div class="flex">
        <AuthorizationStatusPill :state="PermitState.ISSUED" />
      </div>
      <div class="mt-2">
        {{ PermitStateDescriptions.ISSUED }}
      </div>
    </div>
  </Dialog>
</template>
