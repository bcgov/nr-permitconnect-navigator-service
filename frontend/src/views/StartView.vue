<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { Breadcrumb, Button } from '@/lib/primevue';
import { RouteNames } from '@/utils/constants';
import { useAuthStore } from '@/store';
import type { Ref } from 'vue';

// State
const shasOrEnquiry: Ref<string | null> = ref(null);

// Store
const { getIsAuthenticated } = storeToRefs(useAuthStore());
const crumbItems = ref([{ label: 'Home' }, { label: 'Single Housing Application Service' }]);

// Actions
const router = useRouter();
</script>

<template>
  <div class="flex justify-content-left">
    <Breadcrumb :model="crumbItems" />
  </div>
  <div
    v-if="shasOrEnquiry === null"
    class="container text-left pl-6 pt-4 pr-6"
  >
    <h4>Start a Single Housing Application form</h4>
    <div class="border-1 border-solid border-round border-300 p-3 flex justify-content-between align-items-center">
      <span>Apply for the Single Housing Application Service if you are working or getting started on a project</span>
      <Button @click="shasOrEnquiry = 'shas'">Start application</Button>
    </div>

    <h4>Submit an enquiry</h4>
    <div class="border-1 border-solid border-round border-300 p-3 flex justify-content-between align-items-center">
      Submit and enquiry if you have general questions, urgent requests, or want an update on your Application
      <Button @click="shasOrEnquiry = 'enquiry'">Start application</Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.p-breadcrumb {
  border: none;
}
</style>
