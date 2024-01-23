<script setup lang="ts">
import { ref } from 'vue';

import PermitModal from '@/components/permit/PermitModal.vue';
import { Button, Card, useToast } from '@/lib/primevue';
import { permitService } from '@/services';
import { formatDateLong } from '@/utils/formatters';

import type { Ref } from 'vue';
import type { Permit } from '@/types';

// Props
type Props = {
  permit: Permit;
  submissionId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const permitModalVisible: Ref<boolean> = ref(false);

// Actions
const toast = useToast();

async function onPermitSubmit(data: any) {
  await permitService.updatePermit({ ...data, submissionId: props.submissionId });
  toast.success('Permit saved');
  permitModalVisible.value = false;
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex px-3 pt-2">
        <div class="flex-auto">
          <h2>{{ permit.permitType?.name }}</h2>
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
              {{ formatDateLong(permit.updatedAt as string) }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Updated by:</span>
              {{ permit.updatedBy }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Needed:</span>
              {{ permit.needed }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Permit state:</span>
              {{ permit.status }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Agency:</span>
              {{ permit.permitType?.agency }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Business domain:</span>
              {{ permit.permitType?.businessDomain }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Source system:</span>
              {{ permit.permitType?.sourceSystem }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Permit ID:</span>
              {{ permit.permitId }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Tracking ID:</span>
              {{ permit.trackingId }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Auth status:</span>
              {{ permit.authStatus }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Submitted date:</span>
              {{ formatDateLong(permit.createdAt as string) }}
            </p>
            <p class="col-12">
              <span class="key font-bold">Adjudication date:</span>
              {{ formatDateLong(permit.adjudicationDate as string) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <PermitModal
    v-model:visible="permitModalVisible"
    :permit="permit"
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
