<script setup lang="ts">
import { provide } from 'vue';

import ContactPage from '@/components/contact/ContactPage.vue';
import { electrificationProjectService } from '@/services';
import { projectServiceKey } from '@/utils/keys';

// Props
const { contactId } = defineProps<{
  contactId: string;
}>();

provide(projectServiceKey, electrificationProjectService);
</script>

<template>
  <ContactPage :contact-id="contactId" />
</template>
