<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import EnquiryCard from '@/components/enquiry/EnquiryCard.vue';
import { useProjectStore } from '@/store';

// Composables
const { t } = useI18n();

// Store
const projectStore = useProjectStore();
const { getRelatedEnquiries } = storeToRefs(projectStore);
</script>

<template>
  <div>
    <div class="flex items-center pb-2">
      <div class="grow">
        <p class="font-bold">{{ t('views.i.projectView.tabRelatedEnquiries') }} ({{ getRelatedEnquiries.length }})</p>
      </div>
    </div>
    <div
      v-for="(enquiry, index) in getRelatedEnquiries"
      :key="enquiry.enquiryId"
      :index="index"
      class="col-span-12 mb-6"
    >
      <EnquiryCard :enquiry="enquiry" />
    </div>
  </div>
</template>
