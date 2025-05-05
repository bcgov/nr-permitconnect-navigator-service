<script setup lang="ts">
import { provide } from 'vue';

import ContactPage from '@/components/contact/ContactPage.vue';
import { housingProjectService } from '@/services';
import { projectServiceKey } from '@/utils/keys';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

// Providers
provide(projectServiceKey, housingProjectService);
</script>

<template>
  <ContactPage :contact-id="contactId" />
</template>
