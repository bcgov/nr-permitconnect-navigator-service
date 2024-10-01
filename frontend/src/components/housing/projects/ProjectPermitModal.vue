<script setup lang="ts">
import { ref } from 'vue';

import SearchUserNameById from '@/components/common/SearchUserNameById.vue';
import EnquiryIntakeConfirmation from '@/components/housing/enquiry/EnquiryIntakeConfirmation.vue';
import ProjectStatus from '@/components/housing/projects/ProjectStatus.vue';
import { Button, Dialog, Textarea } from '@/lib/primevue';
import { PermitAuthorizationStatus } from '@/utils/enums/housing';
import { formatDate } from '@/utils/formatters';

import type { Permit, PermitType } from '@/types';
import type { Ref } from 'vue';

// Types
type CombinedPermit = Permit & PermitType;

// Props
const { permit, confirmationId = '' } = defineProps<{
  permit: CombinedPermit | undefined;
  confirmationId?: string;
}>();

// State
const enquiryDescription: Ref<string> = ref('');
const showEnquiryTextarea: Ref<boolean> = ref(false);
const visible = defineModel<boolean | undefined>('visible');

// Actions
const emits = defineEmits(['onHide', 'onSumbitEnquiry']);

const handleCloseDialog = () => {
  emits('onHide');
  enquiryDescription.value = '';
  showEnquiryTextarea.value = false;
};

const handleShowEnquiry = () => {
  if (!enquiryDescription.value) {
    enquiryDescription.value = `Re: ${permit?.name}\nTracking ID: ${permit?.trackingId}\n`;
  }

  showEnquiryTextarea.value = true;
};

const onSubmitEnquiry = () => {
  if (enquiryDescription.value) emits('onSumbitEnquiry', enquiryDescription.value);
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :draggable="false"
    :modal="true"
    class="app-info-dialog w-6 dialog-container"
    @hide="handleCloseDialog"
  >
    <template #header>
      <span class="p-dialog-title">{{ permit?.businessDomain }}: {{ permit?.name }}</span>
    </template>
    <template #default>
      <div v-if="!confirmationId">
        <div class="status-card">
          <ProjectStatus :auth-status="permit?.authStatus" />
          <div class="mt-3">
            <span class="mr-2">Status verified date:</span>
            <span>{{ formatDate(permit?.statusLastVerified) }}</span>
          </div>
          <div
            v-if="permit?.authStatus === PermitAuthorizationStatus.PENDING"
            class="mt-6"
          >
            <div class="font-bold">Pending your action</div>
            <div class="mt-2">
              This application is pending your action. Please go to the application system for more details.
            </div>
          </div>
        </div>
        <div class="grid mt-4">
          <div class="col-6 flex">
            <div class="mr-1 permit-label">Tracking ID:</div>
            <div
              v-tooltip="{ value: permit?.trackingId }"
              class="font-bold permit-data"
            >
              {{ permit?.trackingId }}
            </div>
          </div>
          <div class="col-6 flex">
            <div class="mr-1 permit-label">Submitted date:</div>
            <div
              v-tooltip="{ value: formatDate(permit?.submittedDate) }"
              class="font-bold permit-data"
            >
              {{ formatDate(permit?.submittedDate) }}
            </div>
          </div>
          <div class="col-6 flex">
            <div class="mr-1 permit-label">Permit ID:</div>
            <div
              v-tooltip="{ value: permit?.issuedPermitId }"
              class="font-bold permit-data"
            >
              {{ permit?.issuedPermitId }}
            </div>
          </div>
          <div class="col-6 flex">
            <div class="mr-1 permit-label">Adjudication date:</div>
            <div
              v-tooltip="{ value: formatDate(permit?.adjudicationDate) }"
              class="font-bold permit-data"
            >
              {{ formatDate(permit?.adjudicationDate) }}
            </div>
          </div>
          <div class="col-6 flex">
            <div class="mr-1 permit-label">Uploaded by:</div>
            <div class="font-bold permit-data">
              <SearchUserNameById
                :key="permit?.updatedBy"
                :user-id="permit?.updatedBy"
              />
            </div>
          </div>
          <div class="col-6 flex">
            <div class="mr-1 permit-label">Status verified date:</div>
            <div
              v-tooltip="{ value: formatDate(permit?.adjudicationDate) }"
              class="font-bold permit-data"
            >
              {{ formatDate(permit?.statusLastVerified) }}
            </div>
          </div>
          <div class="col-12 flex">
            <div class="mr-1 permit-label">Agency:</div>
            <div class="font-bold">{{ permit?.agency }}</div>
          </div>
        </div>
        <div
          v-if="showEnquiryTextarea"
          class="field mt-3"
        >
          <Textarea
            v-model="enquiryDescription"
            aria-describedby="ask-navigator"
            placeholder="Ask a navigator"
            class="w-full"
            maxlength="4000"
            rows="5"
          />
          <div class="max-w-full text-center mt-5">
            <Button
              class="p-button-sm header-btn"
              label="Submit Enquiry"
              @click="onSubmitEnquiry"
            />
            <Button
              class="p-button-sm ml-3"
              outlined
              label="Cancel"
              @click="showEnquiryTextarea = !showEnquiryTextarea"
            />
          </div>
        </div>
        <div
          v-if="!showEnquiryTextarea"
          class="max-w-full text-center mt-5"
        >
          <Button
            class="p-button-sm header-btn"
            label="Ask a Navigator"
            @click="handleShowEnquiry"
          />
        </div>
      </div>
      <div v-else>
        <EnquiryIntakeConfirmation
          :assigned-activity-id="confirmationId"
          :show-header="false"
          :show-home-link="false"
        />
        <div class="max-w-full text-center mt-5">
          <Button
            class="p-button-sm ml-3"
            outlined
            label="Close"
            @click="visible = false"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
.dialog-container {
  width: 50%;
  max-height: 90%;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
}

.permit-data {
  overflow: hidden;
  text-overflow: ellipsis;
}

.permit-label {
  white-space: pre;
}

.status-card {
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid $app-proj-white-one;
  background: $app-proj-white-two;
  box-shadow: 0px 4px 4px 0px $app-proj-black;
}
</style>
