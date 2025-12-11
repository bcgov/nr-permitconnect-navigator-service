<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthorizationStatusPill from '@/components/authorization/AuthorizationStatusPill.vue';
import StatusPill from '@/components/common/StatusPill.vue';
import { Button, Card, useToast } from '@/lib/primevue';
import { PermitState } from '@/utils/enums/permit';
import { formatDateOnly, formatDateTime } from '@/utils/formatters';

import type { Permit } from '@/types';

// Props
const { permit } = defineProps<{
  permit: Permit;
}>();

// Emits
const emit = defineEmits(['authorizationCard:more']);

// Composables
const { t } = useI18n();

// State
const trackingNotShownToProponent = computed(() => permit.permitTracking?.filter((pt) => !pt.shownToProponent));
const trackingShownToProponent = computed(() => permit.permitTracking?.find((pt) => pt.shownToProponent));

// Actions
const toast = useToast();

function toCopy(toCopy: string) {
  navigator.clipboard.writeText(toCopy);
  toast.info(t('authorization.authorizationCard.copiedToClipboard'));
}
</script>

<template>
  <Card>
    <template #title>
      <div
        class="flex justify-between cursor-pointer hover:underline"
        @click="emit('authorizationCard:more')"
      >
        <h4 class="mb-0">{{ permit.permitType?.name }}</h4>
        <Button
          class="p-button-outlined mr-4 mb-4 size-fit"
          :label="t('authorization.authorizationCard.more')"
          @click="emit('authorizationCard:more')"
        />
      </div>
    </template>
    <template #content>
      <div class="flex gap-2">
        <span :class="permit.state !== PermitState.NONE ? 'pb-4' : ''">
          <AuthorizationStatusPill
            v-if="permit.state !== PermitState.NONE"
            :state="permit.state"
          />
        </span>
        <StatusPill
          :stage="permit.stage"
          :border-color="'var(--p-bcblue-900)'"
          :bg-color="'var(--p-bcblue-50)'"
        />
      </div>
      <div class="grid grid-cols-[1fr_1fr_1fr] pt-2 pb-2 pr-2 gap-4">
        <div class="bg-[var(--p-bcblue-50)] py-5 pl-5">
          <div class="mb-2 text-xs">{{ t('authorization.authorizationCard.ids') }}</div>
          <div
            v-if="trackingShownToProponent"
            class="my-2"
          >
            <font-awesome-icon
              class="mr-2"
              icon="fa-solid fa-eye"
            />
            <span
              v-tooltip.right="t('authorization.authorizationCard.clickToCopy')"
              class="cursor-pointer"
              @click="toCopy(trackingShownToProponent.trackingId as string)"
            >
              <span class="font-bold">
                {{ trackingShownToProponent.sourceSystemKind?.description }}
              </span>
              :
              {{ trackingShownToProponent.trackingId }}
            </span>
          </div>
          <div
            v-for="permitTracking in trackingNotShownToProponent"
            :key="permitTracking.permitTrackingId"
            class="my-2"
          >
            <span
              v-tooltip.right="t('authorization.authorizationCard.clickToCopy')"
              class="cursor-pointer"
              @click="toCopy(permitTracking.trackingId as string)"
            >
              <span class="font-bold">{{ permitTracking.sourceSystemKind?.description }}</span>
              :
              {{ permitTracking.trackingId }}
            </span>
          </div>
          <div>
            <span
              v-tooltip.right="t('authorization.authorizationCard.clickToCopy')"
              class="cursor-pointer"
              @click="toCopy(permit.issuedPermitId as string)"
            >
              <span class="font-bold">{{ t('authorization.authorizationCard.issuedPermitId') }}:</span>
              {{ permit.issuedPermitId }}
            </span>
          </div>
        </div>
        <div class="bg-[var(--p-bcblue-50)] py-5 px-4">
          <div class="text-xs">{{ t('authorization.authorizationCard.dates') }}</div>
          <div class="my-2">
            <span class="font-bold">{{ t('authorization.authorizationCard.statusVerified') }}:</span>
            <span
              v-if="permit.statusLastVerified"
              class="ml-1"
            >
              {{ formatDateOnly(permit.statusLastVerified) }}
            </span>
          </div>
          <div class="my-2">
            <span class="font-bold">{{ t('authorization.authorizationCard.statusChangeDate') }}:</span>
            <span
              v-if="permit.statusLastChanged"
              class="ml-1"
            >
              {{ formatDateOnly(permit.statusLastChanged) }}
            </span>
          </div>
          <div class="my-2">
            <span class="font-bold">{{ t('authorization.authorizationCard.submittedDate') }}:</span>
            <span
              v-if="permit.submittedDate"
              class="ml-1"
            >
              {{ formatDateOnly(permit.submittedDate) }}
            </span>
          </div>
          <div class="my-2">
            <span class="font-bold">{{ t('authorization.authorizationCard.decisionDate') }}:</span>
            <span
              v-if="permit.decisionDate"
              class="ml-1"
            >
              {{ formatDateOnly(permit.decisionDate) }}
            </span>
          </div>
        </div>
        <div
          v-if="permit.permitNote?.length"
          class="pb-2 mt-2 mr-3"
        >
          <span>{{ ' ' + formatDateTime(permit.permitNote[0]!.createdAt) }},</span>
          {{ permit.permitNote[0]!.note }}
        </div>
      </div>
    </template>
  </Card>
</template>
