<script setup lang="ts">
import { onMounted, ref } from 'vue';

import ShasEnquiryForm from '@/components/housing/intake/ShasEnquiryForm.vue';
import EnquiryViewer from '@/components/housing/enquiry/EnquiryViewer.vue';

import { enquiryService, noteService, PermissionService } from '@/services';
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

onMounted(async () => {
  if (props.enquiryId && props.activityId) {
    const [enquiry, notes] = (
      await Promise.all([enquiryService.getEnquiry(props?.enquiryId), noteService.listNotes(props?.activityId)])
    ).map((r) => r.data);
    enquiryStore.setEnquiry(enquiry);
    enquiryStore.setNotes(notes);

    loading.value = false;
  } else {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="!loading">
    <EnquiryViewer
      v-if="permissionService.can(PERMISSIONS.HOUSING_ENQUIRY_UPDATE) && props.enquiryId && props.activityId"
      :enquiry="getEnquiry"
    />
    <ShasEnquiryForm v-else />
  </div>
</template>
