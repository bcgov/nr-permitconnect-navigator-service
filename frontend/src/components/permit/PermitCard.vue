<script setup lang="ts">
import { ref } from 'vue';

import PermitModal from '@/components/permit/PermitModal.vue';
import { Button, Card, useConfirm, useToast } from '@/lib/primevue';
import { permitService } from '@/services';
import { formatDate } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
type Props = {
  permit: Permit;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// Emits
const emit = defineEmits(['permit:delete']);

// State
const cardData: Ref<Permit> = ref(props.permit);
const permitModalVisible: Ref<boolean> = ref(false);

// Actions
const confirm = useConfirm();
const toast = useToast();

const confirmDelete = (data: Permit) => {
  if (data.permitId) {
    confirm.require({
      message: 'Please confirm that you want to delete the selected permit. This cannot be undone.',
      header: 'Confirm delete',
      acceptLabel: 'Confirm',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      accept: () => {
        permitService
          .deletePermit(data.permitId)
          .then(() => {
            emit('permit:delete', data);
            permitModalVisible.value = false;
            toast.success('Permit deleted');
          })
          .catch(() => {});
      }
    });
  }
};

async function onPermitSubmit(data: Permit) {
  await permitService.updatePermit({ ...data, submissionId: props.submissionId });

  cardData.value = {
    ...data,
    submittedDate: data.submittedDate ? new Date(data.submittedDate).toISOString() : undefined,
    adjudicationDate: data.adjudicationDate ? new Date(data.adjudicationDate).toISOString() : undefined
  };

  permitModalVisible.value = false;

  toast.success('Permit saved');
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex px-3 pt-2">
        <div class="flex-auto">
          <h2>{{ cardData.permitType?.name }}</h2>
        </div>
        <div class="flex justify-content-right">
          <Button
            class="p-button-lg p-button-outlined"
            aria-label="Edit"
            @click="permitModalVisible = true"
          >
            <font-awesome-icon icon="fa-solid fa-edit" />
            &nbsp; Edit
          </Button>
        </div>
      </div>
    </template>
    <template #content>
      <div class="grid nested-grid">
        <!-- Left column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Last updated:</span>
              {{ cardData.updatedAt ? formatDate(cardData.updatedAt) : undefined }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Updated by:</span>
              {{ cardData.updatedBy }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Needed:</span>
              {{ cardData.needed }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Permit state:</span>
              {{ cardData.status }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Agency:</span>
              {{ cardData.permitType?.agency }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Business domain:</span>
              {{ cardData.permitType?.businessDomain }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Source system:</span>
              {{ cardData.permitType?.sourceSystem }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Permit ID:</span>
              {{ cardData.issuedPermitId }}
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
              <span class="key font-bold">Auth status:</span>
              {{ cardData.authStatus }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Submitted date:</span>
              {{ cardData.submittedDate ? formatDate(cardData.submittedDate) : undefined }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Adjudication date:</span>
              {{ cardData.adjudicationDate ? formatDate(cardData.adjudicationDate) : undefined }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <PermitModal
    v-model:visible="permitModalVisible"
    :permit="cardData"
    @permit:delete="confirmDelete"
    @permit:submit="onPermitSubmit"
  />
</template>

<style lang="scss">
h2 {
  margin: 0;
}

p {
  margin-top: 0;
  margin-bottom: 0;
}

.key {
  color: #38598a;
}

.p-card {
  border-style: solid;
  border-width: 1px;

  .p-card-body {
    padding-top: 0;
    padding-bottom: 0;

    .p-card-content {
      padding-bottom: 0;
    }
  }
}
</style>
