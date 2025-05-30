<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';

import Divider from '@/components/common/Divider.vue';
import { Card } from '@/lib/primevue';
import { userService } from '@/services';
import { useAppStore } from '@/store';
import { formatDateShort } from '@/utils/formatters';
import { Initiative, RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Enquiry } from '@/types';

// Props
const { enquiry } = defineProps<{
  enquiry: Enquiry;
}>();

// Store
const appStore = useAppStore();
const { getInitiative } = storeToRefs(appStore);

// State
const userName: Ref<string> = ref('');

// Actions
onBeforeMount(() => {
  if (enquiry.createdBy) {
    userService.searchUsers({ userId: [enquiry.createdBy] }).then((res) => {
      userName.value = res?.data.length ? res?.data[0].fullName : '';
    });
  }
});
</script>

<template>
  <Card :id="enquiry.enquiryId">
    <template #title>
      <div class="flex items-center">
        <div class="grow">
          <h3 class="mb-0">
            <router-link
              :to="{
                name:
                  getInitiative === Initiative.ELECTRIFICATION
                    ? RouteName.INT_ELECTRIFICATION_PROJECT_ENQUIRY
                    : RouteName.INT_HOUSING_PROJECT_ENQUIRY,
                params: { enquiryId: enquiry.enquiryId }
              }"
            >
              {{ enquiry.activityId }}
            </router-link>
          </h3>
        </div>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid grid-cols-12 gap-4 nested-grid">
        <!-- Left column -->
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Date:</span>
              {{ enquiry.submittedAt ? formatDateShort(enquiry.submittedAt) : undefined }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Author:</span>
              {{ userName }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <div class="grid grid-cols-12 gap-4">
            <p class="col-span-12">
              <span class="key font-bold">Submission type:</span>
              {{ enquiry.submissionType }}
            </p>
          </div>
        </div>
        <p class="col-span-12 mt-0 mb-0 enquiry-content">{{ enquiry.enquiryDescription }}</p>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss">
p {
  margin-top: 0;
  margin-bottom: 0;
}

.key {
  color: #38598a;
}

.enquiry-content {
  white-space: pre;
  text-wrap: balance;
}
</style>
