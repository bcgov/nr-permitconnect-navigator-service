<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Card, Divider } from '@/lib/primevue';
import { userService } from '@/services';
import { formatDateShort } from '@/utils/formatters';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Enquiry } from '@/types';

// Props
type Props = {
  enquiry: Enquiry;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const userName: Ref<string> = ref('');

// Actions
onMounted(() => {
  if (props.enquiry.createdBy) {
    userService.searchUsers({ userId: [props.enquiry.createdBy] }).then((res) => {
      userName.value = res?.data.length ? res?.data[0].fullName : '';
    });
  }
});
</script>

<template>
  <Card :id="props.enquiry.enquiryId">
    <template #title>
      <div class="flex align-items-center">
        <div class="flex-grow-1">
          <h3 class="mb-0">
            <!-- Enquiry: -->
            <router-link
              :to="{
                name: RouteName.HOUSING_ENQUIRY,
                query: { activityId: props.enquiry.activityId, enquiryId: props.enquiry.enquiryId }
              }"
            >
              {{ props.enquiry.activityId }}
            </router-link>
          </h3>
        </div>
      </div>
      <Divider type="solid" />
    </template>
    <template #content>
      <div class="grid nested-grid">
        <!-- Left column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Date:</span>
              {{ props.enquiry.submittedAt ? formatDateShort(props.enquiry.submittedAt) : undefined }}
            </p>
          </div>
        </div>
        <!-- Middle column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Author:</span>
              {{ userName }}
            </p>
          </div>
        </div>
        <!-- Right column -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="grid">
            <p class="col-12">
              <span class="key font-bold">Submission type:</span>
              {{ props.enquiry.enquiryType }}
            </p>
          </div>
        </div>
        <p class="col-12 mt-0 mb-0 enquiry-content">{{ props.enquiry.enquiryDescription }}</p>
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

.p-card {
  border-style: solid;
  border-width: 1px;

  :deep(.p-card-content) {
    padding-bottom: 0;
  }
}

.enquiry-content {
  white-space: pre;
  text-wrap: balance;
}
</style>
