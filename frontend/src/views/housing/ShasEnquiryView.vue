<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import ShasEnquiryForm from '@/components/housing/intake/ShasEnquiryForm.vue';
import EnquiryFormNavigator from '@/components/housing/enquiry/EnquiryFormNavigator.vue';

import { PermissionService } from '@/services';
import { PERMISSIONS } from '@/services/permissionService';

import type { Ref } from 'vue';

// Props
type Props = {
  activityId: string;
  enquiryId: string;
};

const props = withDefaults(defineProps<Props>(), {});

// State
const loading: Ref<boolean> = ref(true);

// Store
const permissionService = new PermissionService();

// Actions
// const getTitle = computed(() =>
//   permissionService.can(PERMISSIONS.HOUSING_ENQUIRY_READ) ? 'Enquiries' : 'My drafts and enquiries'
// );
// Actions
onMounted(async () => {
  loading.value = false;
  console.log('props', props);
});
</script>

<template>
  <!-- <h1>{{ getTitle }}</h1> -->

  <EnquiryFormNavigator
    v-if="permissionService.can(PERMISSIONS.HOUSING_ENQUIRY_UPDATE)"
    :activity-id="props.activityId"
    :enquiry-id="props.enquiryId"
  />

  <ShasEnquiryForm v-else />
</template>
