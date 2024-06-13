<script setup lang="ts">
import { onMounted, ref } from 'vue';

import ShasEnquiryForm from '@/components/housing/intake/ShasEnquiryForm.vue';
import { PermissionService } from '@/services';
import { useEnquiryStore } from '@/store';
import { PERMISSIONS } from '@/services/permissionService';

import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';

// Props
type Props = {
  activityId?: string;
  enquiryId?: string;
};

const props = withDefaults(defineProps<Props>(), {
  activityId: undefined,
  enquiryId: undefined
});

// State
const loading: Ref<boolean> = ref(true);

// Store
const enquiryStore = useEnquiryStore();
const { getEnquiry } = storeToRefs(enquiryStore);
const permissionService = new PermissionService();
</script>

<template>
  <div v-if="!loading">
    <ShasEnquiryForm v-if="permissionService.can(PERMISSIONS.HOUSING_ENQUIRY_PROPONENT_READ)" />
  </div>
</template>
